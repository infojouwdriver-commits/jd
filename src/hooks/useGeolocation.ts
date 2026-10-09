
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface GeolocationPoint {
  lat: number;
  lon: number;
  accuracy?: number;
  speed?: number;
  timestamp: number;
}

interface GeolocationState {
  location: GeolocationPoint | null;
  error: string | null;
  permissionState: "prompt" | "granted" | "denied" | "unknown";
  isWatching: boolean;
  isLocating: boolean;
  accuracy: number | null;
}

interface UseGeolocationOptions {
  onLocationUpdate?: (point: GeolocationPoint) => void;
  language?: "nl" | "fr" | "ar";
}

const ERROR_MESSAGES = {
  nl: {
    notSupported: "Browser ondersteunt geen geolocatie",
    denied: "Locatietoegang geweigerd. Schakel GPS in via browserinstellingen",
    unavailable: "Locatie-informatie niet beschikbaar. Controleer GPS-instellingen",
    timeout: "Locatieverzoek time-out. Probeer opnieuw",
    unknown: "Kan locatie niet bepalen",
  },
  fr: {
    notSupported: "Le navigateur ne prend pas en charge la géolocalisation",
    denied: "Accès à la localisation refusé. Activez le GPS dans les paramètres du navigateur",
    unavailable: "Informations de localisation non disponibles. Vérifiez les paramètres GPS",
    timeout: "Délai d'attente de localisation dépassé. Réessayez",
    unknown: "Impossible de déterminer la localisation",
  },
  ar: {
    notSupported: "المتصفح لا يدعم تحديد الموقع الجغرافي",
    denied: "تم رفض الوصول إلى الموقع. يرجى تفعيل GPS من إعدادات المتصفح",
    unavailable: "معلومات الموقع غير متاحة. تحقق من إعدادات GPS",
    timeout: "انتهت مهلة طلب الموقع. حاول مرة أخرى",
    unknown: "تعذر تحديد الموقع",
  },
};

// watchPosition trick: Android responds faster to watch than getCurrentPosition
function getPositionViaWatch(timeoutMs: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let watchId: number;
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        navigator.geolocation.clearWatch(watchId);
        reject({ code: 3, message: "Watch timeout" });
      }
    }, timeoutMs);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          navigator.geolocation.clearWatch(watchId);
          resolve(pos);
        }
      },
      (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          navigator.geolocation.clearWatch(watchId);
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { onLocationUpdate, language = "nl" } = options;
  const msgs = ERROR_MESSAGES[language] ?? ERROR_MESSAGES["nl"];

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    permissionState: "unknown",
    isWatching: false,
    isLocating: false,
    accuracy: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const abortRef = useRef<boolean>(false);
  const lastLocationRef = useRef<GeolocationPoint | null>(null);

  // Check permission state
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) return "prompt" as const;
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setState((prev) => ({ ...prev, permissionState: result.state }));
      result.onchange = () => {
        setState((prev) => ({ ...prev, permissionState: result.state }));
      };
      return result.state;
    } catch {
      return "prompt" as const;
    }
  }, []);

  // Multi-strategy location fetch with Android-optimized fallbacks
  const getLocation = useCallback(
    (showToast = false): Promise<GeolocationPoint | null> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          setState((prev) => ({ ...prev, error: msgs.notSupported }));
          resolve(null);
          return;
        }

        setState((prev) => ({ ...prev, isLocating: true, error: null }));

        const handleSuccess = (pos: GeolocationPosition) => {
          const point: GeolocationPoint = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed ?? undefined,
            timestamp: Date.now(),
          };
          lastLocationRef.current = point;
          setState((prev) => ({
            ...prev,
            location: point,
            error: null,
            permissionState: "granted",
            isLocating: false,
            accuracy: pos.coords.accuracy,
          }));
          onLocationUpdate?.(point);
          resolve(point);
        };

        const handleFinalError = (err: GeolocationPositionError) => {
          // If we have a cached location, use it silently
          if (lastLocationRef.current) {
            setState((prev) => ({ ...prev, isLocating: false }));
            resolve(lastLocationRef.current);
            return;
          }

          let errorMsg = msgs.unknown;
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = msgs.denied;
            setState((prev) => ({
              ...prev,
              permissionState: "denied",
              error: errorMsg,
              isLocating: false,
            }));
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMsg = msgs.unavailable;
            setState((prev) => ({ ...prev, error: errorMsg, isLocating: false }));
          } else if (err.code === err.TIMEOUT) {
            errorMsg = msgs.timeout;
            setState((prev) => ({ ...prev, error: errorMsg, isLocating: false }));
          } else {
            setState((prev) => ({ ...prev, error: errorMsg, isLocating: false }));
          }
          resolve(null);
        };

        // Strategy 1: Try cached position first (instant)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Use cached immediately, but keep trying for better accuracy
            if (pos.coords.accuracy < 300) {
              handleSuccess(pos);
              return;
            }
            // Cached but low accuracy - use it and try to improve
            const quickPoint: GeolocationPoint = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              speed: pos.coords.speed ?? undefined,
              timestamp: Date.now(),
            };
            lastLocationRef.current = quickPoint;
            setState((prev) => ({
              ...prev,
              location: quickPoint,
              error: null,
              permissionState: "granted",
              accuracy: pos.coords.accuracy,
            }));

            // Strategy 2: Race GPS vs watchPosition trick
            let raceSettled = false;

            const settleRace = (finalPos: GeolocationPosition) => {
              if (!raceSettled) {
                raceSettled = true;
                handleSuccess(finalPos);
              }
            };

            // GPS attempt
            navigator.geolocation.getCurrentPosition(
              settleRace,
              () => {
                // GPS failed, watchPosition trick
                if (!raceSettled) {
                  getPositionViaWatch(8000)
                    .then(settleRace)
                    .catch(() => {
                      if (!raceSettled) {
                        raceSettled = true;
                        // Use the cached position we already have
                        setState((prev) => ({ ...prev, isLocating: false }));
                        resolve(quickPoint);
                      }
                    });
                }
              },
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );

            // watchPosition trick starts after 2s delay
            setTimeout(() => {
              if (!raceSettled) {
                getPositionViaWatch(6000)
                  .then(settleRace)
                  .catch(() => {});
              }
            }, 2000);
          },
          () => {
            // No cached position - go straight to GPS + watchPosition race
            let raceSettled = false;

            const settleRace = (pos: GeolocationPosition) => {
              if (!raceSettled) {
                raceSettled = true;
                handleSuccess(pos);
              }
            };

            // GPS attempt
            navigator.geolocation.getCurrentPosition(
              settleRace,
              (err) => {
                if (!raceSettled) {
                  // Try watchPosition trick
                  getPositionViaWatch(10000)
                    .then(settleRace)
                    .catch(() => {
                      if (!raceSettled) {
                        raceSettled = true;
                        // Last resort: very permissive
                        navigator.geolocation.getCurrentPosition(
                          handleSuccess,
                          handleFinalError,
                          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
                        );
                      }
                    });
                }
              },
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
            );

            // Low accuracy fallback after 3s
            setTimeout(() => {
              if (!raceSettled) {
                navigator.geolocation.getCurrentPosition(
                  settleRace,
                  () => {},
                  { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
                );
              }
            }, 3000);
          },
          { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
        );
      });
    },
    [msgs, onLocationUpdate]
  );

  // Start watching position continuously
  const startWatching = useCallback(
    (onUpdate: (point: GeolocationPoint) => void) => {
      if (!navigator.geolocation) return;
      if (watchIdRef.current !== null) return;

      abortRef.current = false;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (abortRef.current) return;
          const point: GeolocationPoint = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed ?? undefined,
            timestamp: Date.now(),
          };
          lastLocationRef.current = point;
          setState((prev) => ({
            ...prev,
            location: point,
            error: null,
            permissionState: "granted",
            isWatching: true,
            accuracy: pos.coords.accuracy,
          }));
          onUpdate(point);
        },
        (err) => {
          if (abortRef.current) return;
          if (err.code === err.PERMISSION_DENIED) {
            setState((prev) => ({
              ...prev,
              permissionState: "denied",
              error: msgs.denied,
              isWatching: false,
            }));
          }
          // For other errors during watch, keep last known location
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );

      setState((prev) => ({ ...prev, isWatching: true }));
    },
    [msgs]
  );

  // Stop watching position
  const stopWatching = useCallback(() => {
    abortRef.current = true;
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isWatching: false }));
  }, []);

  useEffect(() => {
    checkPermission();
    return () => {
      stopWatching();
    };
  }, [checkPermission, stopWatching]);

  return {
    ...state,
    getLocation,
    startWatching,
    stopWatching,
    checkPermission,
    lastLocation: lastLocationRef.current,
  };
}
