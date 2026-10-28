import {NextResponse, type NextRequest} from 'next/server';
import {originAllowed} from './lib/security-policy';

export function middleware(request: NextRequest) {
  const api = /^\/(next_api|api)(\/|$)/.test(request.nextUrl.pathname);
  const appOrigin = process.env.APP_ORIGIN || request.nextUrl.origin;
  const origin = request.headers.get('origin');
  const allowed = originAllowed(origin, appOrigin, process.env.TRUSTED_ORIGINS);
  const nonce = btoa(crypto.randomUUID());
  const hostname = request.nextUrl.hostname.toLowerCase();
  const marketingLocale = request.nextUrl.pathname.match(/^\/(fr|nl|ar)\/solutions(?:\/|$)/)?.[1];
  const csp = "default-src 'self'; script-src 'self' 'nonce-" + nonce + "'" + (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '') + "; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.mapbox.com https://nominatim.openstreetmap.org https://api.bigdatacloud.net; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
  const forwarded = new Headers(request.headers);
  forwarded.delete('x-marketing-locale');
  forwarded.set('Content-Security-Policy', csp);
  forwarded.set('x-nonce', nonce);
  if (marketingLocale) forwarded.set('x-marketing-locale', marketingLocale);
  let response: NextResponse;
  if (api && origin && !allowed) response = NextResponse.json({success: false, errorMessage: 'Origin not permitted'}, {status: 403});
  else if (api && request.method === 'OPTIONS') response = new NextResponse(null, {status: 204});
  else response = NextResponse.next({request:{headers:forwarded}});
  if (api && allowed) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Vary', 'Origin');
  }
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  response.headers.set('Content-Security-Policy', csp);
  if (process.env.NODE_ENV === 'production') response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (api || /^\/(admin|driver|company|distributor|invoice|documents|sign-contract|contract-print|pay)(\/|$)/.test(request.nextUrl.pathname)) response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  // Never index authenticated workflows, tokenized documents or the
  // legacy/application hosts even if a crawler ignores robots.txt.
  const publicMarketingRoute = request.nextUrl.pathname === '/' ||
    /^\/(fr|nl|ar)\/solutions(?:\/|$)/.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname === '/privacy-policy';
  if (!publicMarketingRoute || hostname === 'app.jouww.com' || hostname === 'jouw-driver.duckdns.org') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  return response;
}
export const config = {matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']};
