// Synthetic accounts only. Verify consent persistence and non-blocking UI against the production build.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
const {chromium} = await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base = 'http://127.0.0.1:3012';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3012'], {
  env: {...process.env, NODE_ENV: 'production', APP_ORIGIN: base, JWT_SECRET: randomBytes(48).toString('hex'), POSTGREST_URL: 'http://127.0.0.1:39999', POSTGREST_SCHEMA: 'public', SCHEMA_USER: 'browser', SCHEMA_ADMIN_USER: 'service', NEXT_TELEMETRY_DISABLED: '1'},
  stdio: ['ignore', 'pipe', 'pipe'],
});
let browser;
const checks = [];
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { ready = (await fetch(base + '/login')).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, 'production UI starts');
  browser = await chromium.launch({headless: true});
  for (const [name, viewport] of [['desktop', {width: 1280, height: 900}], ['mobile', {width: 390, height: 844}]]) {
    const context = await browser.newContext({viewport, serviceWorkers: 'block'});
    await context.addInitScript(() => localStorage.setItem('driver_language', 'ar'));
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    await context.route(base + '/next_api/**', async route => {
      const pathname = new URL(route.request().url()).pathname;
      let data = [];
      if (pathname === '/next_api/auth/user') data = {sub: '9001', email: 'synthetic@example.invalid', isAdmin: true, userType: 'admin', role: 'browser'};
      if (pathname === '/next_api/gdpr/cookie-categories') data = [
        {id: 1, code: 'essential', name: 'Essential', is_required: true},
        {id: 2, code: 'analytics', name: 'Analytics', is_required: false},
        {id: 3, code: 'marketing', name: 'Marketing', is_required: false},
      ];
      // Hold server consent synchronization so browser dismissal cannot depend on its completion.
      if (pathname === '/next_api/gdpr/consents' && route.request().method() === 'POST') return;
      await route.fulfill({contentType: 'application/json', body: JSON.stringify({success: true, data})});
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/privacy-center');
    const banner = page.getByText('نستخدم ملفات تعريف الارتباط', {exact: true});
    await banner.waitFor({state: 'visible'});
    await page.getByRole('button', {name: 'رفض', exact: true}).click();
    await banner.waitFor({state: 'hidden', timeout: 2000});
    assert.equal(await page.getByRole('button', {name: 'تخصيص', exact: true}).count(), 0);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gdpr_cookie_consent')));
    assert.equal(stored.categories.essential, true);
    assert.equal(stored.categories.analytics, false);
    assert.equal(stored.categories.marketing, false);
    checks.push(name + ': dismissal is immediate while account synchronization remains pending; no floating customize button');
    await page.reload();
    await page.waitForTimeout(2300);
    assert.equal(await banner.count(), 0);
    checks.push(name + ': saved rejection survives reload');
    await page.getByRole('button', {name: 'تفضيلات ملفات الارتباط', exact: true}).click();
    await page.getByRole('button', {name: 'حفظ', exact: true}).waitFor();
    const marketing = page.getByRole('switch').nth(2);
    await marketing.click();
    await page.getByRole('button', {name: 'حفظ', exact: true}).click();
    await banner.waitFor({state: 'hidden'});
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('gdpr_cookie_consent')).categories.marketing), true);
    await page.reload();
    await page.waitForTimeout(2300);
    assert.equal(await banner.count(), 0);
    assert.equal(errors.length, 0, errors.join('\n'));
    checks.push(name + ': preferences can be reopened in normal page flow, changed and persisted without runtime errors');
    await context.close();
  }
  console.log(JSON.stringify({passed: checks.length, checks, data: 'Synthetic browser fixtures only'}, null, 2));
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
