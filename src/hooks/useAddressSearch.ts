"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { buildBelgianSearchUrl, parseBelgianAddresses } from "../../driver-app/src/native-addresses";
import type { AddressSuggestion } from "@/lib/address-search";
export type { AddressSuggestion } from "@/lib/address-search";

interface UseAddressSearchOptions {
  countryCode?: string;
  language?: string;
  limit?: number;
  debounceMs?: number;
  currentLocation?: { lat: number; lon: number } | null;
}

export function useAddressSearch(options: UseAddressSearchOptions = {}) {
  const { limit = 8, debounceMs = 400, currentLocation, language = "fr" } = options;
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const location = useRef(currentLocation);
  location.current = currentLocation;
  const suggestions = results.slice(0,limit);
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
        const point = location.current;
        const url = buildBelgianSearchUrl(query,language,point);
        const response = await fetch(url,{signal:requestController.signal,credentials:'omit',redirect:'error'});
        if (!response.ok) throw Error('Search failed');
        const data: unknown = await response.json();
        const rows = parseBelgianAddresses(data,point,query);
        if (generation.current === version) setResults(rows.map(row=>({
          display_name:row.label, title:row.title, subtitle:row.subtitle, lat:String(row.lat),lon:String(row.lon),
        })));
      } catch {
        if (generation.current === version) setResults([]);
      } finally {
        if (generation.current === version) setIsSearching(false);
      }
    }, debounceMs);
  }, [cancel, debounceMs, language]);
  return { suggestions, isSearching, search, clear };
}
