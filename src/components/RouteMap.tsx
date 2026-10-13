"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { DrivingRoute } from "@/lib/mapbox-route";

interface RouteMapProps {
  route: DrivingRoute;
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
  language?: string;
  height?: number;
}

function encodePolyline(points: Array<[number, number]>): string {
  let lastLat = 0;
  let lastLon = 0;
  let encoded = "";
  for (const [lon, lat] of points) {
    for (const [value, previous, setPrevious] of [
      [Math.round(lat * 1e5), lastLat, (next: number) => { lastLat = next; }],
      [Math.round(lon * 1e5), lastLon, (next: number) => { lastLon = next; }],
    ] as Array<[number, number, (next: number) => void]>) {
      let delta = value - previous;
      setPrevious(value);
      delta = delta < 0 ? ~(delta << 1) : delta << 1;
      while (delta >= 0x20) {
        encoded += String.fromCharCode((0x20 | (delta & 0x1f)) + 63);
        delta >>= 5;
      }
      encoded += String.fromCharCode(delta + 63);
    }
  }
  return encoded;
}

function staticMapUrl(route: DrivingRoute, start: RouteMapProps["start"], end: RouteMapProps["end"], token: string): string {
  const stride = Math.max(1, Math.ceil(route.coordinates.length / 90));
  const points = route.coordinates.filter((_, index) => index % stride === 0);
  const last = route.coordinates.at(-1);
  if (last && points.at(-1) !== last) points.push(last);
  const path = `path-5+27b7a5-0.9(${encodeURIComponent(encodePolyline(points))})`;
  const origin = `pin-s+16a34a(${start.lon},${start.lat})`;
  const destination = `pin-s+ef4444(${end.lon},${end.lat})`;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${path},${origin},${destination}/auto/960x420@2x?access_token=${encodeURIComponent(token)}&padding=28`;
}

function getLabel(language: string, key: "loading" | "unavailable" | "start" | "end"): string {
  const labels: Record<string, Record<string, string>> = {
    fr: { loading: "Chargement de la carte…", unavailable: "Carte Mapbox indisponible", start: "Départ", end: "Arrivée" },
    ar: { loading: "جارٍ تحميل خريطة Mapbox…", unavailable: "خريطة Mapbox غير متاحة", start: "الانطلاق", end: "الوجهة" },
    nl: { loading: "Mapbox-kaart laden…", unavailable: "Mapbox-kaart niet beschikbaar", start: "Start", end: "Bestemming" },
  };
  return labels[language]?.[key] ?? labels.nl[key];
}

export default function RouteMap({ route, start, end, language = "nl", height = 210 }: RouteMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = token ? staticMapUrl(route, start, end, token) : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="relative w-full overflow-hidden rounded-xl border border-blue-200 shadow-md dark:border-blue-800"
      style={{ height }}
      data-testid="mapbox-route-map"
    >
      {!loaded && !failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20">
          <Loader2 className="mb-1 h-6 w-6 animate-spin text-blue-500" />
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{getLabel(language, "loading")}</span>
        </div>
      )}
      {(failed || !token) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
          <MapPin className="mb-1 h-6 w-6 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{getLabel(language, "unavailable")}</span>
        </div>
      )}
      {url && !failed && (
        // Direct image requests keep Mapbox's attribution and quota accounting visible to the client.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`${getLabel(language, "start")} — ${getLabel(language, "end")}`}
          className="h-full w-full object-cover"
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(false); }}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
      <div className="absolute bottom-2 left-2 flex gap-1.5" aria-hidden="true">
        <span className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800 shadow">● {getLabel(language, "start")}</span>
        <span className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800 shadow">● {getLabel(language, "end")}</span>
      </div>
    </motion.div>
  );
}
