import test from 'node:test';
import assert from 'node:assert/strict';
import {portalOrigin,portalHref,registrationHandoff} from '../src/lib/portal-origin.ts';

test('default release retains same-origin portal and registration dialog',()=>{
  assert.equal(portalHref('/login',undefined),'/login');
  assert.equal(registrationHandoff('https://jouw-driver.duckdns.org','nl',''),null);
});
test('split-host handoff happens before collecting registration data and preserves language',()=>{
  for(const host of ['https://jouww.com','https://www.jouww.com']) {
    for(const lang of ['ar','fr','nl']) assert.equal(registrationHandoff(host,lang,'https://app.jouww.com'),`https://app.jouww.com/register-company?lang=${lang}`);
  }
  assert.equal(registrationHandoff('https://app.jouww.com','nl','https://app.jouww.com'),null);
  assert.equal(registrationHandoff('https://jouww.com','en','https://app.jouww.com'),'https://app.jouww.com/register-company?lang=fr');
  assert.equal(portalHref('/login?portal=company','https://app.jouww.com'),'https://app.jouww.com/login?portal=company');
});
test('routing cannot be configured to leak credentials to an unreviewed origin or URL',()=>{
  for(const value of ['http://app.jouww.com','https://evil.test','https://app.jouww.com/','https://app.jouww.com.evil.test','https://user:pass@app.jouww.com','https://app.jouww.com:443','https://api.jouww.com']) assert.throws(()=>portalOrigin(value));
  for(const path of ['//evil.test','/\\evil.test','https://evil.test','/login?next=https://evil.test','/next_api/auth/login','/register-company?lang=xx','/login\n']) assert.throws(()=>portalHref(path,''));
});
