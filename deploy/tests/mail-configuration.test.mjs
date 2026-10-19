import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mailRuntimeFiles,checkedBrevoSetup,mailRuntimeKeys,readMailRuntimeEnv} from '../configure-mail.mjs';
test('runtime guards use dotenv semantics for quoted and exported settings',()=>{
 const parsed=readMailRuntimeEnv('APP_ORIGIN="https://jouw-driver.duckdns.org"\nexport DEPLOYMENT_MODE=production\nBREVO_API_KEY="synthetic=value"\n');
 assert.equal(parsed.APP_ORIGIN,'https://jouw-driver.duckdns.org');assert.equal(parsed.DEPLOYMENT_MODE,'production');assert.equal(parsed.BREVO_API_KEY,'synthetic=value');
});
test('mail workflow permits only reviewed main installer and validates live revision ancestry',async()=>{
 const workflow=readFileSync(new URL('../../.github/workflows/configure-mail.yml',import.meta.url),'utf8');
 const gate=workflow.match(/<<'GATE'\n([\s\S]*?)\n\s+GATE/)[1];
 const run=new (Object.getPrototypeOf(async function(){}).constructor)('process','fetch',gate);
 const env={GITHUB_REF:'refs/heads/main',REVISION:'a'.repeat(40),GITHUB_REPOSITORY:'owner/repo'};let calls=0;
 const fetch=async()=>{calls++;return {ok:true,json:async()=>({status:'ahead'})};};
 await assert.rejects(run({env:{...env,GITHUB_REF:'refs/heads/unreviewed'}},fetch),/reviewed main/);assert.equal(calls,0);
 await assert.rejects(run({env:{...env,REVISION:'invalid'}},fetch),/Full tested/);assert.equal(calls,0);
 await assert.rejects(run({env},async()=>({ok:true,json:async()=>({status:'diverged'})})),/ancestry/);
 await run({env},fetch);assert.equal(calls,1);assert.ok(workflow.includes('ref: ${{ github.sha }}'));
});
const key='synthetic-'+ 'k'.repeat(48),token='a'.repeat(64),sender='jouw2023@gmail.com';
test('mail installation preserves unrelated credentials and scopes variables to the application',()=>{
 const env='JWT_SECRET=preserve-synthetic\nCHIRON_PRODUCTION_ENABLED=true\n';
 for(const app of ['    env_file: [.app-staging.env]','    environment:\n      DEPLOYMENT_MODE: ${DEPLOYMENT_MODE:?required}']){
  const config='services:\n  postgrest:\n    environment:\n      DEPLOYMENT_MODE: unrelated\n  app:\n'+app+'\n    read_only: true\nnetworks: {}\n';
  const result=mailRuntimeFiles(env,config,key,sender,token);assert.ok(result.env.includes(env));assert.ok(result.compose.includes('  postgrest:\n    environment:\n      DEPLOYMENT_MODE: unrelated'));assert.ok(result.compose.includes('    read_only: true'));assert.ok(!result.compose.includes(key));
  for(const name of mailRuntimeKeys)assert.equal(result.env.split('\n').filter(l=>l.startsWith(name+'=')).length,1);
  assert.deepEqual(mailRuntimeFiles(result.env,result.compose,key,sender,token),result);
 }
 assert.throws(()=>mailRuntimeFiles(env,'services: {}',key,sender,token));assert.throws(()=>mailRuntimeFiles(env,'services: {}',key+'\nBAD=1',sender,token));assert.throws(()=>mailRuntimeFiles(env,'services: {}',key,'outsider@example.invalid',token));
});
function api(plan,active=true,hooks=[]){const calls=[];return {calls,call:async(path,method='GET',body)=>{calls.push({path,method,body});return path==='/account'?{plan}:path==='/senders'?{senders:[{email:sender,active}]}:path.startsWith('/webhooks?')?{webhooks:hooks}:{};}};}
test('provider setup refuses paid plans and unverified senders before any write',async()=>{
 for(const [plans,active] of [[[{type:'subscription'}],true],[[{type:'free'},{type:'payAsYouGo'}],true],[[{type:'free'}],false]]){const a=api(plans,active);await assert.rejects(checkedBrevoSetup(a.call,token));assert.equal(a.calls.filter(c=>c.method!=='GET').length,0);}
});
test('only the dedicated delivery callback is configured with authenticated non-tracking events',async()=>{
 const a=api([{type:'free'}]);await checkedBrevoSetup(a.call,token);const write=a.calls.at(-1);assert.equal(write.path,'/webhooks');assert.equal(write.method,'POST');assert.equal(write.body.auth.token,token);assert.equal(write.body.url,'https://jouw-driver.duckdns.org/next_api/webhooks/brevo');assert.ok(!write.body.events.includes('opened'));assert.ok(!write.body.events.includes('click'));
 const b=api([{type:'free'}],true,[{id:7,url:write.body.url,description:write.body.description}]);await checkedBrevoSetup(b.call,token);assert.equal(b.calls.at(-1).method,'PUT');assert.equal(b.calls.at(-1).path,'/webhooks/7');
 const conflict=api([{type:'free'}],true,[{id:7,url:write.body.url,description:'Unrelated integration'}]);await assert.rejects(checkedBrevoSetup(conflict.call,token));assert.equal(conflict.calls.filter(c=>c.method!=='GET').length,0);
});
