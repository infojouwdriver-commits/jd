export const LEGACY_APP_ORIGIN = 'https://jouw-driver.duckdns.org';
// Expo inlines EXPO_PUBLIC_APP_ORIGIN into the signed build. Never read this
// destination from a deep link, server response, saved preference or QR code.
export function nativeAppOrigin(configured: string | undefined): string {
  if (!configured) return LEGACY_APP_ORIGIN;
  if (configured !== LEGACY_APP_ORIGIN && configured !== 'https://app.jouww.com') {
    throw new Error('Unsupported native application origin');
  }
  return configured;
}
export const APP_ORIGIN = nativeAppOrigin(process.env.EXPO_PUBLIC_APP_ORIGIN);
export function companyRegistrationUrl(language: string): string {
  const lang = ['ar', 'fr', 'nl'].includes(language) ? language : 'fr';
  return `${APP_ORIGIN}/register-company?lang=${lang}`;
}
