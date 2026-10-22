// Public build-time routing only. Empty keeps the existing same-origin release.
export function portalOrigin(configured: string | undefined): string {
  if (!configured) return '';
  if (configured !== 'https://app.jouww.com') throw new Error('Unsupported portal origin');
  return configured;
}

export function portalHref(path: string, configured: string | undefined): string {
  if (/[\r\n]/.test(path) || !/^\/(?:login(?:\?portal=company)?|driver-login|register-company(?:\?lang=(?:ar|fr|nl))?)$/.test(path)) {
    throw new Error('Unsupported portal destination');
  }
  return portalOrigin(configured) + path;
}

export function registrationHandoff(origin: string, language: string, configured: string | undefined): string | null {
  const destination = portalOrigin(configured);
  if (!destination || origin === destination) return null;
  const lang = ['ar', 'fr', 'nl'].includes(language) ? language : 'fr';
  return portalHref(`/register-company?lang=${lang}`, configured);
}
