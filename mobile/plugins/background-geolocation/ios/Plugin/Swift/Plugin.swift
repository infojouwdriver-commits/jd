import Capacitor
import Foundation
import UIKit
import CoreLocation

// Avoids a bewildering type warning.
let null = Optional<Double>.none as Any

func formatLocation(_ location: CLLocation) -> PluginCallResultData {
    var simulated = false;
    if #available(iOS 15, *) {
        // Prior to iOS 15, it was not possible to detect simulated locations.
        // But in general, it is very difficult to simulate locations on iOS in
        // production.
        if location.sourceInformation != nil {
            simulated = location.sourceInformation!.isSimulatedBySoftware;
        }
    }
    return [
        "latitude": location.coordinate.latitude,
        "longitude": location.coordinate.longitude,
        "accuracy": location.horizontalAccuracy,
        "altitude": location.altitude,
        "altitudeAccuracy": location.verticalAccuracy,
        "simulated": simulated,
        "speed": location.speed < 0 ? null : location.speed,
        "bearing": location.course < 0 ? null : location.course,
        "time": NSNumber(
            value: Int(
                location.timestamp.timeIntervalSince1970 * 1000
            )
        ),
    ]
}

class Watcher {
    let callbackId: String
    var tripOwner: String?
    var tripKey: String?
    let locationManager: CLLocationManager = CLLocationManager()
    private let created = Date()
    private let allowStale: Bool
    private var isUpdatingLocation: Bool = false
    init(_ id: String, stale: Bool) {
        callbackId = id
        allowStale = stale
    }
    func start() {
        // Avoid unnecessary calls to startUpdatingLocation, which can
        // result in extraneous invocations of didFailWithError.
        if !isUpdatingLocation {
            locationManager.startUpdatingLocation()
            isUpdatingLocation = true
        }
    }
    func stop() {
        if isUpdatingLocation {
            locationManager.stopUpdatingLocation()
            isUpdatingLocation = false
        }
    }
    func isLocationValid(_ location: CLLocation) -> Bool {
        return (
            allowStale ||
            location.timestamp >= created
        )
    }
}

@objc(BackgroundGeolocation)
public class BackgroundGeolocation: CAPPlugin,
                                    CAPBridgedPlugin,
                                    CLLocationManagerDelegate {
    private var watchers = [Watcher]()
    public let identifier = "BackgroundGeolocation"
    public let jsName = "BackgroundGeolocation"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "addWatcher", returnType: CAPPluginReturnCallback),
        CAPPluginMethod(name: "removeWatcher", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readTripPoints", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearTripPoints", returnType: CAPPluginReturnPromise)
    ]

    @objc public override func load() {
        UIDevice.current.isBatteryMonitoringEnabled = true
    }

    @objc func addWatcher(_ call: CAPPluginCall) {
        call.keepAlive = true

        // CLLocationManager requires main thread
        DispatchQueue.main.async {
            let background = call.getString("backgroundMessage") != nil
            let watcher = Watcher(
                call.callbackId,
                stale: call.getBool("stale") ?? false
            )
            if background {
                guard let owner = call.getString("tripOwner"), let key = call.getString("tripKey") else {
                    call.reject("Active trip identity required", "TRIP_IDENTITY_REQUIRED"); return
                }
                do { _ = try TripPointJournal.shared.read(owner: owner, trip: key, after: Double.greatestFiniteMagnitude) }
                catch { call.reject("Native trip journal unavailable", "JOURNAL_ERROR"); return }
                watcher.tripOwner = owner; watcher.tripKey = key
            }
            let manager = watcher.locationManager
            manager.delegate = self
            let externalPower = [
                .full,
                .charging
            ].contains(UIDevice.current.batteryState)
            manager.desiredAccuracy = (
                externalPower
                ? kCLLocationAccuracyBestForNavigation
                : kCLLocationAccuracyBest
            )
            var distanceFilter = call.getDouble("distanceFilter")
            // It appears that setting manager.distanceFilter to 0 can prevent
            // subsequent location updates. See issue #88.
            if distanceFilter == nil || distanceFilter == 0 {
                distanceFilter = kCLDistanceFilterNone
            }
            manager.distanceFilter = distanceFilter!
            manager.allowsBackgroundLocationUpdates = background
            manager.showsBackgroundLocationIndicator = background
            manager.pausesLocationUpdatesAutomatically = false
            self.watchers.append(watcher)
            if call.getBool("requestPermissions") != false {
                let status = CLLocationManager.authorizationStatus()
                if [
                    .notDetermined,
                    .denied,
                    .restricted,
                ].contains(status) {
                    return (
                        background
                        ? manager.requestAlwaysAuthorization()
                        : manager.requestWhenInUseAuthorization()
                    )
                }
                if (
                    background && status == .authorizedWhenInUse
                ) {
                    // Attempt to escalate.
                    manager.requestAlwaysAuthorization()
                }
            }
            return watcher.start()
        }
    }

    @objc func removeWatcher(_ call: CAPPluginCall) {
        // CLLocationManager requires main thread
        DispatchQueue.main.async {
            if let callbackId = call.getString("id") {
                if let index = self.watchers.firstIndex(
                    where: { $0.callbackId == callbackId }
                ) {
                    self.watchers[index].locationManager.stopUpdatingLocation()
                    self.watchers.remove(at: index)
                }
                if let savedCall = self.bridge?.savedCall(withID: callbackId) {
                    self.bridge?.releaseCall(savedCall)
                }
                return call.resolve()
            }
            return call.reject("No callback ID")
        }
    }

    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let settingsUrl = URL(
                string: UIApplication.openSettingsURLString
            ) else {
                return call.reject("No link to settings available")
            }

            if UIApplication.shared.canOpenURL(settingsUrl) {
                UIApplication.shared.open(settingsUrl, completionHandler: {
                    (success) in
                    if (success) {
                        return call.resolve()
                    } else {
                        return call.reject("Failed to open settings")
                    }
                })
            } else {
                return call.reject("Cannot open settings")
            }
        }
    }

    public func locationManager(
        _ manager: CLLocationManager,
        didFailWithError error: Error
    ) {
        if let watcher = self.watchers.first(
            where: { $0.locationManager == manager }
        ) {
            if let call = self.bridge?.savedCall(withID: watcher.callbackId) {
                if let clErr = error as? CLError {
                    if clErr.code == .locationUnknown {
                        // This error is sometimes sent by the manager if
                        // it cannot get a fix immediately.
                        return
                    } else if (clErr.code == .denied) {
                        watcher.stop()
                        return call.reject(
                            "Permission denied.",
                            "NOT_AUTHORIZED"
                        )
                    }
                }
                return call.reject(error.localizedDescription, nil, error)
            }
        }
    }

    public func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let watcher = self.watchers.first(where: { $0.locationManager == manager }) else { return }
        for location in locations.sorted(by: { $0.timestamp < $1.timestamp }) where watcher.isLocationValid(location) {
            let point = formatLocation(location)
            if location.horizontalAccuracy < 0 { continue }
            if #available(iOS 15, *), location.sourceInformation?.isSimulatedBySoftware == true { continue }
            do {
                if let owner = watcher.tripOwner, let trip = watcher.tripKey {
                    // Replace optional nil sentinels with JSON null for encrypted serialization.
                    var persisted: [String: Any] = ["latitude": location.coordinate.latitude, "longitude": location.coordinate.longitude,
                        "accuracy": location.horizontalAccuracy, "time": Int(location.timestamp.timeIntervalSince1970 * 1000)]
                    if location.speed >= 0 { persisted["speed"] = location.speed }
                    try TripPointJournal.shared.append(owner: owner, trip: trip, point: persisted)
                }
                self.bridge?.savedCall(withID: watcher.callbackId)?.resolve(point)
            } catch {
                watcher.stop()
                self.bridge?.savedCall(withID: watcher.callbackId)?.reject("Native location persistence failed", "JOURNAL_ERROR")
                return
            }
        }
    }

    @objc func readTripPoints(_ call: CAPPluginCall) {
        do {
            guard let owner = call.getString("owner"), let key = call.getString("key") else { throw NSError(domain: "TripJournal", code: 1) }
            let points = try TripPointJournal.shared.read(owner: owner, trip: key, after: call.getDouble("after") ?? 0)
            call.resolve(["points": points])
        } catch { call.reject("Native trip journal cannot be read", "JOURNAL_ERROR") }
    }
    @objc func clearTripPoints(_ call: CAPPluginCall) {
        do {
            guard let owner = call.getString("owner"), let key = call.getString("key") else { throw NSError(domain: "TripJournal", code: 1) }
            try TripPointJournal.shared.clear(owner: owner, trip: key); call.resolve()
        } catch { call.reject("Native trip journal cannot be cleared", "JOURNAL_ERROR") }
    }

    public func locationManager(
        _ manager: CLLocationManager,
        didChangeAuthorization status: CLAuthorizationStatus
    ) {
        // If this method is called before the user decides on a permission, as
        // it is on iOS 14 when the permissions dialog is presented, we ignore
        // it.
        if status == .authorizedAlways || status == .authorizedWhenInUse {
            if let watcher = self.watchers.first(
                where: { $0.locationManager == manager }
            ) {
                return watcher.start()
            }
        }
    }
}

