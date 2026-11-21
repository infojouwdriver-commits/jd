@preconcurrency import CarPlay
@preconcurrency import CoreLocation
@preconcurrency import MapKit
import UIKit

@MainActor
@objc(JDDriverCarPlaySceneDelegate)
public final class DriverCarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate,
  CPMapTemplateDelegate, CLLocationManagerDelegate, MKMapViewDelegate {
  private let map = MKMapView()
  private let template = CPMapTemplate()
  private let gps = CLLocationManager()
  private weak var interface: CPInterfaceController?
  private var targetObserver: NSObjectProtocol?
  private var directions: MKDirections?
  private var guidance: CPNavigationSession?
  private var target: TripTarget?
  private var path: CarPlayRoute?
  private var trip: CPTrip?
  private var location: CLLocation?
  private var lastRequest: Date?
  private var lastEstimate: Date?
  private var progress: CLLocationDistance?
  private var maneuver: CPManeuver?
  private var maneuverID: Int?
  private var offRouteCount = 0
  private var arrived = false
  private var rerouting = false
  private var stoppedByDriver = false

  public func templateApplicationScene(_ scene: CPTemplateApplicationScene,
    didConnect interfaceController: CPInterfaceController, to window: CPWindow) {
    interface = interfaceController
    let controller = UIViewController()
    controller.view = map
    window.rootViewController = controller
    map.delegate = self
    map.showsCompass = false
    map.isRotateEnabled = false
    map.isScrollEnabled = false
    map.isZoomEnabled = false
    template.mapDelegate = self
    interfaceController.setRootTemplate(template, animated: false, completion: nil)
    gps.delegate = self
    gps.desiredAccuracy = kCLLocationAccuracyBestForNavigation
    gps.distanceFilter = 8
    gps.activityType = .automotiveNavigation
    targetObserver = NotificationCenter.default.addObserver(forName: ActiveTripTarget.changed,
      object: ActiveTripTarget.shared, queue: .main) { [weak self] _ in
      Task { @MainActor in self?.refreshTarget() }
    }
    refreshTarget()
  }

  public func templateApplicationScene(_ scene: CPTemplateApplicationScene,
    didDisconnect interfaceController: CPInterfaceController, from window: CPWindow) {
    if let targetObserver { NotificationCenter.default.removeObserver(targetObserver) }
    targetObserver = nil
    target = nil
    reset()
    gps.stopUpdatingLocation()
    location = nil
    interface = nil
    window.rootViewController = nil
  }

  private func refreshTarget() {
    reset()
    stoppedByDriver = false
    target = ActiveTripTarget.shared.value
    guard target != nil else {
      gps.stopUpdatingLocation()
      map.showsUserLocation = false
      status(label("Choose a destination and start a trip on your iPhone.",
        "Choisissez une destination et démarrez une course sur l’iPhone.",
        "Kies een bestemming en start een rit op uw iPhone.",
        "حدّد الوجهة وابدأ الرحلة على الآيفون."))
      return
    }
    startLocation()
    if let location, isUsable(location) { requestRoute(from: location) }
  }

  private func startLocation() {
    guard target != nil, !stoppedByDriver else { return }
    let allowed = gps.authorizationStatus == .authorizedAlways || gps.authorizationStatus == .authorizedWhenInUse
    if allowed {
      map.showsUserLocation = true
      gps.startUpdatingLocation()
    } else {
      status(label("Allow location on your iPhone.",
        "Autorisez la localisation sur l’iPhone.",
        "Sta locatie toe op uw iPhone.",
        "اسمح بالموقع على الآيفون."))
    }
  }

  private func reset() {
    directions?.cancel()
    directions = nil
    guidance?.cancelTrip()
    guidance = nil
    template.hideTripPreviews()
    map.removeOverlays(map.overlays)
    trip = nil
    path = nil
    progress = nil
    maneuver = nil
    maneuverID = nil
    lastRequest = nil
    lastEstimate = nil
    offRouteCount = 0
    arrived = false
    rerouting = false
    template.trailingNavigationBarButtons = []
  }

  private func status(_ message: String) {
    guard let interface else { return }
    guard interface.presentedTemplate == nil else { return }
    let ok = CPAlertAction(title: "OK", style: .default) { [weak self] _ in
      self?.interface?.dismissTemplate(animated: true, completion: nil)
    }
    let alert = CPAlertTemplate(titleVariants: [message], actions: [ok])
    interface.presentTemplate(alert, animated: true, completion: nil)
  }

  public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    if manager.authorizationStatus == .denied || manager.authorizationStatus == .restricted {
      reset()
      manager.stopUpdatingLocation()
      map.showsUserLocation = false
      location = nil
    }
    startLocation()
  }

  private func isUsable(_ value: CLLocation) -> Bool {
    value.horizontalAccuracy >= 0 && value.horizontalAccuracy <= 45 &&
      abs(value.timestamp.timeIntervalSinceNow) <= 16 &&
      CLLocationCoordinate2DIsValid(value.coordinate)
  }

  public func locationManager(_ manager: CLLocationManager, didUpdateLocations updates: [CLLocation]) {
    guard let target, let here = updates.last, isUsable(here), !arrived, !stoppedByDriver else { return }
    location = here
    if let path, let match = path.match(here, progress: progress) {
      if match.distanceFromRoute > max(45, here.horizontalAccuracy * 1.8) {
        offRouteCount += 1
        if offRouteCount >= 2 { requestRoute(from: here) }
        return
      }
      offRouteCount = 0
      guard guidance != nil, !rerouting else { return }
      progress = path.route.distance - match.remaining
      map.setCenter(here.coordinate, animated: true)
      let destination = CLLocation(latitude: target.latitude, longitude: target.longitude)
      if match.remaining < 30 && here.distance(from: destination) < 40 {
        guidance?.finishTrip()
        guidance = nil
        arrived = true
        template.trailingNavigationBarButtons = []
        gps.stopUpdatingLocation()
        return
      }
      updateGuidance(path: path, remaining: match.remaining)
    } else {
      requestRoute(from: here)
    }
  }

  public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    guard (error as? CLError)?.code != .locationUnknown else { return }
    location = nil
    reset()
    status(label("Location is unavailable.", "La position est indisponible.",
      "Uw locatie is niet beschikbaar.", "الموقع غير متاح."))
  }

  private func requestRoute(from here: CLLocation) {
    guard let target, directions == nil, !arrived,
      lastRequest.map({ Date().timeIntervalSince($0) >= 12 }) ?? true
    else { return }
    lastRequest = Date()
    if let guidance {
      rerouting = true
      guidance.pauseTrip(for: .rerouting, description: nil)
      map.removeOverlays(map.overlays)
    }
    let request = MKDirections.Request()
    request.source = item(here.coordinate)
    request.destination = item(target.coordinate, name: target.title)
    request.transportType = .automobile
    let operation = MKDirections(request: request)
    directions = operation
    operation.calculate { [weak self, weak operation] response, _ in
      Task { @MainActor in
        guard let self, let operation, self.directions === operation, self.target == target else { return }
        self.directions = nil
        guard let route = response?.routes.first, let path = CarPlayRoute(route) else {
          if self.guidance != nil {
            self.reset()
            self.status(self.label("Route unavailable.", "Itinéraire indisponible.",
              "Route niet beschikbaar.", "المسار غير متاح."))
          }
          return
        }
        self.show(path, request: request, name: target.title)
      }
    }
  }

  private func item(_ coordinate: CLLocationCoordinate2D, name: String? = nil) -> MKMapItem {
    let item = MKMapItem(placemark: MKPlacemark(coordinate: coordinate))
    item.name = name
    return item
  }

  private func show(_ path: CarPlayRoute, request: MKDirections.Request, name: String) {
    self.path = path
    progress = 0
    offRouteCount = 0
    maneuver = nil
    maneuverID = nil
    lastEstimate = nil
    map.removeOverlays(map.overlays)
    map.addOverlay(path.route.polyline, level: .aboveRoads)
    if rerouting, let trip {
      guidance?.cancelTrip()
      guidance = template.startNavigationSession(for: trip)
      rerouting = false
      updateGuidance(path: path, remaining: path.route.distance)
      return
    }
    guard let source = request.source, let destination = request.destination else { return }
    let choice = CPRouteChoice(summaryVariants: [path.route.name.isEmpty ? name : path.route.name],
      additionalInformationVariants: [], selectionSummaryVariants: [name])
    let newTrip = CPTrip(origin: source, destination: destination, routeChoices: [choice])
    trip = newTrip
    let start = label("Start", "Démarrer", "Start", "بدء")
    let preview = CPTripPreviewTextConfiguration(startButtonTitle: start, additionalRoutesButtonTitle: nil,
      overviewButtonTitle: nil)
    template.showTripPreviews([newTrip], textConfiguration: preview)
    template.updateEstimates(estimates(path: path, distance: path.route.distance), for: newTrip)
    map.setVisibleMapRect(path.route.polyline.boundingMapRect,
      edgePadding: UIEdgeInsets(top: 60, left: 90, bottom: 60, right: 90), animated: true)
  }

  public func mapTemplate(_ mapTemplate: CPMapTemplate, startedTrip requested: CPTrip, using routeChoice: CPRouteChoice) {
    guard trip === requested, let path, let location, isUsable(location) else { return }
    mapTemplate.hideTripPreviews()
    guidance = mapTemplate.startNavigationSession(for: requested)
    template.trailingNavigationBarButtons = [CPBarButton(title: label("End", "Arrêter", "Stop", "إيقاف")) { [weak self] _ in
      self?.stopGuidance()
    }]
    map.setRegion(MKCoordinateRegion(center: location.coordinate,
      latitudinalMeters: 700, longitudinalMeters: 700), animated: true)
    updateGuidance(path: path, remaining: path.match(location, progress: nil)?.remaining ?? path.route.distance)
  }

  public func mapTemplateDidCancelNavigation(_ mapTemplate: CPMapTemplate) { stopGuidance() }

  private func stopGuidance() {
    reset()
    stoppedByDriver = true
    gps.stopUpdatingLocation()
  }

  private func updateGuidance(path: CarPlayRoute, remaining: CLLocationDistance) {
    guard let guidance, let trip,
      lastEstimate.map({ Date().timeIntervalSince($0) >= 1 }) ?? true else { return }
    lastEstimate = Date()
    let next = path.nextManeuver(remaining: remaining)
    let nextID = next?.id ?? -1
    let distance = next?.distance ?? remaining
    if maneuverID != nextID {
      let upcoming = CPManeuver()
      upcoming.instructionVariants = [next?.instruction ?? label("Continue to the destination",
        "Continuez jusqu’à destination", "Rijd verder naar de bestemming", "تابع إلى الوجهة")]
      upcoming.initialTravelEstimates = estimates(path: path, distance: distance)
      guidance.upcomingManeuvers = [upcoming]
      maneuver = upcoming
      maneuverID = nextID
    }
    if let maneuver { guidance.updateEstimates(estimates(path: path, distance: distance), for: maneuver) }
    template.updateEstimates(estimates(path: path, distance: remaining), for: trip)
  }

  private func estimates(path: CarPlayRoute, distance: CLLocationDistance) -> CPTravelEstimates {
    CPTravelEstimates(distanceRemaining: Measurement(value: max(0, distance), unit: UnitLength.meters),
      timeRemaining: path.remainingTime(distance: distance))
  }

  public func mapView(_ mapView: MKMapView, rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
    guard let polyline = overlay as? MKPolyline else { return MKOverlayRenderer(overlay: overlay) }
    let renderer = MKPolylineRenderer(polyline: polyline)
    renderer.strokeColor = UIColor(red: 0.98, green: 0.70, blue: 0.15, alpha: 1)
    renderer.lineWidth = 7
    renderer.lineJoin = .round
    renderer.lineCap = .round
    return renderer
  }

  private func label(_ en: String, _ fr: String, _ nl: String, _ ar: String) -> String {
    switch Locale.preferredLanguages.first?.prefix(2) {
    case "fr": return fr
    case "nl": return nl
    case "ar": return ar
    default: return en
    }
  }
}
