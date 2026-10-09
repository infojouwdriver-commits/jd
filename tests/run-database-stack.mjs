// Native acceptance test for CI hosts with Docker. Synthetic data only; no persistent volumes.
// This has not passed until executed successfully against both real container images.
import {spawn} from 'node:child_process';
import {randomBytes,randomUUID} from 'node:crypto';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {SignJWT} from 'jose';
const images={postgres:'postgres:16.15-bookworm',postgrest:'postgrest/postgrest:v13.0.8'};
const prefix=`jd-stack-${randomBytes(5).toString('hex')}`;
const database=`${prefix}-db`,gateway=`${prefix}-api`,network=`${prefix}-internal`,front=`${prefix}-front`;
const config={schema:'public',user_role:'jd_browser',admin_role:'jd_service',gateway_role:'jd_gateway',gateway_password:randomBytes(32).toString('hex')};
const jwtSecret=randomBytes(48).toString('hex');const postgresPassword=randomBytes(32).toString('hex');
const checks=[];let base;
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
async function token(role,sub='0'){return new SignJWT({role,sub}).setProtectedHeader({alg:'HS256'}).setIssuer('jouw-driver').setAudience('jouw-driver').setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(jwtSecret));}
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
 const gatewayPrivileges=JSON.parse(await psql("SELECT jsonb_build_object('superuser',rolsuper,'bypassrls',rolbypassrls,'inherit',rolinherit) FROM pg_roles WHERE rolname='jd_gateway';"));assert.deepEqual(gatewayPrivileges,{superuser:false,bypassrls:false,inherit:false});checks.push('Gateway database login is not superuser and does not bypass RLS or inherit service privileges');
 await docker(['create','--name',gateway,'--network',front,'--publish','127.0.0.1::3000','--cap-drop','ALL','--security-opt','no-new-privileges:true','--env','PGRST_DB_URI','--env','PGRST_DB_SCHEMAS','--env','PGRST_JWT_SECRET','--env','PGRST_JWT_AUD',images.postgrest],{env:{PGRST_DB_URI:`postgres://jd_gateway:${config.gateway_password}@db:5432/jd_test`,PGRST_DB_SCHEMAS:'public',PGRST_JWT_SECRET:jwtSecret,PGRST_JWT_AUD:'jouw-driver'}});
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
 console.log(JSON.stringify({passed:checks.length,checks,images,engine:'Native Docker PostgreSQL + official PostgREST',data:'Synthetic only; inferred schema, not Zoer authoritative',chiron_tested:false},null,2));
}finally {
 // Only remove resources whose cryptographically random task-specific names we created.
 for(const name of [gateway,database])await docker(['rm','--force','--volumes',name],{timeout:20000}).catch(()=>{});
 for(const name of [front,network])await docker(['network','rm',name],{timeout:20000}).catch(()=>{});
}
