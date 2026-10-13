'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LiveMapPoint { id: string; lat: number; lon: number; label: string; color?: string; accuracy?: number; }
interface Props { points: LiveMapPoint[]; route?: Array<[number, number]>; followId?: string; language?: string; height?: number; }
const words = {
  ar: { title: 'الخريطة المباشرة', follow: 'متابعة الموقع', unavailable: 'تعذّر تحميل الخريطة. يبقى العداد والتتبع فعالين.', empty: 'لا يوجد موقع مشارك حالياً', loading: 'جارٍ تحميل الخريطة…' },
  fr: { title: 'Carte en direct', follow: 'Suivre la position', unavailable: 'Carte indisponible. Le compteur et le suivi restent actifs.', empty: 'Aucune position partagée', loading: 'Chargement de la carte…' },
  nl: { title: 'Live kaart', follow: 'Locatie volgen', unavailable: 'Kaart niet beschikbaar. Meter en tracking blijven actief.', empty: 'Geen gedeelde locatie', loading: 'Kaart laden…' },
};

/** One map instance; GPS and fleet refreshes update layers without reloading tiles. */
export default function LiveMap({ points, route, followId, language = 'ar', height = 320 }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const layers = useRef<Leaflet.LayerGroup | null>(null);
  const library = useRef<typeof Leaflet | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [following, setFollowing] = useState(Boolean(followId));
  const fitted = useRef(false);
  const text = words[language as keyof typeof words] || words.ar;
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

  useEffect(() => {
    let cancelled = false;
    if (!token) { setFailed(true); return; }
    void import('leaflet').then(L => {
      if (cancelled || !container.current) return;
      library.current = L;
      const instance = L.map(container.current, { scrollWheelZoom: false, zoomAnimation: false }).setView([50.85, 4.35], 12);
      map.current = instance;
      L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}?access_token=${encodeURIComponent(token)}`, {
        tileSize: 512, zoomOffset: -1, maxZoom: 19, minZoom: 6, keepBuffer: 1, updateWhenIdle: true,
        referrerPolicy: 'origin',
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://www.mapbox.com/map-feedback/">Improve this map</a>',
      }).on('tileerror', () => { if (!cancelled) setFailed(true); }).on('tileload', () => { if (!cancelled) setFailed(false); }).addTo(instance);
      layers.current = L.layerGroup().addTo(instance);
      instance.on('dragstart', () => setFollowing(false));
      setReady(true);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; map.current?.remove(); map.current = null; layers.current = null; fitted.current = false; };
  }, [token]);

  useEffect(() => {
    const L = library.current, instance = map.current, group = layers.current;
    if (!ready || !L || !instance || !group) return;
    group.clearLayers();
    const valid = points.filter(p => Number.isFinite(p.lat) && Math.abs(p.lat) <= 90 && Number.isFinite(p.lon) && Math.abs(p.lon) <= 180);
    for (const point of valid) {
      const label = document.createElement('span'); label.textContent = point.label;
      const marker = L.circleMarker([point.lat, point.lon], { radius: 9, color: '#fff', weight: 3, fillColor: point.color || '#2563eb', fillOpacity: 1 }).bindTooltip(label).addTo(group);
      const element = marker.getElement();
      if (element) { element.setAttribute('data-map-point', point.id); element.setAttribute('data-lat', String(point.lat)); element.setAttribute('data-lon', String(point.lon)); }
      if (point.id === followId && Number.isFinite(point.accuracy) && Number(point.accuracy) > 0)
        L.circle([point.lat, point.lon], { radius: Number(point.accuracy), color: '#2563eb', weight: 1, fillOpacity: 0.08 }).addTo(group);
    }
    if (route?.length) L.polyline(route.map(([lon, lat]) => [lat, lon]), { color: '#2563eb', weight: 5 }).addTo(group);
    const follow = valid.find(p => p.id === followId);
    if (following && follow) instance.panTo([follow.lat, follow.lon], { animate: false });
    else if (!fitted.current && valid.length) {
      instance.fitBounds(L.latLngBounds(valid.map(p => [p.lat, p.lon])), { maxZoom: 14, padding: [35, 35] }); fitted.current = true;
    }
  }, [ready, points, route, followId, following]);

  return <section data-testid="live-map" className="relative isolate overflow-hidden rounded-xl border bg-slate-100" aria-label={text.title}>
    <div ref={container} style={{ height, width: '100%', direction: 'ltr' }} />
    {followId && <button type="button" onClick={() => setFollowing(true)} aria-pressed={following} className="absolute right-3 top-3 z-[1000] rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow">{text.follow}</button>}
    {(!ready || failed || !points.length) && <p role="status" className="absolute bottom-8 left-3 right-3 z-[1000] rounded-lg bg-white/95 p-2 text-center text-xs text-slate-800">{failed ? text.unavailable : !ready ? text.loading : text.empty}</p>}
  </section>;
}
