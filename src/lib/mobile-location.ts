import { Capacitor, registerPlugin } from '@capacitor/core';

export interface MobileLocationPoint {
  lat: number;
  lon: number;
  accuracy?: number;
  speed?: number;
  timestamp: number;
}
interface NativeLocation {
  latitude: number; longitude: number; accuracy: number;
  speed?: number | null; time: number; simulated?: boolean;
}
interface LocationError { code?: string | number; message?: string }
export interface NativeLocationPlugin {
  addWatcher(options: { requestPermissions: boolean; stale: boolean; distanceFilter: number; backgroundMessage?: string; backgroundTitle?: string }, callback: (location?: NativeLocation, error?: LocationError) => void): Promise<string>;
  removeWatcher(options: { id: string }): Promise<void>;
}
const nativePlugin = registerPlugin<NativeLocationPlugin>('BackgroundGeolocation');
const notifications = registerPlugin<{ requestPermissions(): Promise<{ display: string }> }>('LocalNotifications');
const stops = new Set<() => Promise<void>>();
export const isNativeMobile = () => Capacitor.isNativePlatform();

export function normalizeNativeLocation(location: NativeLocation): MobileLocationPoint | null {
  if (location.simulated || !Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90 ||
    !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180 ||
    !Number.isFinite(location.time) || !Number.isFinite(location.accuracy) || location.accuracy < 0) return null;
  return { lat: location.latitude, lon: location.longitude, accuracy: location.accuracy,
    speed: location.speed != null && location.speed >= 0 && Number.isFinite(location.speed) ? location.speed : undefined,
    timestamp: location.time };
}

/** A start/end fix must describe the current position, not a cached approximate fix. */
export function isFreshAccurateLocation(point: MobileLocationPoint | null, now = Date.now()): point is MobileLocationPoint {
  return !!point && Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 &&
    Number.isFinite(point.lon) && Math.abs(point.lon) <= 180 && Number.isFinite(point.timestamp) &&
    point.timestamp > 0 && now - point.timestamp <= 30_000 && point.timestamp - now <= 5_000 &&
    point.accuracy !== undefined && Number.isFinite(point.accuracy) && point.accuracy >= 0 && point.accuracy <= 50;
}

/** Callback suppression is immediate; late native registrations are removed too. */
export function createNativeLocationWatch(plugin: NativeLocationPlugin, onPoint: (point: MobileLocationPoint) => void,
  onError: (error: LocationError) => void, options: { background?: boolean } = {}, prepare: () => Promise<void> = async () => {}) {
  let stopped = false;
  let watcherId: string | undefined;
  let removed = false;
  const remove = async () => { if (watcherId && !removed) { await plugin.removeWatcher({ id: watcherId }); removed = true; } };
  const ready = (async () => {
    await prepare();
    if (stopped) return;
    watcherId = await plugin.addWatcher({ requestPermissions: true, stale: false, distanceFilter: 5,
      ...(options.background ? { backgroundTitle: 'Jouw Driver', backgroundMessage: 'Active trip: location tracking. End the trip to stop.' } : {}) },
      (location, error) => {
        if (stopped) return;
        if (error) { onError(error); return; }
        const point = location && normalizeNativeLocation(location);
        if (point) onPoint(point);
      });
    if (stopped) await remove();
  })();
  // Suppress unhandled registration rejection while preserving ready for callers.
  void ready.catch(() => {});
  const stop = async () => { stopped = true; try { await ready; } catch {} await remove(); stops.delete(stop); };
  stops.add(stop);
  return { ready, stop };
}

export function watchMobileLocation(onPoint: (point: MobileLocationPoint) => void, onError: (error: LocationError) => void,
  options: { background?: boolean } = {}) {
  if (!isNativeMobile()) throw new Error('Native location is unavailable in the browser');
  if (!Capacitor.isPluginAvailable('BackgroundGeolocation')) throw new Error('Native location plugin is missing');
  return createNativeLocationWatch(nativePlugin, onPoint, onError, options, async () => {
    if (options.background && Capacitor.getPlatform() === 'android') {
      const permission = await notifications.requestPermissions();
      if (permission.display !== 'granted') throw new Error('Background tracking requires the visible Android notification');
    }
  });
}

/** Call before logout or account changes. Never keep tracking another driver's session. */
export async function stopAllMobileLocationWatches() { await Promise.all(Array.from(stops, stop => stop())); }
