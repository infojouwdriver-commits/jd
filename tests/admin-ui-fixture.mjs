import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { SignJWT, jwtVerify } from 'jose';

// Browser tests mock feature responses. This supplies a real signed browser
// session and a local account lookup for the production page guard.
export async function startAdminUiFixture(host = '127.0.0.1') {
  const id = '9001';
  const secret = randomBytes(48).toString('hex');
  const key = new TextEncoder().encode(secret);
  const claims = { issuer: 'jouw-driver', audience: 'jouw-driver' };
  const db = createServer(async (request, response) => {
    try {
      const token = request.headers.authorization?.replace(/^Bearer /, '') || '';
      const { payload } = await jwtVerify(token, key, { ...claims, algorithms: ['HS256'] });
      const url = new URL(request.url, 'http://localhost');
      if (request.method !== 'GET' || payload.sub !== '0' || url.pathname !== '/users' || url.searchParams.get('id') !== `eq.${id}`) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify([{ id, is_active: true }]));
    } catch {
      response.writeHead(401).end();
    }
  });
  db.listen(0, host);
  await once(db, 'listening');
  return {
    env: {
      JWT_SECRET: secret, PLATFORM_ADMIN_IDS: id, POSTGREST_URL: `http://${host}:${db.address().port}`,
      POSTGREST_SCHEMA: 'public', SCHEMA_USER: 'browser', SCHEMA_ADMIN_USER: 'service',
    },
    async authenticate(context, base) {
      const value = await new SignJWT({ amr: 'otp', role: 'browser' })
        .setProtectedHeader({ alg: 'HS256' }).setIssuer(claims.issuer).setAudience(claims.audience)
        .setSubject(id).setIssuedAt().setExpirationTime('20m').sign(key);
      await context.addCookies([{ name: 'auth-token', value, url: base, httpOnly: true }]);
    },
    close() {
      db.closeAllConnections();
      return new Promise(resolve => db.close(resolve));
    },
  };
}
