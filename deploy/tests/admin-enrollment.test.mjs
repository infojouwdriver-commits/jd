import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createEnrollmentHandler,totp} from '../admin-enrollment.mjs';
test('RFC 6238 time based code remains compatible with authenticator apps',()=>{
 assert.equal(totp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',Math.floor(59/30)),'287082');
});
test('owner enrollment rejects cross-origin and invalid OTP, then completes once without returning password hash',async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'jd-enrollment-test-'));
 const marker=path.join(directory,'done.json');const now=()=>1234567890000;
 const secret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';let writes=0;
 const env={INITIAL_ADMIN_EMAIL:'jouw2023@gmail.com',INITIAL_ADMIN_HASH:'$2b$12$'+'a'.repeat(53),PLATFORM_ADMIN_IDS:'1',ADMIN_TOTP_SECRETS_JSON:JSON.stringify({'1':secret}),APP_ORIGIN:'https://portal.example.test',POSTGREST_URL:'http://postgrest:3000',POSTGREST_SCHEMA:'public',SCHEMA_ADMIN_USER:'jouw_service',JWT_SECRET:'synthetic-only-key'.repeat(3)};
 const server=http.createServer(createEnrollmentHandler({env,marker,now,fetchImpl:async(url,options)=>{writes++;assert.equal(url,'http://postgrest:3000/rpc/security_enroll_initial_owner');assert.equal(JSON.parse(options.body).p_password,env.INITIAL_ADMIN_HASH);return new Response(JSON.stringify({id:1,email:env.INITIAL_ADMIN_EMAIL}),{status:200});}}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const post=(origin,otp)=>fetch(base+'/admin-setup/finish',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({otp})});
  assert.equal((await post('https://attacker.example','000000')).status,403);
  assert.equal((await post(env.APP_ORIGIN,'000000')).status,401);
  assert.equal(writes,0);assert.equal(fs.existsSync(marker),false);
  const result=await post(env.APP_ORIGIN,totp(secret,Math.floor(now()/30000)));
  assert.equal(result.status,200);assert.doesNotMatch(await result.text(),/\$2b\$12\$/);
  assert.equal(writes,1);assert.equal(fs.statSync(marker).mode&0o777,0o600);
  const after=await fetch(base+'/admin-setup');assert.doesNotMatch(await after.text(),new RegExp(secret));
  await post(env.APP_ORIGIN,totp(secret,Math.floor(now()/30000)));assert.equal(writes,1);
 }finally{await new Promise(resolve=>server.close(resolve));fs.rmSync(directory,{recursive:true});}
});
