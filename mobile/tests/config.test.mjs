import assert from 'node:assert/strict';
import test from 'node:test';
import { mobileConfig } from '../config.mjs';
test('reject insecure, credentialed, placeholder, private and path URLs', () => {
  for (const url of [undefined, 'http://driver.company.be', 'https://admin:secret@driver.company.be', 'https://localhost', 'https://127.0.0.1', 'https://your-production-domain.com', 'https://example.com', 'https://driver.company.be/driver', 'https://driver.company.be?secret=yes', 'https://driver.company.be:8443']) assert.throws(() => mobileConfig({ MOBILE_APP_URL: url }));
});
test('valid config confines navigation to a single origin and disables insecure WebView capabilities', () => {
  const config = mobileConfig({ MOBILE_APP_URL: 'https://driver.company.be/' });
  assert.equal(config.server.url, 'https://driver.company.be');
  assert.deepEqual(config.server.allowNavigation, ['driver.company.be']);
  assert.equal(config.server.cleartext, false);
  assert.equal(config.android.allowMixedContent, false);
  assert.equal(config.android.webContentsDebuggingEnabled, false);
  assert.equal(config.android.useLegacyBridge, true);
  assert.equal(config.webDir, 'www');
});
