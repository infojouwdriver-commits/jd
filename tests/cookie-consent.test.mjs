import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function browser({blockedStorage = false, blockedCookies = false} = {}) {
  const values = new Map();
  let cookie = '';
  const document = {};
  Object.defineProperty(document, 'cookie', {
    get() { return blockedCookies ? '' : cookie; },
    set(value) { if (!blockedCookies) cookie = value.split(';')[0]; },
  });
  const window = {location: {protocol: 'https:'}, localStorage: {
    getItem(key) { if (blockedStorage) throw new Error('Storage disabled'); return values.get(key) ?? null; },
    setItem(key, value) { if (blockedStorage) throw new Error('Storage disabled'); values.set(key, value); },
  }};
  const exports = {};
  const source = readFileSync(new URL('../src/lib/cookie-consent.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(output, {exports, window, document});
  return {api: exports, values, document};
}

test('incomplete, malformed or outdated records do not count as a saved choice', () => {
  const {api} = browser();
  for (const value of [null, '{', '{"version":"1.0"}', JSON.stringify({version: '0.9', timestamp: new Date().toISOString(), categories: {essential: true}}), JSON.stringify({version: '1.0', timestamp: 'invalid', categories: {essential: true}})]) {
    assert.equal(api.parseCookieConsent(value), null);
  }
});

test('rejecting optional categories survives a fresh document load', () => {
  const first = browser();
  first.api.saveCookieConsent({essential: false, analytics: false, marketing: false});
  const second = browser();
  second.values.set(second.api.COOKIE_CONSENT_KEY, first.values.get(first.api.COOKIE_CONSENT_KEY));
  const consent = second.api.readCookieConsent();
  assert.equal(consent.categories.essential, true);
  assert.equal(consent.categories.analytics, false);
  assert.equal(consent.categories.marketing, false);
});

test('blocked local storage falls back to a first-party cookie across documents', () => {
  const first = browser({blockedStorage: true});
  assert.doesNotThrow(() => first.api.saveCookieConsent({analytics: false, marketing: true}));
  const second = browser({blockedStorage: true});
  second.document.cookie = first.document.cookie;
  assert.equal(second.api.readCookieConsent().categories.marketing, true);
  assert.equal(second.api.readCookieConsent().categories.analytics, false);
});

test('fully disabled storage still retains the choice for the current session', () => {
  const {api} = browser({blockedStorage: true, blockedCookies: true});
  api.saveCookieConsent({analytics: false, marketing: false});
  assert.equal(api.readCookieConsent().categories.marketing, false);
});
