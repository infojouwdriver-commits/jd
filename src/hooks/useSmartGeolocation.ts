
"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface LocationPoint {
  lat: number;
  lon: number;
  timestamp: number;
  speed?: number;
  accuracy?: number;
}

export interface GeolocationState {
  location: { lat: number; lon: number } | null;
  error: string | null;
  permissionState: "prompt" | "granted" | "denied" | "unknown";
  isLocating: boolean;
  accuracy: number | null;
}

// Strategy 1: High accuracy GPS - best for Android outdoors
async function getHighAccuracyPosition(timeoutMs = 8000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 5000,
    });
  });
}

// Strategy 2: Network/Cell based - faster on Android indoors
async function getLowAccuracyPosition(timeoutMs = 6000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: timeoutMs,
      maximumAge: 30000,
    });
  });
}

// Strategy 3: Cached position - last known location (very fast)
async function getCachedPosition(maxAgeMs = 120000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 3000,
      maximumAge: maxAgeMs,
    });
  });
}

// Strategy 4: watchPosition trick - Android sometimes responds faster to watch
async function getPositionViaWatch(timeoutMs = 10000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let watchId: number;
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        navigator.geolocation.clearWatch(watchId);
        reject(new Error("Watch position timeout"));
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
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      }
    );
  });
}

// Race: high accuracy vs low accuracy - whichever wins first
async function getRacePosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const errors: any[] = [];

    const tryResolve = (pos: GeolocationPosition) => {
      if (!settled) {
        settled = true;
        resolve(pos);
      }
    };

    const tryReject = (err: any) => {
      errors.push(err);
      if (errors.length >= 2 && !settled) {
        settled = true;
        reject(errors[0]);
      }
    };

    // Start both simultaneously
    getHighAccuracyPosition(7000).then(tryResolve).catch(tryReject);

    // Low accuracy starts with 1.5s delay to give GPS a chance first
    setTimeout(() => {
      if (!settled) {
        getLowAccuracyPosition(5000).then(tryResolve).catch(tryReject);
      }
    }, 1500);
  });
}

export function useSmartGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    permissionState: "unknown",
    isLocating: false,
    accuracy: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const retryCountRef = useRef(0);

  // Check permission state on mount
  useEffect(() => {
    if (!navigator?.permissions) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        setState((prev) => ({
          ...prev,
          permissionState: result.state as "prompt" | "granted" | "denied",
        }));
        result.onchange = () => {
          setState((prev) => ({
            ...prev,
            permissionState: result.state as "prompt" | "granted" | "denied",
          }));
        };
      })
      .catch(() => {});
  }, []);

  const getLocation = useCallback(
    async (showToast = false): Promise<boolean> => {
      if (!navigator?.geolocation) {
        setState((prev) => ({
          ...prev,
          error: "Geolocatie wordt niet ondersteund door deze browser",
          permissionState: "denied",
        }));
        return false;
      }

      setState((prev) => ({ ...prev, isLocating: true, error: null }));

      try {
        let position: GeolocationPosition | null = null;

        // Step 1: Try cached position first (instant response)
        try {
          position = await getCachedPosition(60000);
          // If cached position is good enough (< 500m accuracy), use it immediately
          // and continue trying for better accuracy in background
          if (position && position.coords.accuracy < 500) {
            const quickLocation = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            lastLocationRef.current = quickLocation;
            setState((prev) => ({
              ...prev,
              location: quickLocation,
              error: null,
              permissionState: "granted",
              accuracy: position!.coords.accuracy,
              isLocating: true, // still locating for better accuracy
            }));
          }
        } catch {
          // No cached position, continue
        }

        // Step 2: Race between GPS and Network
        try {
          position = await getRacePosition();
        } catch {
          // Step 3: Try watchPosition trick (works better on some Android devices)
          try {
            position = await getPositionViaWatch(10000);
          } catch {
            // Step 4: Last resort - very permissive settings
            try {
              position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: false,
                  timeout: 20000,
                  maximumAge: 300000, // Accept up to 5 minutes old
                });
              });
            } catch {
              // All strategies failed
            }
          }
        }

        if (position) {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          lastLocationRef.current = newLocation;
          retryCountRef.current = 0;

          setState((prev) => ({
            ...prev,
            location: newLocation,
            error: null,
            isLocating: false,
            permissionState: "granted",
            accuracy: position!.coords.accuracy,
          }));
          return true;
        }

        // If we have a cached location, use it as fallback
        if (lastLocationRef.current) {
          setState((prev) => ({
            ...prev,
            isLocating: false,
            error: null,
          }));
          return true;
        }

        setState((prev) => ({
          ...prev,
          isLocating: false,
          error: "Kan locatie niet bepalen. Probeer opnieuw.",
        }));
        return false;
      } catch (error: any) {
        let errorMsg = "Kan locatie niet bepalen";

        if (error?.code === 1) {
          errorMsg = "Locatietoegang geweigerd. Schakel GPS in via instellingen";
          setState((prev) => ({
            ...prev,
            permissionState: "denied",
            error: errorMsg,
            isLocating: false,
          }));
        } else if (error?.code === 2) {
          errorMsg = "Locatie-informatie niet beschikbaar. Controleer GPS-instellingen";
          setState((prev) => ({ ...prev, error: errorMsg, isLocating: false }));
        } else if (error?.code === 3) {
          errorMsg = "Locatieverzoek time-out. Probeer opnieuw";
          setState((prev) => ({ ...prev, error: errorMsg, isLocating: false }));
        } else {
          setState((prev) => ({ ...prev, error: errorMsg, isLocating: false }));
        }

        return false;
      }
    },
    []
  );

  // Start watching position (for active trips)
  const startWatching = useCallback(
    (onUpdate: (point: LocationPoint) => void) => {
      if (!navigator?.geolocation) return;

      // Stop any existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const point: LocationPoint = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timestamp: Date.now(),
            speed: position.coords.speed ?? undefined,
            accuracy: position.coords.accuracy,
          };

          lastLocationRef.current = { lat: point.lat, lon: point.lon };

          setState((prev) => ({
            ...prev,
            location: { lat: point.lat, lon: point.lon },
            error: null,
            permissionState: "granted",
            accuracy: position.coords.accuracy,
          }));

          onUpdate(point);
        },
        (error) => {
          void 0;
          // Don't update error state during watch - just log it
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );
    },
    []
  );

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    getLocation,
    startWatching,
    stopWatching,
    lastLocation: lastLocationRef.current,
  };
}
