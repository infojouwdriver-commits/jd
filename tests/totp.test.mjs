import test from 'node:test';import assert from 'node:assert/strict';
import {totpAt,matchingTotpStep} from '../src/lib/totp.ts';
const secret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
test('RFC 6238 SHA1 test vectors truncated to six digits',()=>{for(const [seconds,expected] of [[59,'287082'],[1111111109,'081804'],[1111111111,'050471'],[1234567890,'005924'],[2000000000,'279037'],[20000000000,'353130']])assert.equal(totpAt(secret,Math.floor(seconds/30)),expected)});
test('accept current and adjacent window, reject old and malformed codes',()=>{assert.equal(matchingTotpStep(secret,'287082',59000),1);assert.equal(matchingTotpStep(secret,'287082',120000),null);assert.equal(matchingTotpStep(secret,'00000',59000),null);assert.throws(()=>totpAt('invalid',1));});
