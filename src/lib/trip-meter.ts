export interface MeterPoint { lat: number; lon: number; timestamp: number; accuracy?: number; }
export interface MeterState { distanceKm: number; lastPoint: MeterPoint | null; rejectedPoints: number; }
export const emptyMeter = (): MeterState => ({ distanceKm: 0, lastPoint: null, rejectedPoints: 0 });

export function distanceKm(a: MeterPoint, b: MeterPoint) {
  const rad = Math.PI / 180;
  const x = Math.sin((b.lat - a.lat) * rad / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lon - a.lon) * rad / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0, 1 - x)));
}
export function addMeterPoint(state: MeterState, point: MeterPoint): MeterState {
  if (![point.lat, point.lon, point.timestamp].every(Number.isFinite) || Math.abs(point.lat) > 90 || Math.abs(point.lon) > 180 || point.timestamp <= 0 || (point.accuracy !== undefined && (!Number.isFinite(point.accuracy) || point.accuracy < 0 || point.accuracy > 50))) return { ...state, rejectedPoints: state.rejectedPoints + 1 };
  const last = state.lastPoint;
  if (!last) return { ...state, lastPoint: point };
  if (point.timestamp <= last.timestamp) return state;
  const gapSeconds = (point.timestamp - last.timestamp) / 1000;
  const segment = distanceKm(last, point);
  // Never invent a route across a GPS outage, or bill an impossible jump (>180 km/h).
  if (gapSeconds > 120 || segment / (gapSeconds / 3600) > 180) return { ...state, lastPoint: point, rejectedPoints: state.rejectedPoints + 1 };
  // Ignore small stationary GPS jitter while keeping the last accepted anchor.
  const jitterKm = Math.max(0.005, ((last.accuracy ?? 5) + (point.accuracy ?? 5)) / 1000);
  if (segment < jitterKm) return state;
  return { ...state, lastPoint: point, distanceKm: state.distanceKm + segment };
}
