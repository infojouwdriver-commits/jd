import type {NextRequest} from 'next/server';
import {createHmac} from 'node:crypto';
import {createPostgrestClient} from './postgrest';
import {generateAdminUserToken} from './auth';
const local = new Map<string, {count: number; reset: number}>();
export async function rateLimit(request: NextRequest, path: string): Promise<Response | null> {
  const auth = request.method !== 'GET' && (path.startsWith('/next_api/auth/') || path.endsWith('/login') || path === '/next_api/driver-profile');
  const max = auth ? 10 : 120;
  const ip = process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') || 'unknown' : 'unknown';
  return consumeRateLimit(`${auth ? 'auth' : 'api'}:${ip}`, max);
}
export async function consumeRateLimit(identity: string, max: number): Promise<Response | null> {
  const secret = process.env.RATE_LIMIT_SECRET || process.env.JWT_SECRET;
  if (!secret) return new Response('{"success":false,"errorMessage":"Security configuration unavailable"}', {status:503});
  // All login/OTP endpoints share a bucket; aliases cannot multiply attempts.
  const key = createHmac('sha256', secret).update(identity).digest('hex');
  let allowed = false;
  if (process.env.NODE_ENV !== 'production') {
    const now = Date.now();
    for (const [k,v] of local) if (v.reset < now) local.delete(k);
    const entry = local.get(key) || {count: 0, reset: now + 60000};
    entry.count++; local.set(key, entry); allowed = entry.count <= max;
  } else {
    try {
      const token = await generateAdminUserToken();
      const result = await createPostgrestClient(token).rpc('security_rate_limit', {p_key:key, p_limit:max});
      if (result.error) throw new Error('Rate limit storage failed');
      allowed = result.data === true;
    } catch { return new Response('{"success":false,"errorMessage":"Security service unavailable"}', {status:503}); }
  }
  return allowed ? null : new Response('{"success":false,"errorMessage":"Too many requests"}', {status:429, headers:{'Content-Type':'application/json','Retry-After':'60'}});
}
