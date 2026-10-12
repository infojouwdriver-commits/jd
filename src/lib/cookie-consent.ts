export const COOKIE_CONSENT_KEY = 'gdpr_cookie_consent';
export const COOKIE_CONSENT_VERSION = '1.0';
export const COOKIE_PREFERENCES_EVENT = 'open-cookie-preferences';

export interface CookieConsent {
  version: string;
  timestamp: string;
  categories: Record<string, boolean>;
}

let sessionConsent: CookieConsent | null = null;

export function parseCookieConsent(value: string | null): CookieConsent | null {
  if (!value) return null;
  try {
    const consent = JSON.parse(value);
    if (consent?.version !== COOKIE_CONSENT_VERSION ||
        typeof consent.timestamp !== 'string' || !Number.isFinite(Date.parse(consent.timestamp)) ||
        !consent.categories || Array.isArray(consent.categories) ||
        consent.categories.essential !== true ||
        Object.values(consent.categories).some(value => typeof value !== 'boolean')) return null;
    return consent;
  } catch { return null; }
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const candidates: CookieConsent[] = sessionConsent ? [sessionConsent] : [];
  try {
    const consent = parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY));
    if (consent) candidates.push(consent);
  } catch { /* Storage may be disabled; use the first-party fallback. */ }
  try {
    const prefix = COOKIE_CONSENT_KEY + '=';
    const cookie = document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(prefix));
    const consent = cookie ? parseCookieConsent(decodeURIComponent(cookie.slice(prefix.length))) : null;
    if (consent) candidates.push(consent);
  } catch { /* Keep the choice for this session even if all storage is disabled. */ }
  return candidates.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0] ?? null;
}

export function saveCookieConsent(categories: Record<string, boolean>): CookieConsent {
  const consent: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: { ...categories, essential: true },
  };
  sessionConsent = consent;
  const serialized = JSON.stringify(consent);
  try { window.localStorage.setItem(COOKIE_CONSENT_KEY, serialized); } catch { /* Use cookie fallback. */ }
  try {
    document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(serialized)}; Path=/; Max-Age=15552000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
  } catch { /* The current session still retains the user's choice. */ }
  return consent;
}
