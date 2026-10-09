// Native acceptance test for CI hosts with Docker. Synthetic data only; no persistent volumes.
// This has not passed until executed successfully against both real container images.
import {spawn} from 'node:child_process';
import {randomBytes,randomUUID} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {exportSchema} from '../scripts/export-schema.mjs';
import assert from 'node:assert/strict';
import {SignJWT,jwtVerify} from 'jose';
import bcrypt from 'bcryptjs';
const images={postgres:'postgres:16.15-bookworm',postgrest:'postgrest/postgrest:v13.0.8'};
const prefix=`jd-stack-${randomBytes(5).toString('hex')}`;
const application=`${prefix}-app`,appImage=`${prefix}:acceptance`;
const database=`${prefix}-db`,gateway=`${prefix}-api`,network=`${prefix}-internal`,front=`${prefix}-front`;
const config={schema:'public',user_role:'jd_browser',admin_role:'jd_service',gateway_role:'jd_gateway',gateway_password:randomBytes(32).toString('hex')};
const jwtSecret=randomBytes(48).toString('hex');const postgresPassword=randomBytes(32).toString('hex');
const checks=[];let base;
let schemaExportWork;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function docker(args,{input,env,timeout=180000}={}) {
 return new Promise((resolve,reject)=>{
  const process=spawn('docker',args,{env:{...globalThis.process.env,...env},stdio:['pipe','pipe','pipe']});let stdout='';
  const timer=setTimeout(()=>{process.kill('SIGKILL');reject(Error(`Docker ${args[0]} timed out`));},timeout);
  process.stdout.on('data',chunk=>{stdout+=chunk;if(stdout.length>3000000){process.kill('SIGKILL');reject(Error('Docker output limit'));}});
  // Deliberately never echo stderr, command arguments, SQL or generated credentials.
  process.stderr.resume();process.once('error',()=>{clearTimeout(timer);reject(Error('Docker is unavailable; native stack test has not run'));});
  process.once('close',code=>{clearTimeout(timer);code===0?resolve(stdout.trim()):reject(Error(`Docker ${args[0]} failed; inspect the isolated runner privately`));});
  process.stdin.on('error',()=>{});process.stdin.end(input);
 });
}
async function psql(sql){return docker(['exec','-i',database,'psql','-U','postgres','-d','jd_test','-v','ON_ERROR_STOP=1','-At'],{input:sql,timeout:45000});}
function deploymentSql(file) {
 let sql=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 for(const [key,value]of Object.entries(config))sql=sql.replaceAll(`:'${key}'`,"'"+value.replaceAll("'","''")+"'").replaceAll(`:\"${key}\"`,'"'+value.replaceAll('"','""')+'"');
 return sql;
}
async function token(role,sub='0'){return new SignJWT({role,sub}).setProtectedHeader({alg:'HS256'}).setIssuer('jouw-driver').setAudience('jouw-driver').setIssuedAt().setExpirationTime('40m').sign(new TextEncoder().encode(jwtSecret));}
async function api(path,auth,method='GET',body){
 const response=await fetch(base+path,{method,signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${auth}`,'Content-Type':'application/json','Accept-Profile':'public','Content-Profile':'public',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
 const text=await response.text();let data;try{data=JSON.parse(text);}catch{data=text;}
 return {status:response.status,data};
}
async function success(path,auth,method='GET',body){const result=await api(path,auth,method,body);assert.ok(result.status>=200&&result.status<300,`Expected success for ${path}; status ${result.status}`);return result.data;}
async function denied(path,auth,method='GET',body){const result=await api(path,auth,method,body);assert.ok([401,403,404].includes(result.status),`Expected role denial for ${path}; status ${result.status}`);return result;}
try {
 await docker(['version','--format','{{.Server.Version}}'],{timeout:15000});
 await docker(['pull',images.postgres]);await docker(['pull',images.postgrest]);
 await docker(['network','create','--internal',network]);await docker(['network','create',front]);
 await docker(['run','--detach','--name',database,'--network',network,'--network-alias','db','--env','POSTGRES_DB','--env','POSTGRES_PASSWORD',images.postgres],{env:{POSTGRES_DB:'jd_test',POSTGRES_PASSWORD:postgresPassword}});
 let ready=false;for(let i=0;i<60;i++){try{await docker(['exec',database,'pg_isready','-U','postgres','-d','jd_test'],{timeout:5000});ready=true;break;}catch{await delay(1000);}}
 assert.ok(ready,'Native PostgreSQL did not become ready');
 const bindings=JSON.parse(await docker(['inspect','--format','{{json .HostConfig.PortBindings}}',database]));assert.ok(!bindings||Object.keys(bindings).length===0);checks.push('PostgreSQL has no published host port');
 await psql(fs.readFileSync(new URL('../schema/reconstructed-staging.sql',import.meta.url),'utf8'));
 await psql(`CREATE FUNCTION public.stack_public_canary() RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE FUNCTION public.stack_role_probe() RETURNS jsonb LANGUAGE sql AS $$ SELECT jsonb_build_object('role',current_user,'superuser',rolsuper,'bypassrls',rolbypassrls,'login',rolcanlogin) FROM pg_roles WHERE rolname=current_user $$;`);
 for(const file of ['deploy/setup-gateway.sql','migrations/20261009_security.sql','migrations/20261010_release.sql','migrations/20261010_admin_mfa.sql','migrations/20261010_gateway_lockdown.sql','deploy/setup-gateway.sql'])await psql(deploymentSql(file));
 checks.push('Reconstructed schema and full deployment migration sequence applied on native PostgreSQL');
 // Exercise the exporter against real pg_dump, not the historical app.sql source.
 schemaExportWork=fs.mkdtempSync(path.join(os.tmpdir(),'jd-live-schema-'));
 fs.writeFileSync(path.join(schemaExportWork,'pg_dump'), `#!/bin/sh\nexec docker exec --env PGOPTIONS ${database} pg_dump -U postgres -d jd_test "$@"\n`, {mode:0o700});
 const exported=await exportSchema({directory:path.join(schemaExportWork,'result'),schema:'public',env:{...process.env,PATH:schemaExportWork+path.delimiter+process.env.PATH,PGHOST:'127.0.0.1',PGDATABASE:'jd_test',PGUSER:'postgres'}});
 const exportedDdl=fs.readFileSync(path.join(schemaExportWork,'result/database-schema.sql'),'utf8');
 assert.ok(exported.schemaOnly&&exported.readOnlyConnection);assert.match(exportedDdl,/CREATE TABLE public\.trips/);assert.match(exportedDdl,/CREATE FUNCTION public\.security_save_completed_trip/);assert.match(exportedDdl,/CREATE POLICY/);assert.doesNotMatch(exportedDdl,/-- Data for Name:/);
 checks.push('Read-only live schema exporter saves native pg_dump tables, functions and RLS without row data');
 const gatewayPrivileges=JSON.parse(await psql("SELECT jsonb_build_object('superuser',rolsuper,'bypassrls',rolbypassrls,'inherit',rolinherit) FROM pg_roles WHERE rolname='jd_gateway';"));assert.deepEqual(gatewayPrivileges,{superuser:false,bypassrls:false,inherit:false});checks.push('Gateway database login is not superuser and does not bypass RLS or inherit service privileges');
 await docker(['create','--name',gateway,'--network',front,'--network-alias','postgrest','--publish','127.0.0.1::3000','--cap-drop','ALL','--security-opt','no-new-privileges:true','--env','PGRST_DB_URI','--env','PGRST_DB_SCHEMAS','--env','PGRST_JWT_SECRET','--env','PGRST_JWT_AUD',images.postgrest],{env:{PGRST_DB_URI:`postgres://jd_gateway:${config.gateway_password}@db:5432/jd_test`,PGRST_DB_SCHEMAS:'public',PGRST_JWT_SECRET:jwtSecret,PGRST_JWT_AUD:'jouw-driver'}});
 await docker(['network','connect',network,gateway]);
 await docker(['start',gateway]);
 const address=await docker(['port',gateway,'3000/tcp']);assert.match(address,/^127\.0\.0\.1:\d+$/);base=`http://${address}`;checks.push('PostgREST publishes only a random loopback port');
 const service=await token(config.admin_role),browser=await token(config.user_role,'222');
 ready=false;for(let i=0;i<60;i++){try{const response=await api('/trips?limit=0',service);if(response.status===200){ready=true;break;}}catch{}await delay(1000);}assert.ok(ready,'PostgREST schema cache did not become ready');
 const role=await success('/rpc/stack_role_probe',service,'POST',{});assert.deepEqual(role,{role:'jd_service',superuser:false,bypassrls:false,login:false});checks.push('JWT switches real PostgREST to non-superuser service role under RLS');
 await success('/companies',service,'POST',{id:1,name:'Synthetic acceptance company'});checks.push('Service role writes and reads business data');assert.equal((await success('/companies?id=eq.1',service))[0].name,'Synthetic acceptance company');
 await denied('/companies',browser);await denied('/rpc/stack_public_canary',browser,'POST',{});checks.push('Browser role cannot read tables or invoke restored PUBLIC function');
 const key=randomUUID();const payload={user_id:999,company_id:1,driver_id:1,vehicle_id:1,status:'completed',price:12,trip_uuid:randomUUID(),start_time:new Date(Date.now()-60000).toISOString(),end_time:new Date().toISOString(),locked_after_completion:false};
 const args={p_payload:payload,p_user_id:222,p_key:key};const save=()=>success('/rpc/security_save_completed_trip',service,'POST',args);
 const concurrent=await Promise.all([save(),save(),save(),save()]);assert.equal(concurrent.filter(row=>row.created).length,1);assert.equal(new Set(concurrent.map(row=>row.trip.id)).size,1);assert.ok(concurrent.every(row=>row.trip.user_id===222&&row.trip.locked_after_completion===true));checks.push('Concurrent completion retries create one trip, force server owner and lock completed trip');
 assert.equal((await success('/trips?completion_request_key=eq.'+key,service)).length,1);
 const again=await save();assert.equal(again.created,false);checks.push('Subsequent completion retry returns the original record');
 await denied('/rpc/security_save_completed_trip',browser,'POST',args);checks.push('Browser role cannot invoke completion RPC');
 const step=Math.floor(Date.now()/30000);const otpArgs={p_user_id:222,p_step:step};assert.equal(await success('/rpc/security_claim_mfa',service,'POST',otpArgs),true);assert.equal(await success('/rpc/security_claim_mfa',service,'POST',otpArgs),false);await denied('/rpc/security_claim_mfa',browser,'POST',otpArgs);checks.push('Native MFA claim accepts once, rejects replay and browser role');
 const rateArgs={p_key:randomBytes(32).toString('hex'),p_limit:2};assert.equal(await success('/rpc/security_rate_limit',service,'POST',rateArgs),true);assert.equal(await success('/rpc/security_rate_limit',service,'POST',rateArgs),true);assert.equal(await success('/rpc/security_rate_limit',service,'POST',rateArgs),false);await denied('/rpc/security_rate_limit',browser,'POST',rateArgs);checks.push('Native shared rate bucket enforces limit and denies browser RPC');
 // Test the actual production Dockerfile and standalone server against the real stack.
 await docker(['build','--tag',appImage,'.'],{timeout:720000});
 checks.push('Actual root Dockerfile builds the production standalone image');
 const appPassword=randomBytes(24).toString('base64url');const hash=await bcrypt.hash(appPassword,12);
 await success('/users',service,'POST',[{id:1,email:'admin@example.invalid',password:hash,user_type:'admin',role:'jd_browser'},{id:2,email:'driver@example.invalid',password:hash,user_type:'driver',role:'jd_browser'}]);
 await success('/companies?id=eq.1',service,'PATCH',{chiron_mode:'TEST'});
 await success('/vehicles',service,'POST',{id:1,company_id:1,plate_number:'SYNTHETIC-1',status:'active'});
 await success('/drivers',service,'POST',{id:1,user_id:2,company_id:1,current_vehicle_id:1,full_name:'Synthetic acceptance driver',phone:'+32000000002',status:'active'});
 const appOrigin='https://acceptance.jouw-driver.test';
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';const mfaSecret=Array.from(randomBytes(40),b=>alphabet[b&31]).join('');
 const appEnv={APP_ORIGIN:appOrigin,NEXT_PUBLIC_APP_URL:appOrigin,POSTGREST_URL:'http://postgrest:3000',POSTGREST_INTERNAL_NETWORK:'true',POSTGREST_SCHEMA:'public',SCHEMA_USER:'jd_browser',SCHEMA_ADMIN_USER:'jd_service',JWT_SECRET:jwtSecret,HASH_SALT_KEY:randomBytes(32).toString('hex'),RATE_LIMIT_SECRET:randomBytes(32).toString('hex'),DATA_ENCRYPTION_KEY:randomBytes(32).toString('hex'),PLATFORM_ADMIN_IDS:'1',ADMIN_TOTP_SECRETS_JSON:JSON.stringify({'1':mfaSecret}),PRIVACY_CONTACT_EMAIL:'privacy@example.invalid',PRIVACY_CONTROLLER_NAME:'Synthetic acceptance controller',PRIVACY_CONTROLLER_ADDRESS:'Synthetic test address only',TRIP_RETENTION_YEARS:'7',TRUST_PROXY:'true',DEPLOYMENT_MODE:'staging',SCHEMA_VALIDATED:'false',CHIRON_TRANSMISSION_ENABLED:'false'};
 const envArgs=Object.keys(appEnv).flatMap(key=>['--env',key]);
 await docker(['run','--detach','--name',application,'--network',front,'--publish','127.0.0.1::3000','--read-only','--tmpfs','/tmp','--tmpfs','/app/.next/cache:uid=10001,gid=10001','--cap-drop','ALL','--security-opt','no-new-privileges:true',...envArgs,appImage],{env:appEnv});
 const appAddress=await docker(['port',application,'3000/tcp']);assert.match(appAddress,/^127\.0\.0\.1:\d+$/);const appBase=`http://${appAddress}`;
 async function appApi(path,method='GET',body,cookie,bearer){
  const response=await fetch(appBase+path,{method,signal:AbortSignal.timeout(15000),headers:{Origin:appOrigin,'Content-Type':'application/json','X-Real-IP':'127.0.0.1',...(cookie?{Cookie:cookie}:{}),...(bearer?{Authorization:`Bearer ${bearer}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  let data;try{data=await response.clone().json();}catch{data=null;}return {response,status:response.status,data};
 }
 ready=false;for(let i=0;i<90;i++){try{if((await appApi('/privacy-policy')).status===200){ready=true;break;}}catch{}await delay(1000);}assert.ok(ready,'Standalone application did not start with native database');
 const appLogs=await docker(['logs',application]);assert.match(appLogs,/Configuration syntax checks passed/);assert.match(appLogs,/Database release columns and service access verified/);
 assert.equal(await docker(['exec',application,'id','-u']),'10001');assert.equal(await docker(['inspect','--format','{{.HostConfig.ReadonlyRootfs}}',application]),'true');
 checks.push('Standalone startup passes real preflight/readiness as UID10001 with read-only filesystem');
 const login=await appApi('/next_api/auth/driver-login','POST',{phone:'+32000000002',password:appPassword});assert.equal(login.status,200,'Native driver password login failed');
 const cookies=login.response.headers.getSetCookie();assert.equal(cookies.length,2);assert.ok(cookies.every(c=>/HttpOnly/.test(c)&&/Secure/.test(c)&&/SameSite=Lax/.test(c)));
 const cookie=cookies.map(c=>c.split(';')[0]).join('; ');const access=decodeURIComponent(cookies.find(c=>c.startsWith('auth-token=')).split(';')[0].slice('auth-token='.length));
 const claims=(await jwtVerify(access,new TextEncoder().encode(jwtSecret))).payload;assert.equal(claims.sub,'2');assert.equal(claims.role,'jd_browser');checks.push('Real application phone login validates bcrypt and issues secure cookies with browser role');
 const profile=await appApi('/next_api/auth/user','GET',undefined,cookie);assert.equal(profile.status,200);assert.equal(profile.data.data.isAdmin,false);assert.equal(profile.data.data.sub,'2');checks.push('Cookie session resolves authenticated driver through real database');
 const originalStart=new Date(Date.now()-120*60000).toISOString(),originalEnd=new Date(Date.now()-110*60000).toISOString();const appKey=randomUUID();
 const tripBody={completion_request_key:appKey,user_id:999,driver_id:999,vehicle_id:999,company_id:999,start_time:originalStart,end_time:originalEnd,start_lat:50.85,start_lon:4.35,end_lat:0,end_lon:0,start_address:'Synthetic start',end_address:'Synthetic end',distance_km:3.4,duration_minutes:10,price:22.55,ride_type:'INTERNAL',currency:'EUR',payment_method:'cash'};
 const finish=await appApi('/next_api/trips/end','POST',tripBody,cookie);assert.equal(finish.status,201,'Native application trip completion failed');const finished=finish.data.data;
 assert.equal(finished.user_id,2);assert.equal(finished.driver_id,1);assert.equal(finished.vehicle_id,1);assert.equal(finished.company_id,1);assert.equal(finished.locked_after_completion,true);assert.equal(finished.price,22.55);assert.equal(finished.end_lat,0);assert.equal(finished.end_lon,0);
 assert.equal(Date.parse(finished.start_time),Date.parse(originalStart));assert.equal(Date.parse(finished.end_time),Date.parse(originalEnd));assert.ok(finished.warning);
 checks.push('Real application completion persists original offline times, exact owner/vehicle/price and zero coordinates without Chiron');
 const replays=await Promise.all([appApi('/next_api/trips/end','POST',{...tripBody,price:999},cookie),appApi('/next_api/trips/end','POST',tripBody,cookie)]);
 assert.ok(replays.every(result=>result.status===200&&result.data.data.id===finished.id&&result.data.data.replayed===true&&result.data.data.price===22.55));
 assert.equal((await success('/trips?completion_request_key=eq.'+appKey,service)).length,1);checks.push('Two application retries return the original completed record without duplication or repricing');
 assert.equal((await appApi('/next_api/trips?id='+finished.id,'PUT',{price:99},cookie)).status,409);checks.push('Application refuses edits to the locked completed trip');
 assert.equal((await appApi('/next_api/companies','GET',undefined,cookie)).status,403);assert.equal((await appApi('/next_api/trips?id='+again.trip.id,'PUT',{price:99},cookie)).status,404);checks.push('Real database-backed driver authorization denies admin routes and another owner trip');
 const logout=await appApi('/next_api/auth/logout','POST',{},cookie);assert.equal(logout.status,200);assert.ok(logout.response.headers.getSetCookie().every(c=>/Max-Age=0/.test(c)));
 assert.equal((await appApi('/next_api/trips','GET',undefined,undefined,access)).status,401);checks.push('Logout revokes existing access token against real PostgreSQL and clears cookies');
 await docker(['stop',gateway],{timeout:30000});assert.equal((await appApi('/next_api/trips','GET',undefined,undefined,access)).status,503);checks.push('Actual app fails closed with 503 when real PostgREST rate storage is unavailable');
 console.log(JSON.stringify({passed:checks.length,checks,images,engine:'Actual standalone Docker application + native PostgreSQL + official PostgREST',data:'Synthetic only; inferred schema, not Zoer authoritative',chiron_tested:false},null,2));
}finally {
 if(schemaExportWork)fs.rmSync(schemaExportWork,{recursive:true,force:true});
 // Only remove resources whose cryptographically random task-specific names we created.
 for(const name of [application,gateway,database])await docker(['rm','--force','--volumes',name],{timeout:20000}).catch(()=>{});
 await docker(['image','rm','--force',appImage],{timeout:20000}).catch(()=>{});
 for(const name of [front,network])await docker(['network','rm',name],{timeout:20000}).catch(()=>{});
}
