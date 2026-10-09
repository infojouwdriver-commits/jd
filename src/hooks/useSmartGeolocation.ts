"use client";
import { useCallback } from 'react';
import { useGeolocation, type GeolocationPoint } from './useGeolocation';
export type LocationPoint = GeolocationPoint;
export function useSmartGeolocation() {
  const geo = useGeolocation();
  const { getLocation: fetchLocation } = geo;
  const getLocation = useCallback(async () => (await fetchLocation()) !== null, [fetchLocation]);
  return { ...geo, getLocation };
}
