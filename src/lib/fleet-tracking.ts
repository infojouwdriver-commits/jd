export type FleetWorkStatus = 'on_trip' | 'available' | 'stale' | 'off_shift';

export interface FleetLocationRow {
  driver_id: number;
  driver_name: string;
  company_id: number;
  company_name: string;
  vehicle_id: number | null;
  plate_number: string | null;
  shift_active: boolean;
  sharing_enabled: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  last_update: string | null;
  work_status: FleetWorkStatus;
}

export interface FleetPoint {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp: number;
}

export function isPublishableFleetPoint(point: FleetPoint, now = Date.now()): boolean {
  return Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 &&
    Number.isFinite(point.lon) && Math.abs(point.lon) <= 180 &&
    Number.isFinite(point.timestamp) && point.timestamp > 0 &&
    now - point.timestamp <= 60_000 && point.timestamp - now <= 5_000 &&
    Number.isFinite(point.accuracy) && Number(point.accuracy) >= 0 && Number(point.accuracy) <= 200;
}

function distanceMetres(a: FleetPoint, b: FleetPoint): number {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const lat1 = radians(a.lat);
  const lat2 = radians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function shouldPublishFleetPoint(previous: FleetPoint | null, next: FleetPoint, now = Date.now()): boolean {
  if (!isPublishableFleetPoint(next, now)) return false;
  if (!previous) return true;
  return next.timestamp - previous.timestamp >= 15_000 || distanceMetres(previous, next) >= 25;
}

export function isFleetLocationVisible(row: FleetLocationRow): boolean {
  return row.shift_active === true && row.sharing_enabled === true &&
    Number.isFinite(row.latitude) && Number.isFinite(row.longitude) && Boolean(row.last_update);
}
