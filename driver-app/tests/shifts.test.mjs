import test from 'node:test';
import assert from 'node:assert/strict';
import {declaration,reading,shiftMetrics,shiftMinutes,matchesTrip} from '../src/shift-model.ts';
import {createShiftIntent} from '../src/shift-intent.ts';
import {publishNativeTripStatus} from '../src/shift-trip.ts';
import {createDriverApi,ApiError} from '../src/api.ts';
const id='11111111-1111-4111-8111-111111111111',key='22222222-2222-4222-8222-222222222222';
const shift={id,driver_id:1,company_id:2,vehicle_id:3,driver_name:'Synthetic driver',company_name:'Synthetic company',plate_number:'DEMO',started_at:'2026-10-22T08:00:00Z',ended_at:null,start_odometer:100,odometer:110,passenger_km:6,version:3,work_status:'available'};
const profile={driver:{id:1,company_id:2,current_vehicle_id:3},company:{id:2}};
const ok=data=>Response.json({success:true,data});
test('explicit readings accept decimal comma but reject blanks, precision, decreases and invented passenger distance',()=>{
 assert.equal(reading('217000,35'),217000.35);for(const v of ['', ' ', '-1','1e3','1.123','10000000','NaN'])assert.throws(()=>reading(v));
 const start=declaration('start','217000,35','',null,id);assert.equal(start.passenger_km,0);assert.equal(start.request_id,start.shift_id);
 for(const [odo,pax]of [['109','6'],['115','5'],['115','12']])assert.throws(()=>declaration('record',odo,pax,shift,key));
 assert.equal(declaration('end','115','11',shift,key).expected_version,3);assert.deepEqual(shiftMetrics(shift),{total:10,passenger:6,empty:4});
});
function store(){let raw=null;return {get:async()=>raw,set:async v=>{raw=v},clear:async()=>{raw=null}};}
test('lost declaration response survives restart and freezes exact original UUID, version and readings',async()=>{
 const storage=store(),bodies=[];const body=declaration('record','115','9',shift,key);
 const first=createShiftIntent(storage,async b=>{bodies.push(b);throw new ApiError(408)});await first.restore();await assert.rejects(first.submit(body));
 const second=createShiftIntent(storage,async b=>{bodies.push(b);return {...shift,version:4}});assert.deepEqual(await second.restore(),body);await second.submit({...body,odometer:999});assert.deepEqual(bodies[0],bodies[1]);assert.equal(await storage.get(),null);
});
test('storage failure prevents sending; deterministic conflict releases the intent for refresh',async()=>{
 let calls=0;const blocked=createShiftIntent({get:async()=>null,set:async()=>{throw Error('storage')},clear:async()=>{}},async()=>{calls++;return shift});await assert.rejects(blocked.submit(declaration('start','100','',null,id)));assert.equal(calls,0);
 const storage=store(),controller=createShiftIntent(storage,async()=>{throw new ApiError(409)});await assert.rejects(controller.submit(declaration('record','111','6',shift,key)));assert.equal(controller.current(),null);assert.equal(await storage.get(),null);
});
test('status retry never introduces counter fields and concurrent taps cannot send twice',async()=>{
 let finish;const sent=[];const controller=createShiftIntent(store(),b=>{sent.push(b);return new Promise(r=>finish=r)});const body={action:'status',request_id:key,shift_id:id,expected_version:3,work_status:'break'};
 const first=controller.submit(body);await new Promise(r=>setImmediate(r));await assert.rejects(controller.submit(body));assert.equal(sent.length,1);assert.equal('odometer' in sent[0],false);finish({...shift,version:4,work_status:'break'});await first;
});
test('shift APIs reject another driver/company, malformed pages and injected detail identity',async()=>{
 for(const rows of [{active:{...shift,driver_id:9},shifts:[]},{active:{...shift,company_id:9},shifts:[]},{active:null,shifts:Array(26).fill(shift)}]){
  const api=createDriverApi(async url=>ok(url.endsWith('/drivers/me')?profile:rows));await assert.rejects(api.shifts(1),e=>e.status===502);
 }
 const api=createDriverApi(async url=>ok(url.endsWith('/drivers/me')?profile:{shift:{...shift,id:key},events:[],activity:[]}));await assert.rejects(api.shifts(1,{id}),e=>e.status===502);await assert.rejects(api.shifts(1,{offset:-1}),e=>e.status===400);await assert.rejects(api.shifts(9),e=>e.status===403);
});
test('shift mutation checks ownership and never automatically repeats an ambiguous write',async()=>{
 let writes=0;const api=createDriverApi(async(url,opts)=>{if(url.endsWith('/drivers/me'))return ok(profile);writes++;throw Error('lost')});await assert.rejects(api.shiftCommand(1,{action:'status',request_id:key,shift_id:id,expected_version:3,work_status:'break'}),e=>e.status===0);assert.equal(writes,1);
});
test('new native passenger publication matches frozen vehicle/company/time and reuses completion UUID',async()=>{
 const trip={key,shiftId:id,companyId:2,vehicleId:3,startTime:'2026-10-22T08:01:00Z'};const sent=[];await publishNativeTripStatus({shifts:async()=>({active:shift}),shiftCommand:async(_,b)=>{sent.push(b);return shift}},1,trip);
 assert.equal(sent[0].request_id,key);assert.equal(sent[0].work_status,'with_passenger');assert.equal('odometer' in sent[0],false);
 for(const change of [{vehicleId:4},{companyId:4},{shiftId:key},{startTime:'2026-10-21T08:01:00Z'}]){assert.equal(matchesTrip(shift,{...trip,...change}),false);await assert.rejects(publishNativeTripStatus({shifts:async()=>({active:shift}),shiftCommand:async()=>{throw Error('must not send')}},1,{...trip,...change}));}
});
test('service durations stop at the last recorded event, never at the phone clock',()=>{
 const minutes=shiftMinutes({shift,events:[{recorded_at:'2026-10-22T08:00:00Z',work_status:'available'}],activity:[{kind:'status',recorded_at:'2026-10-22T08:10:00Z',work_status:'break'},{kind:'status',recorded_at:'2026-10-22T08:15:00Z',work_status:'available'}]});assert.equal(minutes.available,10);assert.equal(minutes.break,5);
});
test('Dutch PDF uses separate read-only endpoint, validates binary, and denies another owner before downloading',async()=>{
 const urls=[];const api=createDriverApi(async(url,opts)=>{urls.push({url,opts});return url.endsWith('/drivers/me')?ok(profile):new Response('%PDF-1.7 synthetic',{headers:{'Content-Type':'application/pdf'}})});
 assert.equal(new TextDecoder().decode((await api.shiftPdf(1,id)).subarray(0,5)),'%PDF-');assert.equal(urls.at(-1).opts.method,'GET');assert.match(urls.at(-1).url,/\/drivers\/shifts\/pdf\?id=/);assert.equal(urls.some(c=>c.url.includes('generate-invoice')),false);
 const before=urls.length;await assert.rejects(api.shiftPdf(9,id),e=>e.status===403);assert.equal(urls.length,before+1);
 const invalid=createDriverApi(async url=>url.endsWith('/drivers/me')?ok(profile):new Response('not a PDF',{headers:{'Content-Type':'application/pdf'}}));await assert.rejects(invalid.shiftPdf(1,id),e=>e.status===502);
});

test('historical company snapshot remains readable for the same driver, never another driver',async()=>{
 const historic={...shift,company_id:9,ended_at:'2026-10-22T08:30:00Z'};
 const api=createDriverApi(async url=>ok(url.endsWith('/drivers/me')?profile:{active:null,shifts:[historic]}));assert.equal((await api.shifts(1)).shifts[0].company_id,9);
});
test('damaged encrypted intent fails closed without erasing or sending readings',async()=>{
 for(const body of [{...declaration('record','111','6',shift,key),odometer:null},{action:'status',request_id:key,shift_id:id,expected_version:1,work_status:'break',odometer:0}]){
  const saved=JSON.stringify(body);let cleared=0,sent=0;const intent=createShiftIntent({get:async()=>saved,set:async()=>{},clear:async()=>{cleared++}},async()=>{sent++;return shift});await assert.rejects(intent.restore());assert.equal(cleared,0);assert.equal(sent,0);
 }
});

test('document QR accepts the canonical portal even on legacy builds, and rejects foreign or oversized metadata',async()=>{
 const document={reference:'DS-SYNTHETIC',url:'https://app.jouww.com/driver/shifts?id='+id,qr:{size:21,modules:Array(441).fill(0)}};
 const api=data=>createDriverApi(async url=>ok(url.endsWith('/drivers/me')?profile:{shift,events:[],activity:[],document:data}));
 assert.equal((await api(document).shifts(1,{id})).document.url,document.url);
 for(const bad of [{...document,url:'https://evil.invalid/driver/shifts?id='+id},{...document,url:document.url+'&token=x'},{...document,qr:{size:178,modules:[]}},{...document,qr:{size:21,modules:Array(440).fill(0)}},{...document,qr:{size:21,modules:Array(441).fill(2)}}])await assert.rejects(api(bad).shifts(1,{id}),e=>e.status===502);
});
