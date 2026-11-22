import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';

export type CompanyProvider = 'google' | 'apple';
const provider = z.enum(['google', 'apple']);
const identityFields = z.object({ provider, subject: z.string().min(1).max(255), email: z.string().trim().toLowerCase().email().max(254) });
const flowFields = z.object({
  provider, state: z.string(), nonce: z.string(), verifier: z.string(),
  language: z.enum(['ar','fr','nl']), intent: z.enum(['register','login']),
});
export type CompanySocialIdentity = z.infer<typeof identityFields>;
type Flow = z.infer<typeof flowFields>;
export const companySocialProofCookie = '__Host-jd-company-proof';
export const companySocialFlowCookie = '__Host-jd-company-oauth';
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const appleKeys = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export function companySocialConfig(kind: CompanyProvider) {
  if (!process.env.APP_ORIGIN) return null;
  let origin: URL;
  try { origin = new URL(process.env.APP_ORIGIN); } catch { return null; }
  if (origin.protocol !== 'https:' || origin.origin !== process.env.APP_ORIGIN.replace(/\/$/, '')) return null;
  const clientId = kind === 'google' ? process.env.COMPANY_GOOGLE_CLIENT_ID : process.env.COMPANY_APPLE_SERVICES_ID;
  const config = kind === 'google'
    ? { clientId, secret: process.env.COMPANY_GOOGLE_CLIENT_SECRET }
    : { clientId, team: process.env.COMPANY_APPLE_TEAM_ID, keyId: process.env.COMPANY_APPLE_KEY_ID, privateKey: process.env.COMPANY_APPLE_PRIVATE_KEY };
  if (!clientId || Object.values(config).some(value => !value)) return null;
  return { ...config, origin: origin.origin, clientId,
    redirectUri: new URL(`/company-access/${kind}/callback`, origin).href };
}

function signingKey() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error('Company identity signing unavailable');
  return createHash('sha256').update('jd-company-oauth-v1:').update(secret).digest();
}

async function seal(data: Flow | CompanySocialIdentity, audience: string, seconds: number) {
  return new SignJWT(data).setProtectedHeader({ alg:'HS256' }).setIssuer('jd-company-access')
    .setAudience(audience).setIssuedAt().setExpirationTime(`${seconds}s`).sign(signingKey());
}

async function unseal(token: string | undefined, audience: string) {
  if (!token) return null;
  try {
    return (await jwtVerify(token, signingKey(), { algorithms:['HS256'], issuer:'jd-company-access', audience })).payload;
  } catch { return null; }
}

export async function companySocialIdentity(token: string | undefined) {
  const parsed = identityFields.safeParse(await unseal(token, 'registration'));
  return parsed.success ? parsed.data : null;
}

export function makeCompanyProof(identity: CompanySocialIdentity) {
  return seal(identity, 'registration', 1800);
}

export async function createCompanySocialFlow(kind: CompanyProvider, language: Flow['language'], intent: Flow['intent']) {
  const config = companySocialConfig(kind);
  if (!config) return null;
  const flow: Flow = {
    provider:kind, language, intent, state:randomBytes(32).toString('base64url'),
    nonce:randomBytes(32).toString('base64url'), verifier:randomBytes(32).toString('base64url'),
  };
  const url = new URL(kind === 'google' ? 'https://accounts.google.com/o/oauth2/v2/auth' : 'https://appleid.apple.com/auth/authorize');
  url.search = new URLSearchParams({
    client_id:config.clientId, redirect_uri:config.redirectUri, response_type:'code',
    scope:kind === 'google' ? 'openid email' : 'email', state:flow.state, nonce:flow.nonce,
    ...(kind === 'google' ? { code_challenge:createHash('sha256').update(flow.verifier).digest('base64url'), code_challenge_method:'S256' } : { response_mode:'form_post' }),
  }).toString();
  return { url, cookie:await seal(flow, 'callback', 600) };
}

export async function exchangeCompanySocialCode(kind: CompanyProvider, token: string | undefined, state: string, code: string) {
  const config = companySocialConfig(kind);
  const parsed = flowFields.safeParse(await unseal(token, 'callback'));
  if (!config || !parsed.success || !state || state !== parsed.data.state || kind !== parsed.data.provider || !code || code.length > 4096) return null;
  const flow = parsed.data;
  const secret = kind === 'google' ? config.secret : await new SignJWT({})
    .setProtectedHeader({ alg:'ES256', kid:config.keyId! }).setIssuer(config.team!)
    .setAudience('https://appleid.apple.com').setSubject(config.clientId).setIssuedAt().setExpirationTime('5m')
    .sign(await importPKCS8(config.privateKey!.replaceAll('\\n','\n'), 'ES256'));
  const response = await fetch(kind === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://appleid.apple.com/auth/token', {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, redirect:'error',
    body:new URLSearchParams({
      grant_type:'authorization_code', code, client_id:config.clientId, client_secret:secret!, redirect_uri:config.redirectUri,
      ...(kind === 'google' ? {code_verifier:flow.verifier} : {}),
    }),
    cache:'no-store', signal:AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;
  const { id_token } = await response.json();
  if (typeof id_token !== 'string' || id_token.length > 20000) return null;
  const { payload } = await jwtVerify(id_token, kind === 'google' ? googleKeys : appleKeys, {
    issuer:kind === 'google' ? ['https://accounts.google.com','accounts.google.com'] : 'https://appleid.apple.com',
    audience:config.clientId, algorithms:['RS256'], requiredClaims:['exp','iat','sub','nonce'],
  });
  if (payload.nonce !== flow.nonce || (payload.email_verified !== true && !(kind === 'apple' && payload.email_verified === 'true'))) return null;
  const identity = identityFields.safeParse({ provider:kind, subject:payload.sub, email:payload.email });
  if (!identity.success) return null;
  // Trust Google as an email authority for Gmail and hosted Workspace addresses.
  if (kind === 'google' && !identity.data.email.endsWith('@gmail.com') && !(typeof payload.hd === 'string' && payload.hd)) return null;
  return { identity:identity.data, language:flow.language, intent:flow.intent };
}
