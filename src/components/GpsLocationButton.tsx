
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Target, Loader2, CheckCircle2, AlertCircle, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GpsLocationButtonProps {
  onLocationFound: (lat: number, lon: number) => void;
  language?: "nl" | "fr" | "ar";
  className?: string;
  size?: "sm" | "md" | "lg";
}

type GpsStatus = "idle" | "locating" | "success" | "error";

const LABELS = {
  nl: {
    idle: "Gebruik huidige locatie",
    locating: "Locatie bepalen...",
    success: "Locatie gevonden",
    error: "Opnieuw proberen",
    accuracy: "Nauwkeurigheid",
    meters: "m",
    networkFallback: "Netwerklocatie gebruikt",
  },
  fr: {
    idle: "Utiliser la position actuelle",
    locating: "Localisation en cours...",
    success: "Position trouvée",
    error: "Réessayer",
    accuracy: "Précision",
    meters: "m",
    networkFallback: "Position réseau utilisée",
  },
  ar: {
    idle: "استخدام الموقع الحالي",
    locating: "جارٍ تحديد الموقع...",
    success: "تم تحديد الموقع",
    error: "إعادة المحاولة",
    accuracy: "الدقة",
    meters: "م",
    networkFallback: "تم استخدام موقع الشبكة",
  },
};

export default function GpsLocationButton({
  onLocationFound,
  language = "nl",
  className,
  size = "md",
}: GpsLocationButtonProps) {
  const [status, setStatus] = useState<GpsStatus>("idle");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isNetworkFallback, setIsNetworkFallback] = useState(false);
  const labels = LABELS[language] ?? LABELS["nl"];

  const getLocation = useCallback(async () => {
    if (!navigator?.geolocation) return;

    setStatus("locating");
    setAccuracy(null);
    setIsNetworkFallback(false);

    let resolved = false;

    const handleSuccess = (pos: GeolocationPosition, isNetwork = false) => {
      if (resolved) return;
      resolved = true;
      setAccuracy(Math.round(pos.coords.accuracy));
      setIsNetworkFallback(isNetwork);
      setStatus("success");
      onLocationFound(pos.coords.latitude, pos.coords.longitude);

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setAccuracy(null);
        setIsNetworkFallback(false);
      }, 3000);
    };

    const handleError = () => {
      if (resolved) return;
      resolved = true;
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    };

    // Step 1: Try cached position immediately (< 1 min old)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos.coords.accuracy < 200) {
          handleSuccess(pos, false);
        }
        // If cached but inaccurate, continue to better strategies
      },
      () => {},
      { enableHighAccuracy: false, timeout: 1500, maximumAge: 60000 }
    );

    if (resolved) return;

    // Step 2: Race between GPS and watchPosition trick
    let watchId: number | null = null;
    let gpsTimer: ReturnType<typeof setTimeout> | null = null;

    // watchPosition trick (works better on Android)
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        if (gpsTimer) clearTimeout(gpsTimer);
        handleSuccess(pos, false);
      },
      () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );

    // GPS getCurrentPosition in parallel
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        handleSuccess(pos, false);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );

    // Step 3: Network fallback after 4 seconds
    gpsTimer = setTimeout(() => {
      if (!resolved) {
        navigator.geolocation.getCurrentPosition(
          (pos) => handleSuccess(pos, true),
          () => {
            // Step 4: Very permissive last resort
            navigator.geolocation.getCurrentPosition(
              (pos) => handleSuccess(pos, true),
              handleError,
              { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
            );
          },
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 30000 }
        );
      }
    }, 4000);
  }, [onLocationFound]);

  const sizeClasses = {
    sm: "h-10 px-3",
    md: "h-14 px-5",
    lg: "h-16 px-6",
  };

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const statusConfig = {
    idle: {
      icon: <Target className={iconSize[size]} />,
      color: "border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
      variant: "outline" as const,
    },
    locating: {
      icon: <Loader2 className={cn(iconSize[size], "animate-spin")} />,
      color: "border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600",
      variant: "outline" as const,
    },
    success: {
      icon: <CheckCircle2 className={iconSize[size]} />,
      color: "border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600",
      variant: "outline" as const,
    },
    error: {
      icon: <AlertCircle className={iconSize[size]} />,
      color: "border-2 border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600",
      variant: "outline" as const,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={getLocation}
          disabled={status === "locating"}
          variant={config.variant}
          className={cn(
            "rounded-2xl transition-all",
            sizeClasses[size],
            config.color,
            className
          )}
          title={labels[status]}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {config.icon}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Accuracy indicator */}
      <AnimatePresence>
        {status === "success" && accuracy !== null && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1"
          >
            {isNetworkFallback && (
              <Wifi className="w-3 h-3 text-orange-500" />
            )}
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                accuracy < 50
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : accuracy < 200
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              )}
            >
              ±{accuracy}{labels.meters}
            </span>
          </motion.div>
        )}
        {status === "locating" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
