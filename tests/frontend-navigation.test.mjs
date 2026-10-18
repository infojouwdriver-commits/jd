import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {connectionFailure,connectionMessage} from '../src/lib/connection-state.ts';

function client(pathname, fetch) {
  const source = readFileSync(new URL('../src/lib/api-client.ts', import.meta.url), 'utf8')
    .replace(/import \{ AUTH_ENABLED, authConfig \}[^;]+;/, 'const AUTH_ENABLED = true; const authConfig = {loginPath:"/login"};')
    .replace(/import \{ AUTH_CODE \}[^;]+;/, 'const AUTH_CODE = {TOKEN_MISSING:"TOKEN_MISSING", TOKEN_EXPIRED:"TOKEN_EXPIRED"};');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require:name=>{if(name==='./connection-state')return {connectionFailure,connectionMessage};throw Error('Unexpected import');},AbortSignal, fetch, window: { location: { pathname, href: '', origin: 'https://app.example' } }, URL, URLSearchParams, console, process: { env: {} } };
  vm.runInNewContext(output, context);
  return { api: context.exports.api, location: context.window.location };
}
const missing = () => Promise.resolve(new Response(JSON.stringify({ success: false, errorCode: 'TOKEN_MISSING' }), { status: 401, headers: { 'content-type': 'application/json' } }));

test('auth probes never replace the current document on any route', async () => {
  for (const path of ['/', '/trial', '/login', '/driver-login', '/admin/drivers', '/driver/trips']) {
    const { api, location } = client(path, missing);
    await assert.rejects(api.get('/auth/user'), error => error.status === 401);
    assert.equal(location.href, '', path);
  }
});
test('anonymous public landing and trial endpoints do not trigger redirect loops', async () => {
  for (const path of ['/', '/trial', '/login', '/driver-login']) {
    const { api, location } = client(path, missing);
    await assert.rejects(api.get('/companies'));
    assert.equal(location.href, '');
  }
});
test('protected requests select the correct sign-in portal and preserve destination', async () => {
  for (const [path, expected] of [['/admin/trips', '/login?redirect=%2Fadmin%2Ftrips'], ['/driver/trips', '/driver-login?redirect=%2Fdriver%2Ftrips']]) {
    const { api, location } = client(path, missing);
    await assert.rejects(api.get('/trips'));
    assert.equal(location.href, expected);
  }
});
test('parallel expired requests share a refresh and retry without document navigation', async () => {
  let refreshed = false; let refreshCalls = 0;
  const { api, location } = client('/admin/trips', async url => {
    if (url.endsWith('/auth/refresh')) { refreshCalls++; await Promise.resolve(); refreshed = true; return Response.json({ success: true }); }
    if (!refreshed) return Response.json({ success: false, errorCode: 'TOKEN_EXPIRED' }, { status: 401 });
    return Response.json({ success: true, data: [{ id: 1 }] });
  });
  const results = await Promise.all([api.get('/trips'), api.get('/vehicles')]);
  assert.equal(refreshCalls, 1);
  assert.equal(results[0][0].id, 1);
  assert.equal(results[1][0].id, 1);
  assert.equal(location.href, '');
});
