
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, COOKIE_PREFERENCES_EVENT, readCookieConsent, saveCookieConsent } from '@/lib/cookie-consent';

interface CookieCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_required: boolean;
  display_order: number;
}

const T = {
  nl: {
    title: "Wij gebruiken cookies",
    desc: "We gebruiken cookies om uw ervaring te verbeteren. U kunt uw voorkeuren instellen.",
    acceptAll: "Alles accepteren",
    reject: "Weigeren",
    customize: "Aanpassen",
    save: "Opslaan",
    required: "Verplicht",
    privacy: "Privacybeleid",
  },
  fr: {
    title: "Nous utilisons des cookies",
    desc: "Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences.",
    acceptAll: "Tout accepter",
    reject: "Refuser",
    customize: "Personnaliser",
    save: "Enregistrer",
    required: "Requis",
    privacy: "Politique de confidentialité",
  },
  ar: {
    title: "نستخدم ملفات تعريف الارتباط",
    desc: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك إدارة تفضيلاتك.",
    acceptAll: "قبول الكل",
    reject: "رفض",
    customize: "تخصيص",
    save: "حفظ",
    required: "مطلوب",
    privacy: "سياسة الخصوصية",
  },
};

const DEFAULT_CATEGORIES: CookieCategory[] = [
  { id: 1, code: "essential", name: "Essential", description: "Required for site functionality.", is_required: true, display_order: 0 },
  { id: 2, code: "analytics", name: "Analytics", description: "Help us understand how you use the app.", is_required: false, display_order: 1 },
  { id: 3, code: "marketing", name: "Marketing", description: "Personalized content and offers.", is_required: false, display_order: 2 },
];

export default function CookieBanner() {
  const { user } = useAuth();
  const { language, isRtl } = useLanguage();
  const t = T[language] ?? T.fr;

  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [categories, setCategories] = useState<CookieCategory[]>(DEFAULT_CATEGORIES);
  const [choices, setChoices] = useState<Record<string, boolean>>({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    const open = () => { setExpanded(true); setShow(true); };
    const update = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY && readCookieConsent()) setShow(false);
    };
    window.addEventListener(COOKIE_PREFERENCES_EVENT, open);
    window.addEventListener('storage', update);
    const timer = readCookieConsent() ? undefined : setTimeout(() => {
      if (!readCookieConsent()) setShow(true);
    }, 1800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, open);
      window.removeEventListener('storage', update);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    let active = true;
    let settled = false;
    setCategoriesReady(false);
    const applyCategories = (cats: CookieCategory[]) => {
      if (!active || settled) return;
      settled = true;
      setCategories(cats);
      const saved = readCookieConsent()?.categories ?? {};
      setChoices(Object.fromEntries(cats.map(c => [c.code, c.is_required || c.code === 'essential' || saved[c.code] === true])));
      setCategoriesReady(true);
    };
    const fallback = setTimeout(() => applyCategories(DEFAULT_CATEGORIES), 2000);
    api.get<CookieCategory[]>("/gdpr/cookie-categories")
      .then((data) => {
        applyCategories(data?.length ? data : DEFAULT_CATEGORIES);
      })
      .catch(() => applyCategories(DEFAULT_CATEGORIES));
    return () => { active = false; clearTimeout(fallback); };
  }, [show]);

  const persist = useCallback((finalChoices: Record<string, boolean>) => {
    const consent = saveCookieConsent(finalChoices);
    setShow(false);
    setExpanded(false);
    window.dispatchEvent(new CustomEvent("privacy-consent-changed", {detail: consent.categories}));
    if (user) {
      const payload = Object.entries(consent.categories).map(([key, granted]) => ({ consent_scope: "cookie_category", consent_key: key, consent_version: COOKIE_CONSENT_VERSION, granted }));
      void api.post("/gdpr/consents", { consents: payload }).catch(() => {
        // The saved browser preference stays effective when account sync is unavailable.
      });
    }
  }, [user]);

  const acceptAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    categories.forEach((c) => { all[c.code] = true; });
    persist(all);
  }, [categories, persist]);

  const rejectNonEssential = useCallback(() => {
    const minimal: Record<string, boolean> = {};
    categories.forEach((c) => { minimal[c.code] = c.is_required; });
    persist(minimal);
  }, [categories, persist]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          dir={isRtl ? "rtl" : "ltr"}
          data-cookie-banner
          className="fixed bottom-0 left-0 right-0 z-[99999] p-3 sm:p-4"
        >
          <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t.desc}</p>
              </div>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-100 dark:border-slate-800">
                  <div className="px-4 py-3 space-y-3">
                    {categories.map((cat) => (
                      <div key={cat.code} className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                            {cat.is_required && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">{t.required}</span>
                            )}
                          </div>
                          {cat.description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>}
                        </div>
                        <Switch checked={choices[cat.code] ?? false} onCheckedChange={() => { if (!cat.is_required) setChoices((p) => ({ ...p, [cat.code]: !p[cat.code] })); }} disabled={!categoriesReady || cat.is_required || cat.code === 'essential'} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center gap-2 justify-between border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Link href="/privacy-policy" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors">
                  <Shield className="w-3 h-3" />{t.privacy}
                </Link>
                <button onClick={() => setExpanded((v) => !v)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors">
                  {t.customize}{expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={!categoriesReady} className="h-8 text-xs rounded-xl" onClick={rejectNonEssential}>{t.reject}</Button>
                {expanded
                  ? <Button size="sm" disabled={!categoriesReady} className="h-8 text-xs rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600" onClick={() => persist(choices)}>{t.save}</Button>
                  : <Button size="sm" disabled={!categoriesReady} className="h-8 text-xs rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600" onClick={acceptAll}>{t.acceptAll}</Button>
                }
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
