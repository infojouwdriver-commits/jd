
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "fr" | "nl" | "ar";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (nextLanguage: AppLanguage) => void;
  isRtl: boolean;
}

const LANGUAGE_STORAGE_KEY = "driver_language";
const LANGUAGE_COOKIE_KEY = "driver_language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function normalizeLanguage(input?: string | null): AppLanguage | null {
  if (!input) return null;
  const value = input.toLowerCase();

  if (value.startsWith("fr")) return "fr";
  if (value.startsWith("nl")) return "nl";
  if (value.startsWith("ar")) return "ar";

  return null;
}

function readCookieLanguage(): AppLanguage | null {
  if (typeof document === "undefined") return null;

  const raw = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${LANGUAGE_COOKIE_KEY}=`))
    ?.split("=")[1];

  return normalizeLanguage(raw);
}

function detectBrowserLanguage(): AppLanguage {
  if (typeof navigator === "undefined") return "fr";
  const detected = normalizeLanguage(navigator.language);
  return detected || "fr";
}

function setLanguageCookie(language: AppLanguage): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${language}; path=/; max-age=31536000; samesite=lax`;
}

function setDocumentDirection(language: AppLanguage): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("fr");

  useEffect(() => {
    const cookieLanguage = readCookieLanguage();
    const storageLanguage = normalizeLanguage(
      typeof window !== "undefined" ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null
    );
    // Editorial search pages have a fixed URL language; do not override it
    // with a stored preference after hydration.
    const pathLanguage = typeof window === 'undefined'
      ? null
      : normalizeLanguage(window.location.pathname.match(/^\/(fr|nl|ar)\/solutions(?:\/|$)/)?.[1]);
    const initialLanguage = pathLanguage || cookieLanguage || storageLanguage || detectBrowserLanguage();

    setLanguageState(initialLanguage);
    setDocumentDirection(initialLanguage);
  }, []);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
    setLanguageCookie(nextLanguage);
    setDocumentDirection(nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isRtl: language === "ar",
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
