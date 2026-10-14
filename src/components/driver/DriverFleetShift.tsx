'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import { useGeolocation, GeolocationPoint } from '@/hooks/useGeolocation';
import { isPublishableFleetPoint, shouldPublishFleetPoint } from '@/lib/fleet-tracking';
import { registerFleetSharingStopper } from '@/lib/fleet-sharing-runtime';
import { LocateFixed, WifiOff } from 'lucide-react';

const copy = {
  ar: { active: 'موقعك مشترك مع الشركة والإدارة', inactive: 'مشاركة الموقع: بانتظار GPS أو الإذن', failed: 'تعذّر تحديث الموقع.', accuracy: 'يلزم موقع GPS أحدث وأدق.', privacy: 'مشاركة تلقائية أثناء تسجيل الدخول، بإذن الموقع. الشركة ترى سائقيها والإدارة ترى الجميع. يُحفظ آخر موقع فقط ويُمسح عند تسجيل الخروج.' },
  fr: { active: 'Position partagée avec votre société et l’administration', inactive: 'Partage : GPS ou autorisation en attente', failed: 'Position non actualisée.', accuracy: 'Une position GPS récente et plus précise est requise.', privacy: 'Partage automatique pendant la connexion, avec autorisation de localisation. Votre société voit ses chauffeurs et l’administration voit tous les chauffeurs. Seule la dernière position est conservée et effacée à la déconnexion.' },
  nl: { active: 'Locatie gedeeld met uw bedrijf en de administratie', inactive: 'Delen: wacht op GPS of toestemming', failed: 'Locatie niet bijgewerkt.', accuracy: 'Een recentere en nauwkeurigere GPS-locatie is nodig.', privacy: 'Automatisch delen tijdens het inloggen, met locatietoestemming. Uw bedrijf ziet zijn chauffeurs en de administratie ziet iedereen. Alleen de laatste locatie wordt bewaard en bij uitloggen gewist.' },
};

export default function DriverFleetShift({ language }: { language: 'ar' | 'fr' | 'nl' }) {
  const words = copy[language];
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(false);
  const lastSent = useRef<GeolocationPoint | null>(null);
  const sending = useRef(false);
  const pending = useRef<GeolocationPoint | null>(null);
  const inFlight = useRef<Promise<unknown> | null>(null);
  const { startWatching, stopWatching, error: gpsError } = useGeolocation({ language });

  const publish = useCallback(async (point: GeolocationPoint) => {
    if (!activeRef.current) return;
    if (!isPublishableFleetPoint(point)) { setError(words.accuracy); return; }
    if (!shouldPublishFleetPoint(lastSent.current, point)) return;
    if (sending.current) { pending.current = point; return; }
    sending.current = true;
    try {
      const request = api.post('/fleet/location', { shift_active: true, sharing_enabled: true, latitude: point.lat, longitude: point.lon, accuracy_m: point.accuracy, recorded_at: new Date(point.timestamp).toISOString() });
      inFlight.current = request;
      await request;
      lastSent.current = point;
      setActive(true);
      setError(null);
    } catch {
      setError(words.failed);
    } finally {
      sending.current = false;
      inFlight.current = null;
      const queued = pending.current;
      pending.current = null;
      if (queued) void publish(queued);
    }
  }, [words.failed]);

  const beginWatch = useCallback(() => {
    activeRef.current = true;
    startWatching(point => void publish(point));
  }, [publish, startWatching]);

  const stopRuntime = useCallback(async () => {
    activeRef.current = false;
    pending.current = null;
    await stopWatching();
    try { await inFlight.current; } catch { /* The final off-shift update still runs below. */ }
  }, [stopWatching]);

  useEffect(() => registerFleetSharingStopper(stopRuntime), [stopRuntime]);

  useEffect(() => {
    beginWatch();
    return () => { void stopRuntime(); };
  }, [beginWatch, stopRuntime]);

  return <section data-testid="fleet-sharing-indicator" className="dp-text-soft mx-4 mb-2 flex flex-wrap items-center gap-1.5 text-[10px]" title={words.privacy} aria-label={words.privacy}>
    <LocateFixed className="h-3 w-3 shrink-0" style={{ color: active && !gpsError && !error ? 'var(--dp-success)' : 'var(--dp-text-soft)' }} />
    <span role="status">{active && !gpsError && !error ? words.active : words.inactive}</span>
    {(error || gpsError) && <span role="alert" className="inline-flex items-center gap-1" style={{ color: 'var(--dp-danger)' }}><WifiOff className="h-3 w-3" />{gpsError || error}</span>}
  </section>;
}
