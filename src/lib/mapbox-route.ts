export type Coordinate = { lat: number; lon: number };

export interface DrivingRoute {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: Array<[number, number]>;
}

export function parseDrivingRoute(payload: unknown): DrivingRoute | null {
  if (!payload || typeof payload !== "object") return null;
  const routes = (payload as { routes?: unknown }).routes;
  if (!Array.isArray(routes) || !routes.length || !routes[0] || typeof routes[0] !== "object") return null;
  const route = routes[0] as { distance?: unknown; duration?: unknown; geometry?: unknown };
  const geometry = route.geometry as { type?: unknown; coordinates?: unknown } | undefined;
  if (
    typeof route.distance !== "number" || !Number.isFinite(route.distance) || route.distance <= 0 ||
    typeof route.duration !== "number" || !Number.isFinite(route.duration) || route.duration <= 0 ||
    geometry?.type !== "LineString" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2
  ) return null;

  const coordinates: Array<[number, number]> = [];
  for (const point of geometry.coordinates) {
    if (!Array.isArray(point) || point.length < 2 || !point.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
    const [lon, lat] = point as [number, number];
    if (Math.abs(lon) > 180 || Math.abs(lat) > 90) return null;
    coordinates.push([lon, lat]);
  }
  return { distanceMeters: route.distance, durationSeconds: route.duration, coordinates };
}

export async function fetchDrivingRoute(
  start: Coordinate,
  end: Coordinate,
  token: string,
  request: typeof fetch = fetch,
): Promise<DrivingRoute> {
  if (!token.trim()) throw new Error("mapbox_token_required");
  for (const point of [start, end]) {
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon) || Math.abs(point.lat) > 90 || Math.abs(point.lon) > 180) {
      throw new Error("invalid_coordinates");
    }
  }
  const coordinates = `${start.lon},${start.lat};${end.lon},${end.lat}`;
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`);
  url.searchParams.set("access_token", token.trim());
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await request(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("mapbox_route_unavailable");
    const route = parseDrivingRoute(await response.json());
    if (!route) throw new Error("mapbox_route_invalid");
    return route;
  } finally {
    clearTimeout(timeout);
  }
}

const routeCache = new Map<string, DrivingRoute>();
const inFlight = new Map<string, Promise<DrivingRoute>>();

export function getDrivingRoute(start: Coordinate, end: Coordinate, token: string): Promise<DrivingRoute> {
  const key = [start.lat, start.lon, end.lat, end.lon].map((value) => value.toFixed(5)).join(":");
  const cached = routeCache.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const promise = fetchDrivingRoute(start, end, token).then((route) => {
    routeCache.set(key, route);
    if (routeCache.size > 100) routeCache.delete(routeCache.keys().next().value!);
    return route;
  }).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
