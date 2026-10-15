import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
function compile(name,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>imports[name],Date,Number,JSON,Error,Map,TextEncoder,TextDecoder});return exports;}
const meter=compile('trip-meter');
const {createTripEngine,tripDurationSeconds}=compile('trip-engine',{'./trip-meter':meter});
const {createSqlTripStore}=compile('trip-store');
async function fixture(){
 const db=new DatabaseSync(':memory:');const keys=new Map();
 const adapter={execAsync:async sql=>{db.exec(sql);},runAsync:async(sql,...params)=>db.prepare(sql).run(...params),getFirstAsync:async(sql,...params)=>db.prepare(sql).get(...params)||null,getAllAsync:async(sql,...params)=>db.prepare(sql).all(...params),withExclusiveTransactionAsync:async task=>{db.exec('BEGIN IMMEDIATE');try{await task(adapter);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}}};
 const cipher={encrypt:async(owner,id,text)=>{if(!keys.has(owner))keys.set(owner,randomBytes(32));const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',keys.get(owner),iv);c.setAAD(Buffer.from(id));return Buffer.concat([iv,c.update(text,'utf8'),c.final(),c.getAuthTag()]).toString('base64');},decrypt:async(owner,id,text)=>{const bytes=Buffer.from(text,'base64'),d=createDecipheriv('aes-256-gcm',keys.get(owner),bytes.subarray(0,12));d.setAAD(Buffer.from(id));d.setAuthTag(bytes.subarray(-16));return Buffer.concat([d.update(bytes.subarray(12,-16)),d.final()]).toString('utf8');}};
 const store=await createSqlTripStore(adapter,cipher);let now=Date.parse('2026-10-14T08:00:00Z');const key='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const engine=createTripEngine('1',store,()=>key,()=>now);
 const point=()=>({lat:50.85,lon:4.35,timestamp:now,accuracy:5});
 const input=()=>({companyId:1,vehicleId:1,environment:'TEST',point:point(),startAddress:'Synthetic departure',endAddress:'Synthetic arrival',proposedPrice:2,paymentMethod:'card'});
 return {db,adapter,store,engine,key,point,input,advance:n=>now+=n,now:()=>now};
}
test('trip persists encrypted, restores elapsed wall time and isolates driver owners',async()=>{
 const f=await fixture();try{await f.engine.start(f.input());f.advance(121000);const restored=await createTripEngine('1',f.store,()=>f.key,f.now).restore();assert.equal(tripDurationSeconds(restored,f.now()),121);assert.equal(await f.store.active('2'),null);const bytes=f.db.prepare('SELECT ciphertext FROM trips').get().ciphertext;assert.equal(bytes.includes('Synthetic'),false);await assert.rejects(f.engine.start(f.input()));}finally{f.db.close();}
});
test('bad endpoint keeps active trip; failed server receipt keeps same completion key',async()=>{
 const f=await fixture();try{await f.engine.start(f.input());f.advance(60000);await assert.rejects(f.engine.end({...f.point(),accuracy:100},2));assert.ok(await f.engine.restore());const payload=await f.engine.end(f.point(),2);assert.equal(payload.completion_request_key,f.key);assert.equal(await f.engine.restore(),null);assert.equal((await f.engine.sync(async()=>{throw Error('lost receipt');})).remaining,1);const sent=[];const [a,b]=await Promise.all([f.engine.sync(async p=>{sent.push(p);return {id:1,driver_id:1,completion_request_key:f.key};}),f.engine.sync(async p=>{sent.push(p);return {id:1,driver_id:1,completion_request_key:f.key};})]);assert.equal(sent.length,1);assert.equal(sent[0].completion_request_key,f.key);assert.equal(a.remaining,0);assert.equal(b.remaining,0);}finally{f.db.close();}
});
test('GPS duplicate and stale points cannot inflate distance, concurrent writes cannot overwrite',async()=>{
 const f=await fixture();try{await f.engine.start(f.input());const stale=await f.engine.restore();f.advance(30000);const next=await f.engine.point({...f.point(),lat:50.8503});assert.ok(next.meter.distanceKm>0);const distance=next.meter.distanceKm;await f.engine.point({...f.point(),lat:50.8503});assert.equal((await f.engine.restore()).meter.distanceKm,distance);f.advance(31000);await f.engine.point({...f.point(),timestamp:f.now()-40000,lat:51});assert.equal((await f.engine.restore()).meter.distanceKm,distance);await assert.rejects(f.store.update({...stale,revision:1}));}finally{f.db.close();}
});
test('tampered owner/AAD or encrypted record cannot silently restore as a new trip',async()=>{
 const f=await fixture();try{await f.engine.start(f.input());f.db.exec('UPDATE trips SET revision=9');await assert.rejects(f.engine.restore());assert.equal(f.db.prepare('SELECT count(*) n FROM trips').get().n,1);}finally{f.db.close();}
});

test('HTTP success without a durable trip identifier never clears queued trip',async()=>{const f=await fixture();try{await f.engine.start(f.input());f.advance(60000);await f.engine.end(f.point(),2);assert.equal((await f.engine.sync(async()=>({success:true}))).remaining,1);assert.equal((await f.store.pending('1')).length,1);}finally{f.db.close();}});

test('queued background callback cannot update a different active trip', async()=>{
 const f=await fixture();try{await f.engine.start(f.input());f.advance(10000);const before=await f.engine.restore();assert.equal(await f.engine.point({...f.point(),lat:50.8503},'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),null);assert.equal((await f.engine.restore()).revision,before.revision);assert.equal((await f.engine.restore()).meter.distanceKm,before.meter.distanceKm);}finally{f.db.close();}
});

test('wrong completion UUID never acknowledges local data; Chiron confirmation requires state and environment',async()=>{
 const f=await fixture();try{await f.engine.start(f.input());f.advance(60000);await f.engine.end(f.point(),2);
 assert.equal((await f.engine.sync(async()=>({id:1,driver_id:1,completion_request_key:'another-trip'}))).remaining,1);
 const result=await f.engine.sync(async()=>({id:1,driver_id:1,completion_request_key:f.key,chiron_sync_state:'COMPLETED',chiron_environment:'TEST'}));assert.equal(result.remaining,0);assert.equal(result.receipts[0].chiron,'test');
 }finally{f.db.close();}
});
test('durable server storage without Chiron acceptance is reported separately',async()=>{
 const f=await fixture();try{await f.engine.start(f.input());f.advance(60000);await f.engine.end(f.point(),2);
 const result=await f.engine.sync(async()=>({id:1,driver_id:1,completion_request_key:f.key,chiron_sync_state:'CREATED',chiron_environment:'production',warning:'synthetic provider unavailable'}));assert.equal(result.remaining,0);assert.equal(result.receipts[0].chiron,'unconfirmed');
 }finally{f.db.close();}
});

test('receipt from another driver is retained; UUID case is canonical and wrong environment is not confirmed',async()=>{
 const f=await fixture();try{await f.engine.start(f.input());f.advance(60000);await f.engine.end(f.point(),2);
 assert.equal((await f.engine.sync(async()=>({id:1,driver_id:2,completion_request_key:f.key}))).remaining,1);
 const result=await f.engine.sync(async()=>({id:1,driver_id:1,completion_request_key:f.key.toUpperCase(),chiron_sync_state:'COMPLETED',chiron_environment:'production'}));assert.equal(result.remaining,0);assert.equal(result.receipts[0].chiron,'unconfirmed');
 }finally{f.db.close();}
});

test('platform snapshot and completion preserve source, reference and UUID across retries',async()=>{
 let active=null,pending=[];const store={active:async()=>active,create:async trip=>{active=structuredClone(trip);},update:async trip=>{active=structuredClone(trip);},complete:async(_trip,payload)=>{pending.push({key:payload.completion_request_key,payload:structuredClone(payload)});active=null;},pending:async()=>pending,acknowledge:async()=>{pending=[];}};
 const now=Date.now(),point={lat:50.85,lon:4.35,timestamp:now,accuracy:5};const engine=createTripEngine('1',store,()=> 'ba2f1c12-21a5-4f20-8ef2-2e570ee29919',()=>now);
 await engine.start({companyId:2,vehicleId:3,environment:'PRODUCTION',point,startAddress:'Synthetic start',endAddress:'Synthetic end',proposedPrice:12,paymentMethod:'card',platform:'BOLT',externalReference:'test-platform-42'});assert.equal((await engine.restore()).platform,'BOLT');await engine.end(point,12);assert.equal(pending[0].payload.ride_type,'EXTERNAL');assert.equal(pending[0].payload.external_source,'BOLT');assert.equal(pending[0].payload.external_ride_number,'test-platform-42');assert.equal(pending[0].payload._native_environment,'PRODUCTION');await engine.sync(async()=>{throw Error('offline');});assert.equal(pending.length,1);const key=pending[0].key;await engine.sync(async payload=>({id:99,driver_id:1,completion_request_key:payload.completion_request_key,chiron_environment:'production',chiron_sync_state:'COMPLETED'}));assert.equal(key,'ba2f1c12-21a5-4f20-8ef2-2e570ee29919');assert.equal(pending.length,0);
});

test('selected navigation destination survives encrypted restore, while completion uses actual arrival GPS',async()=>{
 const f=await fixture();try{
  const destination={lat:51,lon:4.5};await f.engine.start({...f.input(),navigationDestination:destination});destination.lat=0;
  const restored=await createTripEngine('1',f.store,()=>f.key,f.now).restore();assert.deepEqual(JSON.parse(JSON.stringify(restored.navigationDestination)),{lat:51,lon:4.5});
  f.advance(60000);const end={...f.point(),lat:50.8502,lon:4.3502};const payload=await f.engine.end(end,2);assert.equal(payload.end_lat,end.lat);assert.equal(payload.end_lon,end.lon);assert.equal(payload.navigationDestination,undefined);assert.equal(payload.distance_km,payload.actual_distance_km);
 }finally{f.db.close();}
 const bad=await fixture();try{await assert.rejects(bad.engine.start({...bad.input(),navigationDestination:{lat:91,lon:4}}));assert.equal(await bad.engine.restore(),null);}finally{bad.db.close();}
});
