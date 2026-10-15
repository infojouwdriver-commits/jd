import test from 'node:test';import assert from 'node:assert/strict';import {createCipheriv,randomBytes} from 'node:crypto';
import {decryptPushToken,fcmPayload,sendFcm} from '../scripts/push-fcm.mjs';
const job={id:'684778fa-9fd4-4a31-aa18-a44df9d97bd1',source_kind:'message',language:'fr'};
test('push token encryption is bound to this installation',()=>{const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from('native_push:one'));const body=Buffer.concat([cipher.update('test-device-token'),cipher.final()]);const value='enc:v1:'+ [iv,cipher.getAuthTag(),body].map(b=>b.toString('base64url')).join('.');assert.equal(decryptPushToken(value,'one',key.toString('hex')),'test-device-token');assert.throws(()=>decryptPushToken(value,'two',key.toString('hex')));});
test('lock-screen payload never contains message bodies or arbitrary links',()=>{const payload=fcmPayload({...job,message_body:'private content',action_url:'https://attacker.example'},'test-token');assert.equal(JSON.stringify(payload).includes('private content'),false);assert.equal(JSON.stringify(payload).includes('attacker'),false);assert.equal(payload.message.data.screen,'messages');assert.equal(payload.message.android.notification.tag,job.id);});
test('provider acceptance is recorded separately from delivery and bad payloads do not disable tokens',async()=>{
 const transport=(status,data)=>async()=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
 assert.equal((await sendFcm(job,'test-token','access',transport(200,{name:'projects/jouw-driver/messages/one'}))).state,'accepted');
 const invalid=await sendFcm(job,'test-token','access',transport(400,{error:{details:[{errorCode:'INVALID_ARGUMENT'}]}}));assert.equal(invalid.invalid,false);
 const expired=await sendFcm(job,'test-token','access',transport(404,{error:{details:[{errorCode:'UNREGISTERED'}]}}));assert.equal(expired.invalid,true);
 assert.equal((await sendFcm(job,'test-token','access',transport(503,{}))).state,'pending');
});
