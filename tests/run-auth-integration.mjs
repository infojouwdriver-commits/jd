// Real production Next handlers, isolated simulated PostgREST. No real accounts or network services.
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import bcrypt from 'bcryptjs';
import {SignJWT,jwtVerify} from 'jose';
import {totpAt} from '../src/lib/totp.ts';

const secret='integration-only-jwt-secret-01234567890123456789';
const totpSecret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const password='IntegrationPassword123!';
const rows={users:[{id:1,email:'admin@example.invalid',password:await bcrypt.hash(password,4),user_type:'admin',is_active:true},{id:2,email:'driver@example.invalid',password:await bcrypt.hash(password,4),user_type:'driver',is_active:true}],sessions:[],refresh_tokens:[],trips:[{id:101,user_id:2,price:10,locked_after_completion:false},{id:102,user_id:3,price:20,locked_after_completion:false}],invoices:[]};
const claims=new Set();let unavailable=false;const databaseTokens=[];
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
   else throw Error('Unhandled RPC');
  } else {
   const table=rows[url.pathname.slice(1)];if(!table)throw Error('Unhandled table');
   const matches=row=>[...url.searchParams].filter(([key])=>!['select','order','limit','offset','columns'].includes(key)).every(([key,value])=>String(row[key])===value.replace(/^eq\./,''));
   if(req.method==='POST'){const record={...(Array.isArray(body)?body[0]:body),id:table.length+1,created_at:new Date().toISOString(),revoked:false};table.push(record);data=record;}
   else {let found=table.filter(matches);if(req.method==='PATCH')found.forEach(row=>Object.assign(row,body));data=req.headers.accept?.includes('vnd.pgrst.object')?found[0]:found;}
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
