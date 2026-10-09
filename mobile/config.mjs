import { isIP } from 'node:net';
export function mobileConfig(environment = process.env) {
  const raw = environment.MOBILE_APP_URL;
  if (!raw) throw new Error('MOBILE_APP_URL must be the secure deployed application origin');
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/' ||
    !url.hostname.includes('.') || isIP(url.hostname) || /(^|\.)(localhost|local|internal|example|test|invalid)(\.|$)/i.test(url.hostname) ||
    /your-production|yourdomain/i.test(url.hostname)) throw new Error('Use a real public HTTPS origin without a path, port, credentials or placeholders');
  return {
    appId: 'com.jouwdriver.app', appName: 'Jouw Driver', webDir: 'www',
    server: { url: url.origin, cleartext: false, androidScheme: 'https', allowNavigation: [url.hostname] },
    android: { allowMixedContent: false, webContentsDebuggingEnabled: false, useLegacyBridge: true, backgroundColor: '#020817' },
    ios: { contentInset: 'automatic', backgroundColor: '#020817', allowsLinkPreview: false },
  };
}
