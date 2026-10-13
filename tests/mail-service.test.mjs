import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
import * as policy from '../src/lib/mail-policy.ts';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/mail-service.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const env={DATA_ENCRYPTION_KEY:'a'.repeat(64),RESEND_KEY:'synthetic-key',RESEND_FROM_EMAIL:'noreply@example.invalid',RESEND_VERIFIED_DOMAIN:'example.invalid',RESEND_FREE_PLAN_CONFIRMED:'true'};
const message={to:'synthetic@example.invalid',subject:'Synthetic verification',html:'<p>123456</p>',text:'123456',purpose:'verification',event:'synthetic-action-1'};
function service({reservation={reserved:true,id:1,status:'sending'},response={ok:true,status:200,json:async()=>({id:'00000000-0000-4000-8000-000000000001'})},configured=env,completeError=false}={}){
 const calls=[],exports={};const client={rpc:async(name,body)=>{calls.push({name,body});return name==='security_reserve_mail'?{data:reservation}:completeError?{error:{message:'synthetic'}}:{data:{status:body.p_status}};}};
 vm.runInNewContext(source,{exports,process:{env:configured},AbortSignal,fetch:async(url,options)=>{calls.push({url,options});if(response instanceof Error)throw response;return response;},require:name=>name==='./auth'?{generateAdminUserToken:async()=>'synthetic-token'}:name==='./postgrest'?{createPostgrestClient:()=>client}:policy});
 return {send:exports.sendTransactionalMail,calls};
}
test('provider acceptance is recorded separately from delivered proof and uses an idempotency key',async()=>{
 const s=service();const result=await s.send(message);assert.equal(result.accepted,true);assert.equal(result.status,'accepted');const request=s.calls.find(x=>x.url);assert.equal(request.url,'https://api.resend.com/emails');assert.match(request.options.headers['Idempotency-Key'],/^jd-[a-f0-9]{64}$/);assert.equal(JSON.parse(request.options.body).text,'123456');assert.equal(s.calls.at(-1).body.p_status,'accepted');assert.ok(s.calls.at(-1).body.p_provider_id);
});
test('unconfigured, suppressed, uncertain and quota-limited events never initiate another send',async()=>{
 for(const options of [{configured:{}},...['sending','uncertain','suppressed','quota_exceeded'].map(status=>({reservation:{reserved:false,id:1,status}}))]){const s=service(options);assert.equal((await s.send(message)).accepted,false);assert.equal(s.calls.some(x=>x.url),false);}
 const already=service({reservation:{reserved:false,id:1,status:'delivered'}});assert.equal((await already.send(message)).status,'delivered');assert.equal(already.calls.some(x=>x.url),false);
});
test('network and server failures retain uncertainty while explicit rejection does not claim success',async()=>{
 for(const [response,status] of [[new Error('synthetic timeout'),'uncertain'],[{ok:false,status:503},'uncertain'],[{ok:false,status:403},'failed'],[{ok:true,status:200,json:async()=>({})},'uncertain']]){const s=service({response});const result=await s.send(message);assert.equal(result.accepted,false);assert.equal(result.status,status);assert.equal(s.calls.at(-1).body.p_status,status);}
 const recordFailed=service({completeError:true});assert.equal((await recordFailed.send(message)).status,'uncertain');
});
