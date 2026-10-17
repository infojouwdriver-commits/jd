// Real production Next handlers, isolated simulated PostgREST. No real accounts or network services.
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import bcrypt from 'bcryptjs';
import {SignJWT,jwtVerify} from 'jose';
import {totpAt} from '../src/lib/totp.ts';
import {createDriverApi} from '../driver-app/src/api.ts';

const secret='integration-only-jwt-secret-01234567890123456789';
const totpSecret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const password='IntegrationPassword123!';
const rows={users:[{id:1,email:'admin@example.invalid',password:await bcrypt.hash(password,4),user_type:'admin',is_active:true},{id:2,email:'driver@example.invalid',password:await bcrypt.hash(password,4),user_type:'driver',is_active:true}],sessions:[],refresh_tokens:[],trips:[{id:101,user_id:2,price:10,locked_after_completion:false},{id:102,user_id:3,price:20,locked_after_completion:false}],invoices:[]};
const claims=new Set();let unavailable=false;const databaseTokens=[];
rows.drivers=[{id:1,user_id:2,status:'active',company_id:1,full_name:'Synthetic Driver'}];
rows.companies=[{id:1,name:'Synthetic Company',chiron_mode:'TEST'}];rows.vehicles=[];
const mock=http.createServer(async(req,res)=>{
 try {
  const token=req.headers.authorization?.replace(/^Bearer /,'');
  const {payload}=await jwtVerify(token,new TextEncoder().encode(secret),{issuer:'jouw-driver',audience:'jouw-driver'});
  databaseTokens.push(payload);assert.equal(payload.role,'test_admin');assert.equal(payload.sub,'0');
  const url=new URL(req.url,'http://localhost');let raw='';for await(const chunk of req)raw+=chunk;const body=raw?JSON.parse(raw):{};
  let data;
  if(url.pathname.startsWith('/rpc/')) {
   if(url.pathname==='/rpc/security_rate_limit'){if(unavailable){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}data=true;}
   else if(url.pathname==='/rpc/security_claim_mfa'){const key=`${body.p_user_id}:${body.p_step}`;data=!claims.has(key);claims.add(key);}
   else if(url.pathname==='/rpc/security_claim_refresh'){const row=rows.refresh_tokens.find(r=>r.id===body.p_id&&!r.revoked);data=!!row;if(row)row.revoked=true;}
   else if(url.pathname==='/rpc/security_create_trip_invoice'){
    let invoice=rows.invoices.find(row=>row.trip_id===body.p_trip_id);
    if(!invoice){invoice={id:rows.invoices.length+1,trip_id:body.p_trip_id,invoice_number:`TRIP-${body.p_trip_id}`,receipt_snapshot:body.p_receipt};rows.invoices.push(invoice);}data=invoice;
   }
   else throw Error('Unhandled RPC');
  } else {
   const table=rows[url.pathname.slice(1)];if(!table)throw Error('Unhandled table');
   const matches=row=>[...url.searchParams].filter(([key])=>!['select','order','limit','offset','columns'].includes(key)).every(([key,value])=>{
    const op=value.slice(0,value.indexOf('.')),arg=value.slice(value.indexOf('.')+1);if(op==='gte')return row[key]!=null&&String(row[key])>=arg;if(op==='lt')return row[key]!=null&&String(row[key])<arg;if(op==='in')return arg.slice(1,-1).split(',').includes(String(row[key]));return String(row[key])===arg;
   });
   if(req.method==='POST'){const record={...(Array.isArray(body)?body[0]:body),id:table.length+1,created_at:new Date().toISOString(),revoked:false};table.push(record);data=record;}
   else {let found=table.filter(matches);if(req.method==='PATCH')found.forEach(row=>Object.assign(row,body));
    if(req.method==='GET'&&req.headers.prefer?.includes('count=exact')){const total=found.length;const offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||1000);found=found.slice(offset,offset+limit);res.setHeader('Content-Range',`${offset}-${offset+found.length-1}/${total}`);}
    const columns=url.searchParams.get('select');if(columns&&columns!=='*')found=found.map(row=>Object.fromEntries(columns.split(',').filter(k=>k in row).map(k=>[k,row[k]])));
    data=req.headers.accept?.includes('vnd.pgrst.object')?found[0]:found;}

  }
  if(data===undefined){res.writeHead(406,{'Content-Type':'application/json'});res.end(JSON.stringify({code:'PGRST116',message:'Not found'}));return;}
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(data));
 }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'Simulated database assertion failed'}));}
});
mock.listen(0,'127.0.0.1');await once(mock,'listening');
const dbUrl=`http://127.0.0.1:${mock.address().port}`;const base='http://127.0.0.1:3003';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3003'],{env:{...process.env,NODE_ENV:'production',JWT_SECRET:secret,HASH_SALT_KEY:'integration-only-salt',SCHEMA_USER:'test_user',SCHEMA_ADMIN_USER:'test_admin',POSTGREST_URL:dbUrl,POSTGREST_SCHEMA:'public',POSTGREST_API_KEY:'',PLATFORM_ADMIN_IDS:'1',ADMIN_TOTP_SECRETS_JSON:JSON.stringify({'1':totpSecret}),RATE_LIMIT_SECRET:'integration-only-rate-limit-secret',APP_ORIGIN:base,TRUST_PROXY:'false',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
const checks=[];
async function request(path,method='GET',body,token,cookie){return fetch(base+path,{method,headers:{...(method!=='GET'?{'Content-Type':'application/json',origin:base}:{}),...(token?{Authorization:`Bearer ${token}`} :{}),...(cookie?{cookie}: {})},body:body?JSON.stringify(body):undefined});}
async function status(name,promise,expected){const response=await promise;assert.equal(response.status,expected,name);checks.push(name);return response;}
const sign=async(id,amr='password',role='test_user')=>new SignJWT({sub:String(id),role,amr,isAdmin:true}).setProtectedHeader({alg:'HS256'}).setIssuer('jouw-driver').setAudience('jouw-driver').setIssuedAt().setExpirationTime('5m').sign(new TextEncoder().encode(secret));
try {
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Production startup timeout')),45000);server.stdout.on('data',chunk=>{if(chunk.toString().includes('Ready')){clearTimeout(timer);resolve();}});server.once('exit',code=>{clearTimeout(timer);reject(Error(`Production server exited ${code}`));});});
 await status('Administrator password alone is rejected',request('/next_api/auth/login','POST',{email:rows.users[0].email,password}),401);
 const otp=totpAt(totpSecret,Math.floor(Date.now()/30000));
 const login=await status('Administrator password and OTP succeeds',request('/next_api/auth/login','POST',{email:rows.users[0].email,password,otp}),200);
 const cookies=login.headers.getSetCookie();assert.equal(cookies.length,2);assert.ok(cookies.every(c=>/HttpOnly/.test(c)&&/Secure/.test(c)&&/SameSite=Lax/.test(c)));checks.push('Production cookies secure and HTTP only');
 const cookie=cookies.map(c=>c.split(';')[0]).join('; ');
 await status('Consumed administrator OTP cannot be replayed',request('/next_api/auth/login','POST',{email:rows.users[0].email,password,otp}),401);
 const refresh=await status('MFA verified administrator refresh succeeds',request('/next_api/auth/refresh','POST',{},null,cookie),200);
 const refreshedToken=decodeURIComponent(refresh.headers.getSetCookie().find(c=>c.startsWith('auth-token=')).split(';')[0].slice('auth-token='.length));
 assert.equal((await jwtVerify(refreshedToken,new TextEncoder().encode(secret))).payload.amr,'otp');checks.push('Refresh preserves administrator MFA claim');
 await status('Rotated refresh cookie cannot be replayed',request('/next_api/auth/refresh','POST',{},null,cookie),401);
 await status('Password-only admin access is denied in production',request('/next_api/trips','GET',null,await sign(1)),401);
 const driverToken=await sign(2);
 rows.drivers.push({id:11,user_id:1,status:'active',company_id:1});
 const completed=(id,user_id,driver_id)=>({id,user_id,driver_id,company_id:1,status:'completed',start_time:'2026-10-14T10:00:00Z',end_time:'2026-10-14T10:05:00Z',start_address:'Synthetic A',end_address:'Synthetic B',price:2,currency:'EUR',distance_km:1,duration_minutes:5,private_payload:'synthetic-internal-only'});
 rows.trips.push(completed(103,2,1),completed(104,3,2),completed(105,1,11));
 const driverHistory=await status('Native history ignores hostile driver/company scope',request('/next_api/drivers/trips?driver_id=2&company_id=99&limit=25','GET',null,driverToken),200);
 const ownHistory=(await driverHistory.json()).data;assert.deepEqual(ownHistory.trips.map(row=>row.id),[103]);assert.equal(ownHistory.driver_id,1);assert.equal('private_payload' in ownHistory.trips[0],false);
 const adminHistory=await status('Native administrator driver history remains self-scoped',request('/next_api/drivers/trips?limit=25','GET',null,refreshedToken),200);assert.deepEqual((await adminHistory.json()).data.trips.map(row=>row.id),[105]);

 // Exercise the actual native PDF request against production middleware and PDF generation.
 await status('Legacy native invoice without JSON type is rejected',fetch(base+'/next_api/trips/generate-invoice?id=103',{method:'POST',headers:{Origin:base,Authorization:`Bearer ${driverToken}`,Accept:'application/pdf'}}),415);
 const native=createDriverApi((url,options)=>{const target=new URL(url);return fetch(base+target.pathname+target.search,{...options,headers:{...options.headers,Origin:base,Authorization:`Bearer ${driverToken}`}});});
 for(let attempt=0;attempt<2;attempt++){
  const pdf=await native.invoice(1,103);assert.equal(new TextDecoder().decode(pdf.subarray(0,5)),'%PDF-');assert.ok(pdf.length>1000);
 }
 assert.equal(rows.invoices.filter(row=>row.trip_id===103).length,1);checks.push('Native end-trip/history PDF requests pass real middleware and return a PDF with one durable invoice');
 await assert.rejects(native.invoice(1,104),error=>error.status===404);checks.push('Native PDF still denies another driver trip');

 const activityQuery={from:'2026-10-14',to:'2026-10-15',platform:'all',status:'all'};
 for(let n=0;n<1030;n++)rows.trips.push({...completed(200+n,2,1),price:'2.00',ride_type:'INTERNAL',payment_method:'cash'});
 const activity=await native.activity(1,activityQuery);assert.equal(activity.total,1031);assert.equal(activity.trips.length,25);assert.equal(activity.next_offset,25);assert.equal('private_payload' in activity.trips[0],false);
 const tail=await native.activity(1,activityQuery,1025);assert.equal(tail.trips.length,6);assert.equal(tail.next_offset,null);
 const revenue=await native.revenue(1,activityQuery);assert.equal(revenue.total_trips,1031);assert.equal(revenue.total_revenue,2062);checks.push('Native activity paginates all own matching records and summary covers the entire period');
 const hostile=await status('Activity ignores hostile owner filters even for administrator',request('/next_api/drivers/activity?from=2026-10-14&to=2026-10-15&driver_id=1&user_id=2','GET',null,refreshedToken),200);assert.deepEqual((await hostile.json()).data.trips.map(r=>r.id),[105]);
 const filtered=await native.activity(1,{...activityQuery,platform:'INTERNAL'});assert.equal(filtered.total,1030);await status('Invalid activity date rejected',request('/next_api/drivers/activity?from=2026-02-30&to=2026-10-17','GET',null,driverToken),400);
 rows.driver_registration_requests=[];rows.drivers[0].current_vehicle_id=21;rows.drivers[0].assigned_vehicle_id=20;rows.vehicles.push({id:20,company_id:1,status:'active',plate_number:'OLD'},{id:21,company_id:1,status:'active',plate_number:'CURRENT'});
 const details=await native.profileDetails(1);assert.equal(details.driver.id,1);assert.equal(details.vehicle.id,21);checks.push('Native profile shows own company and authoritative selected vehicle');

 await status('Driver cannot enter admin company endpoint',request('/next_api/companies','GET',null,driverToken),403);
 await status('Client admin role claims do not grant platform authority',request('/next_api/companies','GET',null,await sign(2,'password','test_admin')),403);
 await status('Driver cannot edit another driver trip',request('/next_api/trips?id=102','PUT',{price:40},driverToken),404);assert.equal(rows.trips[1].price,20);
 await status('Driver can edit own unlocked trip',request('/next_api/trips?id=101','PUT',{price:15},driverToken),200);assert.equal(rows.trips[0].price,15);
 rows.users[1].is_active=false;await status('Disabled user cannot obtain login cookies',request('/next_api/auth/login','POST',{email:rows.users[1].email,password}),401);await status('Disabled driver cannot use existing access token',request('/next_api/trips','GET',null,driverToken),401);rows.users[1].is_active=true;
 rows.users[1].security_revoked_before=new Date(Date.now()+1000).toISOString();await status('Account-wide revocation blocks old access token',request('/next_api/trips','GET',null,driverToken),401);delete rows.users[1].security_revoked_before;
 unavailable=true;await status('Production rate storage failure closes access',request('/next_api/trips','GET',null,driverToken),503);
 assert.ok(databaseTokens.length>0);checks.push('Database receives server service tokens, never browser roles');
 const result={passed:checks.length,checks,database:'Simulated PostgREST; real production Next HTTP handlers'};
 fs.mkdirSync(new URL('./verification/',import.meta.url),{recursive:true});
 fs.writeFileSync(new URL('./verification/auth-integration.json',import.meta.url),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
}finally{server.kill('SIGTERM');mock.closeAllConnections();await new Promise(resolve=>mock.close(resolve));}
