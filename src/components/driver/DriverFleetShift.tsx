'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import { useGeolocation, GeolocationPoint } from '@/hooks/useGeolocation';
import { isPublishableFleetPoint, shouldPublishFleetPoint } from '@/lib/fleet-tracking';
import { registerFleetSharingStopper } from '@/lib/fleet-sharing-runtime';
import { BriefcaseBusiness, Loader2, LocateFixed, WifiOff } from 'lucide-react';

interface FleetState { shift_active?: boolean; sharing_enabled?: boolean; recorded_at?: string | null }
const copy = {
  ar: { start: 'بدء الوردية ومشاركة الموقع', stop: 'إنهاء الوردية', active: 'مشاركة الموقع مفعّلة', inactive: 'الموقع غير مشارك', starting: 'جارٍ تحديد الموقع…', failed: 'تعذّر تحديث حالة الوردية. حاول مجدداً.', accuracy: 'يلزم موقع GPS أحدث وأدق.', privacy: 'يُحفظ آخر موقع فقط ويُمسح عند إنهاء الوردية.' },
  fr: { start: 'Commencer le service et partager', stop: 'Terminer le service', active: 'Partage de position actif', inactive: 'Position non partagée', starting: 'Localisation en cours…', failed: 'Mise à jour du service impossible. Réessayez.', accuracy: 'Une position GPS récente et plus précise est requise.', privacy: 'Seule la dernière position est conservée et effacée à la fin du service.' },
  nl: { start: 'Dienst starten en locatie delen', stop: 'Dienst beëindigen', active: 'Locatie delen is actief', inactive: 'Locatie wordt niet gedeeld', starting: 'Locatie bepalen…', failed: 'Dienststatus bijwerken mislukt. Probeer opnieuw.', accuracy: 'Een recentere en nauwkeurigere GPS-locatie is nodig.', privacy: 'Alleen de laatste locatie wordt bewaard en bij het einde gewist.' },
};

export default function DriverFleetShift({ language }: { language: 'ar' | 'fr' | 'nl' }) {
  const words = copy[language];
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(false);
  const lastSent = useRef<GeolocationPoint | null>(null);
  const sending = useRef(false);
  const pending = useRef<GeolocationPoint | null>(null);
  const inFlight = useRef<Promise<unknown> | null>(null);
  const { getLocation, startWatching, stopWatching } = useGeolocation({ language });

  const publish = useCallback(async (point: GeolocationPoint) => {
    if (!activeRef.current || !shouldPublishFleetPoint(lastSent.current, point)) return;
    if (sending.current) { pending.current = point; return; }
    sending.current = true;
    try {
      const request = api.post('/fleet/location', { shift_active: true, sharing_enabled: true, latitude: point.lat, longitude: point.lon, accuracy_m: point.accuracy, recorded_at: new Date(point.timestamp).toISOString() });
      inFlight.current = request;
      await request;
      lastSent.current = point;
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
    let cancelled = false;
    api.get<FleetState>('/fleet/location').then(state => {
      if (cancelled) return;
      const enabled = state?.shift_active === true && state?.sharing_enabled === true;
      setActive(enabled);
      activeRef.current = enabled;
      if (enabled) beginWatch();
    }).catch(() => { if (!cancelled) setError(words.failed); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; void stopRuntime(); };
  }, [beginWatch, stopRuntime, words.failed]);

  const startShift = async () => {
    setBusy(true); setError(null);
    try {
      const point = await getLocation();
      if (!point || !isPublishableFleetPoint(point)) { setError(words.accuracy); return; }
      await api.post('/fleet/location', { shift_active: true, sharing_enabled: true, latitude: point.lat, longitude: point.lon, accuracy_m: point.accuracy, recorded_at: new Date(point.timestamp).toISOString() });
      lastSent.current = point;
      setActive(true);
      beginWatch();
    } catch { setError(words.failed); }
    finally { setBusy(false); }
  };

  const endShift = async () => {
    setBusy(true); setError(null);
    await stopRuntime();
    try {
      await api.post('/fleet/location', { shift_active: false, sharing_enabled: false });
      lastSent.current = null;
      setActive(false);
    } catch {
      setError(words.failed);
      activeRef.current = true;
      beginWatch();
    } finally { setBusy(false); }
  };

  return <section className="mx-4 mb-3 rounded-xl border p-3" style={{ borderColor: 'var(--dp-border)', background: 'var(--dp-card-2)' }} aria-label={active ? words.active : words.inactive}>
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="dp-text flex items-center gap-2 text-xs font-bold">{active ? <LocateFixed className="h-4 w-4" style={{ color: 'var(--dp-success)' }} /> : <BriefcaseBusiness className="h-4 w-4" />}{active ? words.active : words.inactive}</p>
        <p className="dp-text-soft mt-1 text-[10px] leading-relaxed">{words.privacy}</p>
      </div>
      <button type="button" disabled={loading || busy} onClick={() => void (active ? endShift() : startShift())} className="shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold text-white disabled:opacity-60" style={{ background: active ? 'var(--dp-danger)' : 'var(--dp-accent)' }}>
        {(loading || busy) ? <span className="inline-flex items-center gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" />{busy ? words.starting : ''}</span> : active ? words.stop : words.start}
      </button>
    </div>
    {error && <p role="alert" className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--dp-danger)' }}><WifiOff className="h-3.5 w-3.5" />{error}</p>}
  </section>;
}
