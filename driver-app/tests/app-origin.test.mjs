import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeAppOrigin,LEGACY_APP_ORIGIN} from '../src/app-origin.ts';

test('existing signed release remains on the legacy host by default',()=>{
  assert.equal(nativeAppOrigin(undefined),LEGACY_APP_ORIGIN);
  assert.equal(nativeAppOrigin(''),LEGACY_APP_ORIGIN);
  assert.equal(nativeAppOrigin('https://app.jouww.com'),'https://app.jouww.com');
});
test('native credential destination rejects arbitrary origins and embedded URL data',()=>{
  for(const origin of ['http://app.jouww.com','https://api.jouww.com','https://evil.test','https://app.jouww.com/','https://user:pass@app.jouww.com','https://app.jouww.com?next=evil','https://app.jouww.com.evil.test']) assert.throws(()=>nativeAppOrigin(origin));
});
