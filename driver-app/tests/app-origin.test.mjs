import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeAppOrigin,companyRegistrationUrl,APP_ORIGIN,LEGACY_APP_ORIGIN} from '../src/app-origin.ts';

test('existing signed release remains on the legacy host by default',()=>{
  assert.equal(nativeAppOrigin(undefined),LEGACY_APP_ORIGIN);
  assert.equal(nativeAppOrigin(''),LEGACY_APP_ORIGIN);
  assert.equal(nativeAppOrigin('https://app.jouww.com'),'https://app.jouww.com');
});
test('API and native registration share the same reviewed origin',()=>{
  assert.equal(companyRegistrationUrl('nl'),APP_ORIGIN+'/register-company?lang=nl');
  assert.equal(companyRegistrationUrl('en'),APP_ORIGIN+'/register-company?lang=fr');
  assert.equal(companyRegistrationUrl('fr&next=https://evil.test'),APP_ORIGIN+'/register-company?lang=fr');
});
test('native credential destination rejects arbitrary origins and embedded URL data',()=>{
  for(const origin of ['http://app.jouww.com','https://api.jouww.com','https://evil.test','https://app.jouww.com/','https://user:pass@app.jouww.com','https://app.jouww.com?next=evil','https://app.jouww.com.evil.test']) assert.throws(()=>nativeAppOrigin(origin));
});
