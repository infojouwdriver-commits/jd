import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
function compile(name,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>imports[n],Date,Number,JSON,Error,Map,Set,Uint8Array,TextEncoder,TextDecoder});return exports;}
const bytesModule=compile('journal-bytes'),storeModule=compile('trip-store'),meterModule=compile('trip-meter');
const {createTripEngine}=compile('trip-engine',{'./trip-meter':meterModule});
const {tripError}=compile('trip-error');
test('legacy journal base64 decodes exactly, malformed and oversized records fail closed',()=>{
 for(const n of [1,2,3,28,1000,250028]){const b=randomBytes(n);assert.deepEqual(Buffer.from(bytesModule.journalBytes(b.toString('base64'))),b);}
 for(const v of ['', '!!!!', 'abc','AB==','AAB=','AAAA\n','A'.repeat(350004)])assert.throws(()=>bytesModule.journalBytes(v));
});
function fixture(){const db=new DatabaseSync(':memory:'),key=randomBytes(32);let imported=0;
 const adapter={execAsync:async sql=>db.exec(sql),runAsync:async(sql,...p)=>db.prepare(sql).run(...p),getFirstAsync:async(sql,...p)=>db.prepare(sql).get(...p)||null,getAllAsync:async(sql,...p)=>db.prepare(sql).all(...p),withExclusiveTransactionAsync:async task=>{db.exec('BEGIN IMMEDIATE');try{await task(adapter);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}};
 const crypto={AESEncryptionKey:{import:async(v,e)=>{assert.equal(e,'hex');imported++;return Buffer.from(v,'hex');},generate:async()=>assert.fail('Never replace existing key')},AESSealedData:{fromCombined:v=>{assert.ok(v instanceof Uint8Array,'Android needs ByteArray');return v;}},aesEncryptAsync:async(plain,k,{additionalData})=>{const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',k,iv);c.setAAD(Buffer.from(additionalData));const b=Buffer.concat([iv,c.update(plain),c.final(),c.getAuthTag()]);return {combined:async e=>{assert.equal(e,'base64');return b.toString('base64');}};},aesDecryptAsync:async(v,k,{additionalData})=>{const b=Buffer.from(v),d=createDecipheriv('aes-256-gcm',k,b.subarray(0,12));d.setAAD(Buffer.from(additionalData));d.setAuthTag(b.subarray(-16));return Buffer.concat([d.update(b.subarray(12,-16)),d.final()]);}};
 const module=compile('native-journal',{'expo-sqlite':{openDatabaseAsync:async()=>adapter},'expo-secure-store':{getItemAsync:async n=>{assert.equal(n,'jd-trip-key-1');return key.toString('hex');},setItemAsync:async()=>assert.fail('Never overwrite key')},'expo-crypto':crypto,'./trip-store':storeModule,'./journal-bytes':bytesModule});
 return {db,key,crypto,module,imported:()=>imported};}
test('real journal adapter reads previous format, ends and retries without duplicate or key replacement',async()=>{
 const f=fixture();try{const store=await f.module.nativeJournal();let now=Date.parse('2026-10-14T12:00:00Z');const uuid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',point=()=>({lat:50.85,lon:4.35,timestamp:now,accuracy:5});
 const legacy={key:uuid,owner:'1',revision:0,companyId:1,vehicleId:2,environment:'PRODUCTION',startTime:new Date(now).toISOString(),start:point(),startAddress:'Synthetic departure',endAddress:'Synthetic arrival',proposedPrice:3,paymentMethod:'cash',meter:meterModule.addMeterPoint(meterModule.emptyMeter(),point())};
 const encoded=await(await f.crypto.aesEncryptAsync(new TextEncoder().encode(JSON.stringify(legacy)),f.key,{additionalData:new TextEncoder().encode(`1:active:${uuid}:0`)})).combined('base64');f.db.prepare("INSERT INTO trips VALUES(?,?,'active',0,?)").run('1',uuid,encoded);
 const engine=createTripEngine('1',store,()=>uuid,()=>now);assert.deepEqual(JSON.parse(JSON.stringify(await engine.restore())),JSON.parse(JSON.stringify(legacy)));assert.equal(f.db.prepare('SELECT ciphertext FROM trips').get().ciphertext,encoded);
 now+=60000;assert.equal((await engine.end(point(),3)).completion_request_key,uuid);assert.equal(await store.active('1'),null);assert.equal((await store.pending('1'))[0].key,uuid);
 assert.equal((await engine.sync(async()=>{throw Error('offline');})).remaining,1);assert.equal((await store.pending('1'))[0].key,uuid);
 assert.equal((await engine.sync(async()=>({id:1,driver_id:1,completion_request_key:uuid,chiron_sync_state:'COMPLETED',chiron_environment:'PRODUCTION'}))).remaining,0);assert.equal(f.imported(),1);
 }finally{f.db.close();}});
test('authentication failure never discards the stored trip',async()=>{const f=fixture();try{const store=await f.module.nativeJournal(),uuid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';const encoded=await(await f.crypto.aesEncryptAsync(new TextEncoder().encode('{}'),f.key,{additionalData:new TextEncoder().encode('wrong identity')})).combined('base64');f.db.prepare("INSERT INTO trips VALUES(?,?,'active',0,?)").run('1',uuid,encoded);await assert.rejects(store.active('1'));assert.equal(f.db.prepare('SELECT ciphertext FROM trips').get().ciphertext,encoded);}finally{f.db.close();}});
test('UI uses known validation messages, hides SDK ciphertext and stack',()=>{const fallback='تعذّر إنهاء الرحلة.';assert.equal(tripError(new Error('السعر غير صالح.'),fallback),'السعر غير صالح.');assert.equal(tripError(new Error('fromCombined SENSITIVE stack'),fallback),fallback);assert.equal(tripError({message:'السعر غير صالح.'},fallback),fallback);assert.equal(fs.readFileSync(new URL('../src/TripPanel.tsx',import.meta.url),'utf8').includes('error.message'),false);});
