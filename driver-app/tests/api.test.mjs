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
