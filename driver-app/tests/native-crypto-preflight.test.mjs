import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
function compile(name,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>imports[n],Date,Number,JSON,Error,Map,Set,Uint8Array,TextEncoder,TextDecoder,console});return exports;}
const bytes=compile('journal-bytes');
function fixture({badPlaintext=false,noAuthentication=false,failOnce=false}={}){
 let generations=0;const key=randomBytes(32);let originalAAD;
 const crypto={AESEncryptionKey:{generate:async()=>{generations++;if(failOnce&&generations===1)throw Error('raw SDK secret payload');return {encoded:async encoding=>{assert.equal(encoding,'hex');return key.toString('hex');}};},import:async(v,e)=>{assert.equal(e,'hex');return Buffer.from(v,'hex');}},AESSealedData:{fromCombined:v=>{assert.ok(v instanceof Uint8Array);return v;}},aesEncryptAsync:async(plain,k,{additionalData})=>{originalAAD=additionalData;const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',k,iv);c.setAAD(Buffer.from(additionalData));const sealed=Buffer.concat([iv,c.update(plain),c.final(),c.getAuthTag()]);return {combined:async e=>{assert.equal(e,'base64');return sealed.toString('base64');}};},aesDecryptAsync:async(v,k,{additionalData})=>{const b=Buffer.from(v),d=createDecipheriv('aes-256-gcm',k,b.subarray(0,12));d.setAAD(Buffer.from(noAuthentication?originalAAD:additionalData));d.setAuthTag(b.subarray(-16));const plain=Buffer.concat([d.update(b.subarray(12,-16)),d.final()]);if(badPlaintext)plain[0]^=1;return plain;}};
 const preflight=compile('native-crypto-preflight',{'expo-crypto':crypto,'./journal-bytes':bytes});return {...preflight,generations:()=>generations};
}
test('native preflight uses actual AES bytes, hex import and AAD; concurrent callers share one ephemeral test',async()=>{const f=fixture(),a=f.assertNativeCryptoReady(),b=f.assertNativeCryptoReady();assert.equal(a,b);await Promise.all([a,b]);await f.assertNativeCryptoReady();assert.equal(f.generations(),1);});
test('roundtrip mismatch and missing AAD authentication block readiness with sanitized errors',async()=>{for(const opts of [{badPlaintext:true},{noAuthentication:true}]){const f=fixture(opts);await assert.rejects(f.assertNativeCryptoReady(),{message:'تعذّر فحص حماية حفظ الرحلة. لا تحذف بيانات التطبيق.'});}});
test('failed probe can be retried and never leaks the provider payload',async()=>{const f=fixture({failOnce:true});await assert.rejects(f.assertNativeCryptoReady(),{message:'تعذّر فحص حماية حفظ الرحلة. لا تحذف بيانات التطبيق.'});await f.assertNativeCryptoReady();assert.equal(f.generations(),2);});
test('failed readiness never opens or modifies the customer journal; retry can initialize it',async()=>{
 let calls=0,opened=0,executed=0;const database={execAsync:async()=>{executed++;}};
 const native=compile('native-journal',{'expo-sqlite':{openDatabaseAsync:async()=>{opened++;return database;}},'expo-secure-store':{getItemAsync:async()=>assert.fail('No account key access')},'expo-crypto':{},'./journal-bytes':bytes,'./trip-store':compile('trip-store'),'./native-crypto-preflight':{assertNativeCryptoReady:async()=>{calls++;if(calls===1)throw Error('probe failed');}}});
 await assert.rejects(native.nativeJournal());assert.equal(opened,0);assert.equal(executed,0);await native.nativeJournal();assert.equal(opened,1);assert.equal(executed,1);
 const source=fs.readFileSync(new URL('../src/native-crypto-preflight.ts',import.meta.url),'utf8');assert.equal(/from ['"]expo-(secure-store|sqlite|location)['"]/.test(source),false);
});
