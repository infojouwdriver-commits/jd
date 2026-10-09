"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { isNativeMobile, isFreshAccurateLocation, watchMobileLocation, type MobileLocationPoint } from '@/lib/mobile-location';
export type GeolocationPoint = MobileLocationPoint;
interface UseGeolocationOptions { onLocationUpdate?: (point: GeolocationPoint) => void; language?: 'nl' | 'fr' | 'ar' }
const messages = {
  nl: { denied: 'Locatietoegang geweigerd. Controleer de app-instellingen.', unavailable: 'GPS niet beschikbaar. Controleer de locatie en meldingsmachtigingen.', timeout: 'Geen actuele GPS-locatie. Probeer opnieuw.' },
  fr: { denied: 'Accès à la localisation refusé. Vérifiez les paramètres.', unavailable: 'GPS indisponible. Vérifiez les autorisations de localisation et notifications.', timeout: 'Aucune position GPS récente. Réessayez.' },
  ar: { denied: 'تم رفض إذن الموقع. تحقق من إعدادات التطبيق.', unavailable: 'GPS غير متاح. تحقق من أذونات الموقع والإشعارات.', timeout: 'لم نحصل على موقع GPS حديث. حاول مجدداً.' },
};
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState({ location: null as GeolocationPoint | null, error: null as string | null,
    permissionState: 'unknown' as 'prompt' | 'granted' | 'denied' | 'unknown', isWatching: false, isLocating: false, accuracy: null as number | null });
  const last = useRef<GeolocationPoint | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const optionsRef = useRef(options); optionsRef.current = options;
  const update = useCallback((point: GeolocationPoint) => {
    if (!mounted.current) return;
    last.current = point;
    setState(prev => ({ ...prev, location: point, error: null, permissionState: 'granted', accuracy: point.accuracy ?? null }));
  }, []);
  const fail = useCallback((error: { code?: string | number }) => {
    if (!mounted.current) return;
    const denied = error.code === 1 || error.code === 'NOT_AUTHORIZED';
    const text = messages[optionsRef.current.language ?? 'nl'];
    setState(prev => ({ ...prev, error: denied ? text.denied : error.code === 3 ? text.timeout : text.unavailable,
      permissionState: denied ? 'denied' : prev.permissionState, isLocating: false }));
  }, []);
  const stopWatching = useCallback(() => {
    generation.current++;
    stopRef.current?.(); stopRef.current = null;
    if (mounted.current) setState(prev => ({ ...prev, isWatching: false }));
  }, []);
  const startWatching = useCallback((onUpdate: (point: GeolocationPoint) => void, watchOptions: { background?: boolean } = {}) => {
    stopWatching();
    const current = generation.current;
    const accept = (point: GeolocationPoint) => { if (generation.current !== current) return; update(point); onUpdate(point); };
    const reject = (error: { code?: string | number }) => {
      if (generation.current !== current) return;
      if (error.code === 1 || error.code === 'NOT_AUTHORIZED') stopWatching();
      fail(error);
    };
    try {
      if (isNativeMobile()) {
        const watch = watchMobileLocation(accept, reject, watchOptions);
        stopRef.current = () => { void watch.stop().catch(() => fail({})); };
        void watch.ready.then(() => { if (generation.current === current) setState(prev => ({ ...prev, isWatching: true })); }).catch(reject);
      } else {
        if (!navigator.geolocation) { reject({}); return; }
        const id = navigator.geolocation.watchPosition(pos => accept({ lat: pos.coords.latitude, lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy, speed: pos.coords.speed != null && pos.coords.speed >= 0 ? pos.coords.speed : undefined,
          timestamp: pos.timestamp }), reject, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
        stopRef.current = () => navigator.geolocation.clearWatch(id);
        setState(prev => ({ ...prev, isWatching: true }));
      }
    } catch { reject({}); }
  }, [stopWatching, update, fail]);
  const getLocation = useCallback(async (_showToast = false): Promise<GeolocationPoint | null> => {
    setState(prev => ({ ...prev, isLocating: true, error: null }));
    try {
      const point = await new Promise<GeolocationPoint>((resolve, reject) => {
        if (isNativeMobile()) {
          let stop: (() => void) | undefined;
          let settled = false;
          const finish = (point?: GeolocationPoint, error?: { code?: string | number }) => {
            if (settled) return; settled = true; clearTimeout(timer); stop?.();
            if (point) resolve(point); else reject(error ?? { code: 3 });
          };
          const timer = setTimeout(() => finish(undefined, { code: 3 }), 15000);
          try {
            const watch = watchMobileLocation(point => { if (isFreshAccurateLocation(point)) finish(point); }, error => finish(undefined, error));
            stop = () => { void watch.stop().catch(() => {}); };
            void watch.ready.catch(error => finish(undefined, error));
            if (settled) stop();
          } catch (error) { finish(undefined, error as { code?: string | number }); }
        } else if (navigator.geolocation) {
          let id: number | undefined;
          let settled = false;
          const finish = (point?: GeolocationPoint, error?: { code?: number }) => {
            if (settled) return; settled = true; clearTimeout(timer);
            if (id !== undefined) navigator.geolocation.clearWatch(id);
            if (point) resolve(point); else reject(error ?? { code: 3 });
          };
          const timer = setTimeout(() => finish(undefined, { code: 3 }), 15000);
          id = navigator.geolocation.watchPosition(pos => {
            const point = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy,
              speed: pos.coords.speed ?? undefined, timestamp: pos.timestamp };
            if (isFreshAccurateLocation(point)) finish(point);
          }, error => finish(undefined, error), { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
          if (settled) navigator.geolocation.clearWatch(id);
        } else reject({});
      });
      update(point); optionsRef.current.onLocationUpdate?.(point); return point;
    } catch (error) { fail(error as { code?: string | number }); return null; }
    finally { if (mounted.current) setState(prev => ({ ...prev, isLocating: false })); }
  }, [update, fail]);
  const checkPermission = useCallback(async () => {
    if (isNativeMobile() || !navigator.permissions) return 'prompt' as const;
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (mounted.current) setState(prev => ({ ...prev, permissionState: permission.state }));
      return permission.state;
    } catch { return 'prompt' as const; }
  }, []);
  useEffect(() => { mounted.current = true; void checkPermission(); return () => { mounted.current = false; stopWatching(); }; }, [checkPermission, stopWatching]);
  return { ...state, getLocation, startWatching, stopWatching, checkPermission, lastLocation: last.current };
}
