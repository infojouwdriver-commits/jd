import test from 'node:test';import assert from 'node:assert/strict';import {generateKeyPairSync} from 'node:crypto';
import {sealPushCredential,openPushCredential} from '../native-push-envelope.mjs';
test('server-only envelope roundtrips and rejects tampering or another server key',()=>{
 const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048}),other=generateKeyPairSync('rsa',{modulusLength:2048});
 const raw=Buffer.from('temporary test credential'),sealed=sealPushCredential(raw,publicKey);
 assert.equal(JSON.stringify(sealed).includes(raw.toString()),false);assert.deepEqual(openPushCredential(sealed,privateKey),raw);
 assert.throws(()=>openPushCredential(sealed,other.privateKey));
 const bytes=Buffer.from(sealed.data,'base64');bytes[0]^=1;assert.throws(()=>openPushCredential({...sealed,data:bytes.toString('base64')},privateKey));
});
