
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface RouteMapProps {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  language?: string;
  height?: number;
}

interface TileCoord {
  x: number;
  y: number;
  z: number;
}

function latLonToTile(lat: number, lon: number, zoom: number): TileCoord {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y, z: zoom };
}

function latLonToPixel(lat: number, lon: number, zoom: number, tileX: number, tileY: number, tileSize: number) {
  const n = Math.pow(2, zoom);
  const px = ((lon + 180) / 360) * n * tileSize - tileX * tileSize;
  const latRad = (lat * Math.PI) / 180;
  const py = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * tileSize - tileY * tileSize;
  return { px, py };
}

function getBoundingBox(startLat: number, startLon: number, endLat: number, endLon: number) {
  const minLat = Math.min(startLat, endLat);
  const maxLat = Math.max(startLat, endLat);
  const minLon = Math.min(startLon, endLon);
  const maxLon = Math.max(startLon, endLon);
  const padLat = (maxLat - minLat) * 0.3 + 0.005;
  const padLon = (maxLon - minLon) * 0.3 + 0.005;
  return {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLon: minLon - padLon,
    maxLon: maxLon + padLon,
  };
}

function chooseBestZoom(startLat: number, startLon: number, endLat: number, endLon: number, canvasW: number, canvasH: number): number {
  const bbox = getBoundingBox(startLat, startLon, endLat, endLon);
  for (let z = 15; z >= 5; z--) {
    const tileStart = latLonToTile(bbox.maxLat, bbox.minLon, z);
    const tileEnd = latLonToTile(bbox.minLat, bbox.maxLon, z);
    const tilesX = tileEnd.x - tileStart.x + 1;
    const tilesY = tileEnd.y - tileStart.y + 1;
    if (tilesX <= 4 && tilesY <= 4) return z;
  }
  return 8;
}

function getMapLabel(language: string, key: "loading" | "unavailable" | "start" | "end"): string {
  const labels: Record<string, Record<string, string>> = {
    fr: { loading: "Chargement de la carte...", unavailable: "Carte non disponible", start: "Départ", end: "Arrivée" },
    ar: { loading: "جارٍ تحميل الخريطة...", unavailable: "الخريطة غير متاحة", start: "البداية", end: "النهاية" },
    nl: { loading: "Kaart laden...", unavailable: "Kaart niet beschikbaar", start: "Start", end: "Einde" },
  };
  return labels[language]?.[key] ?? labels["nl"][key];
}

export default function RouteMap({ startLat, startLon, endLat, endLon, language = "nl", height = 160 }: RouteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const TILE_SIZE = 256;
    const W = canvas.width;
    const H = canvas.height;

    const zoom = chooseBestZoom(startLat, startLon, endLat, endLon, W, H);
    const bbox = getBoundingBox(startLat, startLon, endLat, endLon);

    const tileStartX = latLonToTile(bbox.maxLat, bbox.minLon, zoom).x;
    const tileStartY = latLonToTile(bbox.maxLat, bbox.minLon, zoom).y;
    const tileEndX = latLonToTile(bbox.minLat, bbox.maxLon, zoom).x;
    const tileEndY = latLonToTile(bbox.minLat, bbox.maxLon, zoom).y;

    const tilesX = tileEndX - tileStartX + 1;
    const tilesY = tileEndY - tileStartY + 1;

    const totalW = tilesX * TILE_SIZE;
    const totalH = tilesY * TILE_SIZE;

    const offsetX = (W - totalW) / 2;
    const offsetY = (H - totalH) / 2;

    const tilePromises: Promise<void>[] = [];

    ctx.fillStyle = "#e8f4f8";
    ctx.fillRect(0, 0, W, H);

    for (let tx = tileStartX; tx <= tileEndX; tx++) {
      for (let ty = tileStartY; ty <= tileEndY; ty++) {
        const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
        const drawX = offsetX + (tx - tileStartX) * TILE_SIZE;
        const drawY = offsetY + (ty - tileStartY) * TILE_SIZE;

        const p = new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.drawImage(img, drawX, drawY, TILE_SIZE, TILE_SIZE);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = tileUrl;
        });
        tilePromises.push(p);
      }
    }

    Promise.all(tilePromises).then(() => {
      const startPx = latLonToPixel(startLat, startLon, zoom, tileStartX, tileStartY, TILE_SIZE);
      const endPx = latLonToPixel(endLat, endLon, zoom, tileStartX, tileStartY, TILE_SIZE);

      const sx = startPx.px + offsetX;
      const sy = startPx.py + offsetY;
      const ex = endPx.px + offsetX;
      const ey = endPx.py + offsetY;

      ctx.save();
      ctx.setLineDash([10, 6]);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(sx, sy);

      const cpx = (sx + ex) / 2 - (ey - sy) * 0.15;
      const cpy = (sy + ey) / 2 + (ex - sx) * 0.15;
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(sx, sy, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ex, ey, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText("A", sx - 3.5, sy + 3.5);
      ctx.restore();

      ctx.save();
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText("B", ex - 3.5, ey + 3.5);
      ctx.restore();

      setIsLoading(false);
    }).catch(() => {
      setError(true);
      setIsLoading(false);
    });
  }, [startLat, startLon, endLat, endLon]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-md"
      style={{ height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-1" />
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {getMapLabel(language, "loading")}
          </span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 z-10">
          <MapPin className="w-6 h-6 text-slate-400 mb-1" />
          <span className="text-xs text-slate-500 font-medium">
            {getMapLabel(language, "unavailable")}
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full h-full"
        style={{ display: isLoading ? "none" : "block" }}
      />
      {!isLoading && !error && (
        <div className="absolute bottom-1.5 left-1.5 flex gap-1.5">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 rounded-md px-1.5 py-0.5 shadow text-xs font-semibold">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>{getMapLabel(language, "start")}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 rounded-md px-1.5 py-0.5 shadow text-xs font-semibold">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>{getMapLabel(language, "end")}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
