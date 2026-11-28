import CoreLocation
import MapKit

struct RouteMatch {
  let distanceFromRoute: CLLocationDistance
  let remaining: CLLocationDistance
}

struct CarPlayRoute {
  let route: MKRoute
  private let points: [MKMapPoint]
  private let offsets: [CLLocationDistance]
  private let steps: [(offset: CLLocationDistance, instruction: String)]

  init?(_ route: MKRoute) {
    let polyline = route.polyline
    guard polyline.pointCount >= 2, route.distance > 0 else { return nil }
    let points = Array(UnsafeBufferPointer(start: polyline.points(), count: polyline.pointCount))
    var offsets = [0.0]
    for index in 1..<points.count {
      offsets.append(offsets[index - 1] + points[index - 1].distance(to: points[index]))
    }
    var stepOffset = 0.0
    var steps: [(CLLocationDistance, String)] = []
    for step in route.steps {
      let instruction = step.instructions.trimmingCharacters(in: .whitespacesAndNewlines)
      if !instruction.isEmpty { steps.append((stepOffset, instruction)) }
      stepOffset += step.distance
    }
    self.route = route
    self.points = points
    self.offsets = offsets
    self.steps = steps
  }

  func match(_ location: CLLocation, progress: CLLocationDistance?) -> RouteMatch? {
    let point = MKMapPoint(location.coordinate)
    guard let length = offsets.last, length > 0 else { return nil }
    var closest: (distance: Double, progress: Double, score: Double)?
    for index in 1..<points.count {
      let start = points[index - 1]
      let end = points[index]
      let width = end.x - start.x
      let height = end.y - start.y
      let squared = width * width + height * height
      guard squared > 0 else { continue }
      let fraction = min(1, max(0, ((point.x - start.x) * width + (point.y - start.y) * height) / squared))
      let projected = MKMapPoint(x: start.x + fraction * width, y: start.y + fraction * height)
      let metres = point.distance(to: projected)
      let offset = offsets[index - 1] + fraction * (offsets[index] - offsets[index - 1])
      let distanceFromLast = offset - (progress ?? 0)
      let score = metres + max(0, -distanceFromLast - 25) * 0.08 + max(0, distanceFromLast - 110) * 0.12
      if score < (closest?.score ?? .infinity) { closest = (metres, offset, score) }
    }
    guard let closest else { return nil }
    return RouteMatch(distanceFromRoute: closest.distance, remaining: max(0, (1 - closest.progress / length) * route.distance))
  }

  func nextManeuver(remaining: CLLocationDistance) -> (id: Int, instruction: String, distance: CLLocationDistance)? {
    let travelled = max(0, route.distance - remaining)
    guard let next = steps.enumerated().first(where: { $0.element.offset > travelled + 12 }) else { return nil }
    return (next.offset, next.element.instruction, min(remaining, next.element.offset - travelled))
  }

  func remainingTime(distance: CLLocationDistance) -> TimeInterval {
    max(0, route.expectedTravelTime * distance / route.distance)
  }
}
