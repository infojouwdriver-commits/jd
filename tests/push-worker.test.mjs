import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';
import {spawnSync} from 'node:child_process';

test('sender readiness authenticates to the audience-restricted private gateway without claiming jobs',()=>{
 const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
 const account={type:'service_account',project_id:'jouw-driver',client_email:'sender@jouw-driver.iam.gserviceaccount.com',private_key:privateKey};
 const preload=`import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';
 let calls=0;
 globalThis.fetch=async(url,options)=>{
  calls++;
  if(url==='https://oauth2.googleapis.com/token'){
   assert.equal(calls,1);
   const assertion=options.body.get('assertion').split('.');
   assert.equal(JSON.parse(Buffer.from(assertion[1],'base64url')).scope,'https://www.googleapis.com/auth/firebase.messaging');
   return Response.json({access_token:'synthetic-oauth-token'});
  }
  assert.equal(calls,2);
  assert.equal(url,'http://private-gateway.test/rpc/security_native_push_ready');
  assert.equal(options.method,'POST');
  assert.equal(options.headers['Content-Profile'],'public');
  assert.equal(options.headers['Postgrest-API-Key'],'synthetic-api-key');
  const parts=options.headers.Authorization.slice(7).split('.');
  assert.equal(parts[2],createHmac('sha256',process.env.JWT_SECRET).update(parts[0]+'.'+parts[1]).digest('base64url'));
  const claims=JSON.parse(Buffer.from(parts[1],'base64url'));
  assert.equal(claims.aud,'jouw-driver');assert.equal(claims.role,'jouw_service');assert.equal(claims.sub,'0');
  assert.ok(claims.exp>Math.floor(Date.now()/1000)&&claims.exp-claims.iat<=120);
  return Response.json(true);
 };
 process.on('exit',()=>{if(calls!==2)process.exitCode=1;});`;
 const result=spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(preload),'scripts/push-worker.mjs','--check'],{
  cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:15000,
  env:{...process.env,FCM_SERVICE_ACCOUNT_B64:Buffer.from(JSON.stringify(account)).toString('base64'),FCM_PROJECT_ID:'jouw-driver',JWT_SECRET:'synthetic-worker-jwt-secret',SCHEMA_ADMIN_USER:'jouw_service',POSTGREST_URL:'http://private-gateway.test',POSTGREST_SCHEMA:'public',POSTGREST_API_KEY:'synthetic-api-key'}
 });
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/FCM authorization and protected push queue ready/);
});
