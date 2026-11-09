import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function compile(path,imports,env){const exports={};const source=fs.readFileSync(new URL(path,import.meta.url),'utf8');vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,require:name=>imports[name]||require(name),process:{env},URL,URLSearchParams,Buffer,AbortSignal,Date,Number,Error,fetch:imports.fetch,console});return exports;}
function fixture(options={}){
 const env={CHIRON_TRANSMISSION_ENABLED:'true',CHIRON_PRODUCTION_ENABLED:'false'};
 const protocol=compile('../src/lib/chiron-protocol.ts',{},env);
 const pricing=compile('../src/lib/company-pricing.ts',{},env);
 const rows={companies:[{id:1,name:'Synthetic',kbo_number:'0123456789',chiron_mode:'TEST',chiron_test_client_id:'test-only',chiron_test_client_secret:'test-only-secret'}],drivers:[{id:1,company_id:1,capacity_certificate_number:'TEST-PASS'}],vehicles:[{id:1,company_id:1,plate_number:'TEST-PLATE'}],platform_contracts:[],test_trips:[],trips:[{id:1,company_id:1,driver_id:1,vehicle_id:1,user_id:7,ritnummer:'original-1',start_time:'2026-10-11T10:00:00Z',end_time:'2026-10-11T10:10:00Z',start_lat:0,start_lon:4.35175,end_lat:50.85,end_lon:0,distance_km:1.23456,price:12.556,status:'completed',locked_after_completion:true,chiron_sync_state:null}],chiron_sync_log:[]};
 class Crud {constructor(table){this.table=table;}async findById(id){return rows[this.table].find(r=>String(r.id)===String(id))||null;}async findMany(filters){return rows[this.table].filter(r=>Object.entries(filters||{}).every(([k,v])=>r[k]===v));}async create(body){const row={id:rows[this.table].length+1,...body};rows[this.table].push(row);return row;}async update(id,body){const row=await this.findById(id);Object.assign(row,body);return row;}}
 const client=()=>({from:table=>({update:body=>{const filters=[];const query={eq(k,v){filters.push([k,v]);return query;},is(k,v){filters.push([k,v]);return query;},async select(){const found=rows[table].filter(r=>filters.every(([k,v])=>(r[k]??null)===v));found.forEach(r=>Object.assign(r,body));return {data:found.map(r=>({id:r.id})),error:null};}};return query;}})});
 const messages=[],requests=[];
 const fetch=async(url,init)=>{requests.push({url,init});assert.equal(init.redirect,'error');assert.ok(init.signal);if(url.endsWith('/oauth/token')&&options.authUnavailable)throw Error('synthetic auth timeout');if(url.endsWith('/oauth/token'))return Response.json({access_token:'test-only-token'});const message=JSON.parse(init.body);messages.push(message);if(options.networkFailure)throw Error('test network timeout');if(options.failArrival&&message.status==='aankomst')return new Response('{}',{status:400});if(options.authExpired && messages.length===1)return new Response('{}',{status:401});
 if(options.serverError)return new Response('{}',{status:503});
 if(options.invalidReceipt)return Response.json({accepted:true});
 return Response.json({message:'De taxirit is verwerkt.',httpStatus:'OK',fouten:options.bodyErrors?[{code:'CH1102'}]:[]},{status:200});};
 const {ChironService:service}=compile('../src/lib/chiron-service.ts',{'./crud-operations':{__esModule:true,default:Crud},'./auth':{generateAdminUserToken:async()=>'test-only-service'},'./postgrest':{createPostgrestClient:client},'./chiron-protocol':protocol,'./company-pricing':pricing,fetch},env);
 return {service,protocol,rows,messages,requests,env};
}
test('official Chiron endpoints enforce exact host, path and environment',()=>{const {protocol}=fixture();assert.equal(protocol.chironDestination('https://mow-acc.api.vlaanderen.be/oauth/token','TEST','auth'),'https://mow-acc.api.vlaanderen.be/oauth/token');for(const url of ['http://mow-acc.api.vlaanderen.be/oauth/token','https://mow.api.vlaanderen.be/oauth/token','https://mow-acc.api.vlaanderen.be/other','https://mow-acc.api.vlaanderen.be/oauth/token?redirect=evil','https://test@localhost/oauth/token'])assert.throws(()=>protocol.chironDestination(url,'TEST','auth'));});
test('retry uses original events, zero coordinates and price without creating another trip',async()=>{const f=fixture(),before=structuredClone(f.rows.trips[0]);await f.service.sendTripStart(1,1,{});await f.service.sendTripArrival(1,1,{});assert.equal(f.messages.length,2);assert.equal(f.messages[0].ritnummer,before.ritnummer);assert.equal(f.messages[1].ritnummer,before.ritnummer);assert.equal(f.messages[0].rit.vertrekpunt.breedtegraad,0);assert.equal(f.messages[1].rit.aankomstpunt.lengtegraad,0);assert.equal(f.messages[1].rit.kostprijs.waarde,12.56);assert.equal(f.rows.trips.length,1);for(const key of ['status','price','start_time','end_time','locked_after_completion','user_id'])assert.equal(f.rows.trips[0][key],before[key]);assert.equal(f.rows.trips[0].chiron_sync_state,'COMPLETED');await f.service.sendTripStart(1,1,{});await f.service.sendTripArrival(1,1,{});assert.equal(f.messages.length,2);});
test('parallel start claims emit only one departure',async()=>{const f=fixture();const results=await Promise.allSettled([f.service.sendTripStart(1,1,{}),f.service.sendTripStart(1,1,{})]);assert.equal(f.messages.length,1);assert.ok(results.some(r=>r.status==='fulfilled'));assert.equal(f.rows.trips[0].chiron_sync_state,'START_ACCEPTED');});
test('arrival rejection preserves accepted departure; retry does not resend start',async()=>{const f=fixture({failArrival:true});await f.service.sendTripStart(1,1,{});await assert.rejects(f.service.sendTripArrival(1,1,{}));assert.equal(f.rows.trips[0].chiron_sync_state,'START_ACCEPTED');await f.service.sendTripStart(1,1,{});assert.equal(f.messages.filter(m=>m.status==='vertrek').length,1);});
test('lost receipt preserves uncertain state and prevents automatic duplicate',async()=>{const f=fixture({networkFailure:true});await assert.rejects(f.service.sendTripStart(1,1,{}),e=>e.code==='CHIRON_DELIVERY_UNCERTAIN');assert.equal(f.rows.trips[0].chiron_sync_state,'START_SENT');await assert.rejects(f.service.sendTripStart(1,1,{}));assert.equal(f.messages.length,1);});
test('acceptance creates five test-only pairs, ten receipts and no business trips',async()=>{const f=fixture(),before=structuredClone(f.rows.trips);const result=await f.service.runAcceptanceTest(1,1,1);assert.equal(result.success,true);assert.equal(result.totalMessages,10);assert.equal(result.successCount,10);assert.equal(f.messages.length,10);for(let i=0;i<10;i+=2){assert.equal(f.messages[i].status,'vertrek');assert.equal(f.messages[i+1].status,'aankomst');assert.equal(f.messages[i].ritnummer,f.messages[i+1].ritnummer);}assert.equal(new Set(f.messages.map(m=>m.ritnummer)).size,5);assert.equal(f.rows.test_trips.length,10);assert.deepEqual(f.rows.trips,before);assert.equal(JSON.stringify(f.rows.test_trips).includes('test-only-secret'),false);});
test('production acceptance, cross-company mappings and missing credentials send nothing',async()=>{for(const mode of ['production','crossCompany','credentials']){const f=fixture();if(mode==='production')f.rows.companies[0].chiron_mode='PRODUCTION';if(mode==='crossCompany')f.rows.drivers[0].company_id=2;if(mode==='credentials')f.rows.companies[0].chiron_test_client_secret='';await assert.rejects(f.service.runAcceptanceTest(1,1,1));assert.equal(f.requests.length,0);assert.equal(f.rows.test_trips.length,0);}});
test('legacy uppercase PRODUCTION trip sends to its same production company and persists canonical receipts',async()=>{
 const f=fixture();f.env.CHIRON_PRODUCTION_ENABLED='true';Object.assign(f.rows.companies[0],{chiron_mode:'PRODUCTION',chiron_prod_client_id:'synthetic-production-id',chiron_prod_client_secret:'synthetic-production-key'});f.rows.trips[0].chiron_environment='PRODUCTION';
 await f.service.sendTripStart(1,1,{});await f.service.sendTripArrival(1,1,{});
 assert.equal(f.messages.length,2);assert.equal(f.rows.trips[0].chiron_environment,'production');assert.equal(f.rows.trips[0].chiron_sync_state,'COMPLETED');
 assert.ok(f.requests.every(r=>r.url.startsWith('https://mow.api.vlaanderen.be/')));
});
test('legacy TEST casing matches but actual cross-environment and invalid stored modes cannot send',async()=>{
 const same=fixture();same.rows.trips[0].chiron_environment='TEST';await same.service.sendTripStart(1,1,{});assert.equal(same.messages.length,1);
 for(const stored of ['production','PRODUCTION','staging']){const f=fixture();f.rows.trips[0].chiron_environment=stored;await assert.rejects(f.service.sendTripStart(1,1,{}));assert.equal(f.requests.length,0);}
});

test('acceptance report metadata matches the sent events and persists without credentials',async()=>{
 const f=fixture();const result=await f.service.runAcceptanceTest(1,1,1);assert.equal(result.reportContext.company.id,1);assert.equal(result.reportContext.environment,'TEST');assert.equal(JSON.stringify(result).includes('test-only-secret'),false);assert.equal(new Set(result.results.map(r=>r.startAddress)).size,5);
 for(let i=0;i<10;i++){const row=result.results[i],stored=f.rows.test_trips[i],sent=f.messages[i];assert.ok(row.startAddress);assert.ok(row.endAddress);assert.ok(Number.isFinite(Date.parse(row.startTime)));assert.ok(Number.isFinite(Date.parse(row.endTime)));assert.equal(stored.start_address,row.startAddress);assert.equal(stored.end_address,row.endAddress);assert.equal(stored.start_time,row.startTime);assert.equal(stored.end_time,row.endTime);assert.equal(sent.rit.vertrekpunt.breedtegraad,row.startLat);assert.equal(stored.start_lat,row.startLat);}
});

test('arrival requires a completed trip and an acknowledged departure',async()=>{
 const f=fixture();
 await assert.rejects(f.service.sendTripArrival(1,1,{}));
 assert.equal(f.requests.length,0);
 Object.assign(f.rows.trips[0],{chiron_realtime:true,chiron_environment:'test',end_time:null,status:'in_progress'});
 await f.service.sendTripStart(1,1,{});
 assert.equal(f.messages.length,1);
 assert.equal(f.messages[0].status,'vertrek');
 assert.equal(f.messages[0].broncreatiedatum,'2026-10-11T10:00:00Z');
 assert.equal(f.messages[0].rit.vertrekpunt.lengtegraad,4.35175);
 await assert.rejects(f.service.sendTripArrival(1,1,{}));
 Object.assign(f.rows.trips[0],{end_time:'2026-10-11T10:11:02.123Z',status:'completed'});
 f.rows.vehicles[0].plate_number='CHANGED';
 await f.service.sendTripArrival(1,1,{});
 assert.equal(f.messages[1].status,'aankomst');
 assert.equal(f.messages[1].rit.voertuig.nummerplaat,'TEST-PLATE');
 assert.equal(f.messages[1].broncreatiedatum,'2026-10-11T10:11:02Z');
 assert.equal(f.messages[1].ritnummer,f.messages[0].ritnummer);
});
test('expired OAuth renews once before a new submission in the same environment',async()=>{
 const f=fixture({authExpired:true});
 await f.service.sendTripStart(1,1,{});
 assert.equal(f.requests.filter(r=>r.url.endsWith('/oauth/token')).length,2);
 assert.deepEqual(f.messages[0],f.messages[1]);
 assert.ok(f.requests.every(r=>r.url.startsWith('https://mow-acc.api.vlaanderen.be/')));
 assert.equal(f.rows.trips[0].chiron_sync_state,'START_ACCEPTED');
});
test('OAuth outage does not claim departure, and a recovery uses original data',async()=>{
 const options={authUnavailable:true},f=fixture(options);
 await assert.rejects(f.service.sendTripStart(1,1,{}),e=>e.code==='CHIRON_AUTH_UNAVAILABLE');
 assert.equal(f.messages.length,0);assert.equal(f.rows.trips[0].chiron_sync_state,null);
 options.authUnavailable=false;
 await f.service.sendTripStart(1,1,{});
 assert.equal(f.messages[0].rit.vertrektijdstip,'2026-10-11T10:00:00Z');
});
test('HTTP 200 errors, missing acceptance and server errors hold the departure for review',async()=>{
 for(const variant of [{bodyErrors:true},{invalidReceipt:true},{serverError:true}]){
  const f=fixture(variant);
  await assert.rejects(f.service.sendTripStart(1,1,{}),e=>e.code==='CHIRON_DELIVERY_UNCERTAIN');
  assert.equal(f.rows.trips[0].chiron_sync_state,'START_SENT');
  if(variant.bodyErrors)assert.equal(f.rows.trips[0].start_sync_response.errors.join(','),'CH1102');
  await assert.rejects(f.service.sendTripStart(1,1,{}));
  await assert.rejects(f.service.sendTripArrival(1,1,{}));
  assert.equal(f.messages.length,1);
 }
});
test('lost arrival receipt prevents duplicate arrivals and leaves departure accepted',async()=>{
 const options={},f=fixture(options);
 await f.service.sendTripStart(1,1,{});
 options.networkFailure=true;
 await assert.rejects(f.service.sendTripArrival(1,1,{}),e=>e.code==='CHIRON_DELIVERY_UNCERTAIN');
 assert.equal(f.rows.trips[0].chiron_sync_state,'ARRIVAL_SENT');
 assert.equal(f.rows.trips[0].start_sync_response.accepted,true);
 await assert.rejects(f.service.sendTripArrival(1,1,{}));
 assert.equal(f.messages.length,2);
});
test('another company or trial account cannot transmit this trip to production',async()=>{
 const f=fixture();await assert.rejects(f.service.sendTripStart(1,2,{}));assert.equal(f.requests.length,0);
 f.env.CHIRON_PRODUCTION_ENABLED='true';
 Object.assign(f.rows.companies[0],{is_test:true,chiron_mode:'PRODUCTION'});
 await assert.rejects(f.service.sendTripStart(1,1,{}),e=>e.code==='CHIRON_TEST_ONLY');assert.equal(f.requests.length,0);
});
