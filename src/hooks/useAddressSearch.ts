
"use client";

import { useState, useRef, useCallback } from "react";

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  distance?: number;
}

interface UseAddressSearchOptions {
  countryCode?: string;
  limit?: number;
  debounceMs?: number;
  currentLocation?: { lat: number; lon: number } | null;
}

const searchCache = new Map<string, AddressSuggestion[]>();

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useAddressSearch(options: UseAddressSearchOptions = {}) {
  const {
    countryCode = "be",
    limit = 8,
    debounceMs = 300,
    currentLocation,
  } = options;

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const search = useCallback(
    (query: string) => {
      // Clear previous debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (query.length < 3) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      // Check cache first
      const cacheKey = `${countryCode}:${query.toLowerCase().trim()}`;
      if (searchCache.has(cacheKey)) {
        const cached = searchCache.get(cacheKey)!;
        setSuggestions(sortByDistance(cached, currentLocation));
        return;
      }

      setIsSearching(true);

      debounceTimer.current = setTimeout(async () => {
        // Cancel previous request
        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();

        try {
          const url = `https://nominatim.openstreetmap.org/search?countrycodes=${countryCode}&format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`;

          const response = await fetch(url, {
            signal: abortController.current.signal,
            headers: {
              "Accept-Language": "nl,fr",
            },
          });

          if (!response.ok) throw new Error("Search failed");

          const data: AddressSuggestion[] = await response.json();

          // Store in cache (max 100 entries)
          if (searchCache.size > 100) {
            const firstKey = searchCache.keys().next().value;
            if (firstKey) searchCache.delete(firstKey);
          }
          searchCache.set(cacheKey, data);

          setSuggestions(sortByDistance(data, currentLocation));
        } catch (err: any) {
          if (err?.name !== "AbortError") {
            console.error("Operation failed");
            setSuggestions([]);
          }
        } finally {
          setIsSearching(false);
        }
      }, debounceMs);
    },
    [countryCode, limit, debounceMs, currentLocation]
  );

  const clear = useCallback(() => {
    setSuggestions([]);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (abortController.current) abortController.current.abort();
  }, []);

  return { suggestions, isSearching, search, clear };
}

function sortByDistance(
  suggestions: AddressSuggestion[],
  currentLocation?: { lat: number; lon: number } | null
): AddressSuggestion[] {
  if (!currentLocation) return suggestions;
  return suggestions
    .map((s) => ({
      ...s,
      distance: calculateDistance(
        currentLocation.lat,
        currentLocation.lon,
        parseFloat(s.lat),
        parseFloat(s.lon)
      ),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}
