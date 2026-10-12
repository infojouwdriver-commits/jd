'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { COOKIE_PREFERENCES_EVENT } from '@/lib/cookie-consent';

export default function CookiePreferencesButton() {
  const { language } = useLanguage();
  const labels = { ar: 'تفضيلات ملفات الارتباط', fr: 'Préférences des cookies', nl: 'Cookievoorkeuren' };
  return <button type="button" className="text-sm underline underline-offset-4 p-2 rounded-lg focus-visible:outline focus-visible:outline-2"
    onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}>{labels[language]}</button>;
}
