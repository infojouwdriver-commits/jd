"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { belgianSuggestions, sortByDistance } from "@/lib/address-search";
import type { AddressSuggestion } from "@/lib/address-search";
export type { AddressSuggestion } from "@/lib/address-search";

interface UseAddressSearchOptions {
  countryCode?: string;
  limit?: number;
  debounceMs?: number;
  currentLocation?: { lat: number; lon: number } | null;
}

export function useAddressSearch(options: UseAddressSearchOptions = {}) {
  const { limit = 8, debounceMs = 300, currentLocation } = options;
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const location = useRef(currentLocation);
  location.current = currentLocation;
  // Re-rank immediately when GPS becomes available or changes, even without typing.
  const suggestions = useMemo(() => sortByDistance(results, currentLocation).slice(0, limit), [results, currentLocation, limit]);
  const cancel = useCallback(() => {
    generation.current++;
    if (timer.current) clearTimeout(timer.current);
    controller.current?.abort();
  }, []);
  useEffect(() => cancel, [cancel]);
  const clear = useCallback(() => {
    cancel();
    setResults([]);
    setIsSearching(false);
  }, [cancel]);
  const search = useCallback((input: string) => {
    cancel();
    setResults([]);
    const query = input.trim();
    if (query.length < 3) { setIsSearching(false); return; }
    const version = generation.current;
    setIsSearching(true);
    timer.current = setTimeout(async () => {
      const requestController = new AbortController();
      controller.current = requestController;
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.search = new URLSearchParams({ countrycodes: "be", format: "json", q: query, limit: "40", addressdetails: "1" }).toString();
        const point = location.current;
        if (point && Number.isFinite(point.lat) && Number.isFinite(point.lon)) {
          // Prefer nearby matches, without excluding destinations elsewhere in Belgium.
          url.searchParams.set("viewbox", `${point.lon - 0.3},${point.lat + 0.2},${point.lon + 0.3},${point.lat - 0.2}`);
          url.searchParams.set("bounded", "0");
        }
        const response = await fetch(url, { signal: requestController.signal, headers: { "Accept-Language": "nl,fr" } });
        if (!response.ok) throw new Error("Search failed");
        const data: unknown = await response.json();
        if (generation.current === version) setResults(belgianSuggestions(data));
      } catch {
        if (generation.current === version) setResults([]);
      } finally {
        if (generation.current === version) setIsSearching(false);
      }
    }, debounceMs);
  }, [cancel, debounceMs]);
  return { suggestions, isSearching, search, clear };
}
