"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
export function useOperationData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const sequence = useRef(0),
    previous = useRef(endpoint);
  useEffect(() => {
    const controller = new AbortController(),
      current = ++sequence.current,
      timer = setTimeout(
        () => controller.abort(new DOMException("Timeout", "TimeoutError")),
        20000,
      );
    setLoading(true);
    setError("");
    if (previous.current !== endpoint) {
      setData(null);
      previous.current = endpoint;
    }
    api
      .get<T>(endpoint, undefined, { signal: controller.signal })
      .then((value) => {
        if (current === sequence.current) setData(value);
      })
      .catch((e: Error) => {
        if (current === sequence.current) setError(e.message);
      })
      .finally(() => {
        clearTimeout(timer);
        if (current === sequence.current) setLoading(false);
      });
    return () => {
      if (current === sequence.current) sequence.current = current + 1;
      controller.abort();
      clearTimeout(timer);
    };
  }, [endpoint, revision]);
  const reload = useCallback(() => setRevision((r) => r + 1), []);
  return { data, loading, error, reload };
}
