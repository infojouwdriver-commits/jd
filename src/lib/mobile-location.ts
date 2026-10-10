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
export interface NativeTripIdentity { owner: string; key: string; after?: number }
export interface MobileWatchOptions { background?: boolean; trip?: NativeTripIdentity }
export interface NativeTripJournalPlugin {
  readTripPoints(options: { owner: string; key: string; after: number }): Promise<{ points: NativeLocation[] }>;
  clearTripPoints(options: { owner: string; key: string }): Promise<void>;
}
export interface NativeLocationPlugin {
  addWatcher(options: { requestPermissions: boolean; stale: boolean; distanceFilter: number; tripOwner?: string; tripKey?: string; backgroundMessage?: string; backgroundTitle?: string }, callback: (location?: NativeLocation, error?: LocationError) => void): Promise<string>;
  removeWatcher(options: { id: string }): Promise<void>;
}
const nativePlugin = registerPlugin<NativeLocationPlugin & NativeTripJournalPlugin>('BackgroundGeolocation');
const notifications = registerPlugin<{ requestPermissions(): Promise<{ display: string }> }>('LocalNotifications');
const stops = new Set<() => Promise<void>>();
export const isNativeMobile = () => Capacitor.isNativePlatform();

export function normalizeNativeLocation(location: NativeLocation): MobileLocationPoint | null {
  if (location.simulated || !Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90 ||
    !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180 ||
    !Number.isFinite(location.time) || location.time <= 0 || !Number.isFinite(location.accuracy) || location.accuracy < 0) return null;
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
  onError: (error: LocationError) => void, options: MobileWatchOptions = {}, prepare: () => Promise<void> = async () => {}) {
  let stopped = false;
  let watcherId: string | undefined;
  let removed = false;
  const remove = async () => { if (watcherId && !removed) { await plugin.removeWatcher({ id: watcherId }); removed = true; } };
  const ready = (async () => {
    await prepare();
    if (stopped) return;
    watcherId = await plugin.addWatcher({ requestPermissions: true, stale: false, distanceFilter: 5,
      ...(options.trip ? { tripOwner: options.trip.owner, tripKey: options.trip.key } : {}),
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

/** Serial replay + live buffering: a new live point cannot skip an older persisted batch. */
export function createNativeTripReplay(plugin: NativeTripJournalPlugin, trip: NativeTripIdentity,
  onPoint: (point: MobileLocationPoint) => void) {
  if (!/^[1-9]\d{0,18}$/.test(trip.owner) || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(trip.key)) throw new Error('Active trip identity required');
  let watermark = trip.after ?? 0;
  if (!Number.isFinite(watermark) || watermark < 0) throw new Error('Invalid native trip watermark');
  let stopped = false;
  let work: Promise<void> | undefined;
  let buffered: MobileLocationPoint[] = [];
  const emit = (point: MobileLocationPoint) => {
    if (stopped || point.timestamp <= watermark) return;
    onPoint(point); watermark = point.timestamp;
  };
  const replay = () => {
    if (stopped) return Promise.resolve();
    if (work) return work;
    work = (async () => {
      while (!stopped) {
        const batch = await plugin.readTripPoints({ owner: trip.owner, key: trip.key, after: watermark });
        if (!Array.isArray(batch.points) || batch.points.length > 1000) throw new Error('Invalid native trip batch');
        const points = batch.points.map(normalizeNativeLocation).filter((p): p is MobileLocationPoint => !!p).sort((a, b) => a.timestamp - b.timestamp);
        const previous = watermark;
        for (const point of points) emit(point);
        if (batch.points.length < 1000) break;
        if (watermark === previous) throw new Error('Native trip replay made no progress');
      }
      for (const point of buffered.sort((a, b) => a.timestamp - b.timestamp)) emit(point);
      buffered = [];
    })().finally(() => { work = undefined; });
    return work;
  };
  return { replay, accept: (point: MobileLocationPoint) => { if (work) buffered.push(point); else emit(point); },
    stop: () => { stopped = true; buffered = []; }, watermark: () => watermark };
}

export function watchMobileLocation(onPoint: (point: MobileLocationPoint) => void, onError: (error: LocationError) => void,
  options: MobileWatchOptions = {}) {
  if (!isNativeMobile()) throw new Error('Native location is unavailable in the browser');
  if (!Capacitor.isPluginAvailable('BackgroundGeolocation')) throw new Error('Native location plugin is missing');
  if (options.background && !options.trip) throw new Error('Background tracking requires an active trip identity');
  const replay = options.trip ? createNativeTripReplay(nativePlugin, options.trip, onPoint) : undefined;
  let stopped = false;
  const nativeWatch = createNativeLocationWatch(nativePlugin, point => replay ? replay.accept(point) : onPoint(point), onError, options, async () => {
    if (options.background && Capacitor.getPlatform() === 'android') {
      const permission = await notifications.requestPermissions();
      if (permission.display !== 'granted') throw new Error('Background tracking requires the visible Android notification');
    }
    await replay?.replay();
  });
  const resume = () => {
    if (stopped || document.visibilityState === 'hidden') return;
    void replay?.replay().catch(() => onError({ code: 'JOURNAL_ERROR', message: 'Native trip replay failed' }));
  };
  if (replay) { document.addEventListener('visibilitychange', resume); document.addEventListener('resume', resume); }
  const stop = async () => {
    stopped = true; replay?.stop(); document.removeEventListener('visibilitychange', resume); document.removeEventListener('resume', resume);
    try { await nativeWatch.stop(); } finally { stops.delete(stop); }
  };
  stops.add(stop);
  return { ready: nativeWatch.ready, stop, replay: () => replay?.replay() ?? Promise.resolve() };
}

/** Only after the completed trip has been durably queued; never discard on logout. */
export async function clearNativeTripPoints(owner: string, key: string) {
  if (isNativeMobile()) await nativePlugin.clearTripPoints({ owner, key });
}

/** Call before logout or account changes. Never keep tracking another driver's session. */
export async function stopAllMobileLocationWatches() { await Promise.all(Array.from(stops, stop => stop())); }
