import ExpoModulesCore
import MapKit
import UIKit

struct TripTargetRecord: Record {
  @Field var key: String = ""
  @Field var title: String = ""
  @Field var latitude: Double = 0
  @Field var longitude: Double = 0
}

struct TripTarget: Equatable {
  let key: String
  let title: String
  let latitude: Double
  let longitude: Double

  var coordinate: CLLocationCoordinate2D {
    CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
  }

  init?(_ record: TripTargetRecord) {
    guard UUID(uuidString: record.key) != nil,
      !record.title.isEmpty,
      CLLocationCoordinate2DIsValid(.init(latitude: record.latitude, longitude: record.longitude))
    else { return nil }
    key = record.key
    title = String(record.title.prefix(160))
    latitude = record.latitude
    longitude = record.longitude
  }
}

@MainActor
final class ActiveTripTarget {
  static let shared = ActiveTripTarget()
  static let changed = Notification.Name("com.jouww.carplay.activeTarget")
  private(set) var value: TripTarget?

  func set(_ target: TripTarget?) {
    guard value != target else { return }
    value = target
    NotificationCenter.default.post(name: Self.changed, object: self)
  }
}

public final class JdCarPlayModule: Module {
  public func definition() -> ModuleDefinition {
    Name("JdCarPlay")
    Function("setTrip") { (record: TripTargetRecord?) in
      let target = record.flatMap(TripTarget.init)
      DispatchQueue.main.async { ActiveTripTarget.shared.set(target) }
    }
  }
}

// Expo still builds the phone's React window in its AppDelegate.
@objc(JDPhoneWindowSceneDelegate)
public final class PhoneWindowSceneDelegate: UIResponder, UIWindowSceneDelegate {
  public var window: UIWindow?

  public func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene,
      let appWindow = UIApplication.shared.delegate?.window ?? nil
    else { return }
    window = appWindow
    appWindow.windowScene = windowScene
    appWindow.makeKeyAndVisible()
    self.scene(scene, openURLContexts: options.urlContexts)
    for activity in options.userActivities {
      self.scene(scene, continue: activity)
    }
  }

  public func scene(_ scene: UIScene, openURLContexts contexts: Set<UIOpenURLContext>) {
    let app = UIApplication.shared
    for context in contexts {
      var options: [UIApplication.OpenURLOptionsKey: Any] = [.openInPlace: context.options.openInPlace]
      options[.sourceApplication] = context.options.sourceApplication
      options[.annotation] = context.options.annotation
      _ = app.delegate?.application?(app, open: context.url, options: options)
    }
  }

  public func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    let app = UIApplication.shared
    _ = app.delegate?.application?(app, continue: userActivity, restorationHandler: { _ in })
  }
}
