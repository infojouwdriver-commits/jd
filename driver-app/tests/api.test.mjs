import test from 'node:test';
import assert from 'node:assert/strict';
import {createDriverApi, API_ORIGIN} from '../src/api.ts';
const ok=data=>Response.json({success:true,data});
test('native login uses current driver contract and keeps passwords out of URLs',async()=>{
 const calls=[];const profile={driver:{id:1},company:{id:1}};
 const api=createDriverApi(async(url,options)=>{calls.push({url,options});return ok(url.endsWith('/drivers/me')?profile:true);});
 assert.deepEqual(await api.login(' +32000000000 ','synthetic-password'),profile);
 assert.equal(calls[0].url,API_ORIGIN+'/next_api/auth/driver-login');
 assert.equal(calls[0].options.credentials,'include'); assert.equal(calls[0].options.headers.Origin,API_ORIGIN);
 assert.equal(calls[0].options.redirect,'error');assert.equal(calls[0].url.includes('password'),false);
 assert.deepEqual(JSON.parse(calls[0].options.body),{phone:'+32000000000',password:'synthetic-password'});
});
test('expired simultaneous reads rotate refresh once and retry only reads',async()=>{
 let refreshed=false,refreshes=0;
 const api=createDriverApi(async(url)=>{
  if(url.endsWith('/auth/refresh')){refreshes++;await new Promise(r=>setTimeout(r,5));refreshed=true;return ok(true);}
  return refreshed?ok({driver:{id:1},company:{id:1}}):Response.json({}, {status:401});
 });await Promise.all([api.profile(),api.profile()]);assert.equal(refreshes,1);
});
test('logout failure is propagated, with no retry or reported revocation',async()=>{
 let calls=0;const api=createDriverApi(async()=>{calls++;return Response.json({}, {status:503});});
 await assert.rejects(api.logout());assert.equal(calls,1);
});

test('native completion refuses servers without assignment guards',async()=>{
 const calls=[];const api=createDriverApi(async(url)=>{calls.push(url);return ok({driver:{company_id:1,current_vehicle_id:2},company:{chiron_mode:'TEST'}});});
 await assert.rejects(api.completeTrip({_native_company_id:1,_native_vehicle_id:2,_native_environment:'TEST'}));
 assert.equal(calls.some(url=>url.endsWith('/trips/end')),false);
});
test('completion sends frozen assignment to capable server, allowing idempotent replay after reassignment',async()=>{
 const calls=[];const api=createDriverApi(async(url,options)=>{calls.push({url,options});return ok(url.endsWith('/drivers/me')?{native_trip_contract_version:1,driver:{company_id:3,current_vehicle_id:4},company:{chiron_mode:'PRODUCTION'}}:{id:1});});
 await api.completeTrip({_native_company_id:1,_native_vehicle_id:2,_native_environment:'TEST',completion_request_key:'synthetic'});
 const body=JSON.parse(calls[1].options.body);assert.equal(body.expected_company_id,1);assert.equal(body.expected_vehicle_id,2);assert.equal(body.expected_chiron_environment,'TEST');assert.equal('_native_company_id' in body,false);
});
test('email login forwards MFA code without weakening administrator verification',async()=>{const calls=[];const api=createDriverApi(async(url,options)=>{calls.push({url,options});return ok(url.endsWith('/drivers/me')?{driver:{id:1},company:{id:1}}:true);});await api.login('synthetic@example.invalid','synthetic-password','000000');assert.equal(JSON.parse(calls[0].options.body).otp,'000000');assert.equal(calls[0].url.endsWith('/auth/login'),true);});

test('fleet refuses stale GPS and another driver session before sending coordinates',async()=>{
 const calls=[];const api=createDriverApi(async(url)=>{calls.push(url);return ok({driver:{id:2},company:{id:1}});});
 const point={lat:50.85,lon:4.35,accuracy:5,timestamp:Date.now()};await assert.rejects(api.reportFleet(1,point));assert.equal(calls.some(url=>url.endsWith('/fleet/location')),false);
 calls.length=0;await assert.rejects(api.reportFleet(1,{...point,timestamp:Date.now()-40000}));assert.equal(calls.length,0);
});
test('fleet requires matching durable acknowledgement and clears only latest server location',async()=>{
 const calls=[];const point={lat:50.85,lon:4.35,accuracy:5,timestamp:Date.now()};
 const api=createDriverApi(async(url,options)=>{calls.push({url,options});if(url.endsWith('/drivers/me'))return ok({driver:{id:1},company:{id:1}});return ok({driver_id:1,sharing_enabled:true,shift_active:true,recorded_at:new Date(point.timestamp).toISOString()});});
 await api.reportFleet(1,point);const body=JSON.parse(calls[1].options.body);assert.equal('driver_id' in body,false);assert.equal(body.latitude,point.lat);
 await api.clearFleet();assert.deepEqual(JSON.parse(calls.at(-1).options.body),{shift_active:false,sharing_enabled:false});
 const ambiguous=createDriverApi(async url=>ok(url.endsWith('/drivers/me')?{driver:{id:1}}:{}));await assert.rejects(ambiguous.reportFleet(1,point));
});

test('native completion freezes original driver identity before any write',async()=>{
 const calls=[];const api=createDriverApi(async(url)=>{calls.push(url);return ok({native_trip_contract_version:1,driver:{id:2},company:{id:1}});});await assert.rejects(api.completeTrip({_native_driver_id:1}));assert.equal(calls.some(url=>url.endsWith('/trips/end')),false);
});
const assigned = () => ({native_trip_contract_version:1, driver:{id:1,status:'active',company_id:10,current_vehicle_id:20},company:{id:10,name:'Synthetic',chiron_mode:'PRODUCTION'}});
const vehicle = {id:20,company_id:10,plate_number:'SYNTHETIC',status:'active'};
test('vehicle selection uses company list, one PUT and matching refreshed assignment',async()=>{
 const calls=[]; const api=createDriverApi(async(url,options)=>{calls.push({url,options});if(url.endsWith('/drivers/me'))return ok(assigned());return ok(options.method==='PUT'?{driver_id:1,current_vehicle_id:20,vehicle}:{driver_id:1,current_vehicle_id:20,vehicles:[vehicle]});});
 assert.equal((await api.selectVehicle(1,20)).driver.current_vehicle_id,20);
 const writes=calls.filter(call=>call.options.method==='PUT');assert.equal(writes.length,1);assert.deepEqual(JSON.parse(writes[0].options.body),{vehicle_id:20});assert.equal(writes[0].options.credentials,'include');
});
test('vehicle reads reject changed owner, foreign company and inactive entries without mutation',async()=>{
 for(const row of [{...vehicle,company_id:11},{...vehicle,status:'inactive'}]){
  const calls=[];const api=createDriverApi(async(url,options)=>{calls.push(options.method);return ok(url.endsWith('/drivers/me')?assigned():{driver_id:1,vehicles:[row]});});await assert.rejects(api.selectVehicle(1,20));assert.equal(calls.includes('PUT'),false);
 }
 let reads=0;const api=createDriverApi(async()=>{reads++;return ok({...assigned(),driver:{...assigned().driver,id:2}});});await assert.rejects(api.vehicles(1));assert.equal(reads,1);
});
test('ambiguous vehicle mutation is never retried or represented as saved',async()=>{
 for(const reply of [Response.json({}, {status:503}),ok({driver_id:2,current_vehicle_id:20,vehicle}),ok({driver_id:1,current_vehicle_id:21,vehicle})]){
  let writes=0;const api=createDriverApi(async(url,options)=>{if(options.method==='PUT'){writes++;return reply;}return ok(url.endsWith('/drivers/me')?assigned():{driver_id:1,vehicles:[vehicle]});});await assert.rejects(api.selectVehicle(1,20));assert.equal(writes,1);
 }
});
test('new native trip requires current active vehicle and supported server assignment guard',async()=>{
 for(const current of [{...assigned(),native_trip_contract_version:0},{...assigned(),driver:{...assigned().driver,current_vehicle_id:21}},{...assigned(),driver:{...assigned().driver,status:'inactive'}}]){
  const api=createDriverApi(async url=>ok(url.endsWith('/drivers/me')?current:{driver_id:1,vehicles:[vehicle]}));await assert.rejects(api.tripAssignment(1));
 }
 const current={...assigned(),company:{...assigned().company,chiron_mode:'TEST'}};const api=createDriverApi(async url=>ok(url.endsWith('/drivers/me')?current:{driver_id:1,vehicles:[vehicle]}));assert.equal((await api.tripAssignment(1)).company.chiron_mode,'TEST');
});
test('post-selection reassignment refuses confirmation and unavailable vehicle never sends PUT',async()=>{
 let reads=0,writes=0;const api=createDriverApi(async(url,options)=>{
  if(url.endsWith('/drivers/me')){reads++;return ok(reads===1?assigned():{...assigned(),driver:{...assigned().driver,current_vehicle_id:21}});}
  if(options.method==='PUT'){writes++;return ok({driver_id:1,current_vehicle_id:20,vehicle});}return ok({driver_id:1,vehicles:[vehicle]});
 });await assert.rejects(api.selectVehicle(1,20));assert.equal(writes,1);
 const missing=createDriverApi(async(url,options)=>{assert.notEqual(options.method,'PUT');return ok(url.endsWith('/drivers/me')?assigned():{driver_id:1,vehicles:[]});});await assert.rejects(missing.selectVehicle(1,20));await assert.rejects(missing.selectVehicle(1,NaN));
});
const historyTrip={id:5,driver_id:1,start_time:'2026-10-14T10:00:00Z',end_time:'2026-10-14T10:05:00Z',start_address:'Synthetic A',end_address:'Synthetic B',price:2,currency:'EUR',distance:1,duration:5,chiron_environment:'production',chiron_sync_state:'COMPLETED'};
test('native history uses bounded driver endpoint and rejects another owner or malformed page',async()=>{
 const calls=[];const api=createDriverApi(async(url,options)=>{calls.push({url,options});return ok(url.endsWith('/drivers/me')?assigned():{driver_id:1,trips:[historyTrip],next_offset:null});});assert.equal((await api.history(1,25)).trips[0].id,5);assert.equal(new URL(calls[1].url).pathname,'/next_api/drivers/trips');assert.equal(new URL(calls[1].url).searchParams.get('offset'),'25');assert.equal(calls[1].options.method,'GET');
 for(const page of [{driver_id:2,trips:[historyTrip],next_offset:null},{driver_id:1,trips:[{...historyTrip,driver_id:2}],next_offset:null},{driver_id:1,trips:[{...historyTrip,price:NaN}],next_offset:null},{driver_id:1,trips:[historyTrip],next_offset:1}]){const bad=createDriverApi(async url=>ok(url.endsWith('/drivers/me')?assigned():page));await assert.rejects(bad.history(1));}
 await assert.rejects(api.history(1,-1));
});
test('history refuses account switch before any history request',async()=>{
 const calls=[];const api=createDriverApi(async url=>{calls.push(url);return ok({...assigned(),driver:{...assigned().driver,id:2}});});await assert.rejects(api.history(1));assert.equal(calls.length,1);
});
