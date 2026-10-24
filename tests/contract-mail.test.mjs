import test from 'node:test';import assert from 'node:assert/strict';
import {contractInvitation} from '../src/lib/contract-invitation.ts';
import {mailConfiguration} from '../src/lib/mail-policy.ts';
import {brevoProviderId,brevoMailEvent,brevoWebhookAuthorized,brevoIdempotencyKey} from '../src/lib/brevo-mail.ts';
import {disabledEndpoint,publicEndpoint,memberEndpoint} from '../src/lib/security-policy.ts';
const contract={id:1,contract_number:'OLD-99',contract_language:'fr',monthly_fee:'99.95',annual_fee:'1199.40'};
test('invitation preserves historical amounts, escapes company content and links only to authenticated portal',()=>{
 const m=contractInvitation(contract,{name:'<img src=x onerror=alert(1)>'},'https://portal.example.invalid');
 assert.ok(m.html.includes('&lt;img'));assert.ok(!m.html.includes('<img'));assert.ok(m.text.includes('99,95'));assert.ok(m.text.includes('1\u202f199,40'));assert.ok(m.html.includes('https://portal.example.invalid/company/dashboard'));assert.ok(!m.html.includes('signature_token'));assert.ok(!m.html.includes('/sign-contract/'));
 assert.throws(()=>contractInvitation(contract,{name:'Example'},'http://attacker.invalid'));assert.throws(()=>contractInvitation(contract,{name:'Example'},'https://user:pass@example.invalid'));
});
test('all supported invitation languages retain login and no-payment explanations',()=>{
 for(const lang of ['ar','fr','nl']){const m=contractInvitation({...contract,contract_language:lang},{name:'Example'},'https://portal.example.invalid');assert.ok(m.html.includes(`lang="${lang}"`));assert.ok(m.text.includes('/company/dashboard'));}
});
test('invitation handler is admin-only; reviewed email signing is POST-only',()=>{
 assert.equal(disabledEndpoint('/next_api/contracts/send-signature-link'),false);
 assert.equal(publicEndpoint('/next_api/contracts/send-signature-link','POST'),false);
 for(const type of ['driver','company','owner','manager'])assert.equal(memberEndpoint('/next_api/contracts/send-signature-link','POST',type),false);
 for(const path of ['/next_api/contracts/sign','/next_api/contracts/verify-token']){assert.equal(disabledEndpoint(path),false);assert.equal(publicEndpoint(path,'POST'),true);assert.equal(publicEndpoint(path,'GET'),false);}
});
const env={MAIL_PROVIDER:'brevo',BREVO_API_KEY:'synthetic-key',BREVO_FROM_EMAIL:'sender@example.invalid',BREVO_SENDER_VERIFIED:'true',BREVO_FREE_PLAN_CONFIRMED:'true',BREVO_WEBHOOK_TOKEN:'a'.repeat(48),DATA_ENCRYPTION_KEY:'b'.repeat(64)};
test('Brevo requires verified sender, free plan and authenticated delivery reporting',()=>{
 assert.equal(mailConfiguration(env).ready,true);
 for(const key of ['BREVO_API_KEY','BREVO_FROM_EMAIL','BREVO_SENDER_VERIFIED','BREVO_FREE_PLAN_CONFIRMED','BREVO_WEBHOOK_TOKEN','DATA_ENCRYPTION_KEY'])assert.equal(mailConfiguration({...env,[key]:''}).ready,false,key);
 assert.equal(mailConfiguration({...env,MAIL_PROVIDER:'unknown'}).ready,false);
 assert.equal(mailConfiguration({...env,BREVO_FROM_EMAIL:'sender@example.invalid\r\nBcc: other@example.invalid'}).ready,false);
});
test('Brevo IDs are stable namespaced UUIDs without retaining the provider address',()=>{
 const id=brevoProviderId('<synthetic-1@example.invalid>');assert.equal(id,brevoProviderId('synthetic-1@example.invalid'));assert.match(id,/^[a-f0-9-]{36}$/);assert.notEqual(id,brevoProviderId('<synthetic-2@example.invalid>'));assert.throws(()=>brevoProviderId('invalid'));assert.throws(()=>brevoProviderId('x@x\r\n'));
});
test('only authenticated explicit delivery events constitute delivery evidence',()=>{
 assert.equal(brevoWebhookAuthorized('Bearer '+env.BREVO_WEBHOOK_TOKEN,env.BREVO_WEBHOOK_TOKEN),true);assert.equal(brevoWebhookAuthorized('Bearer wrong',env.BREVO_WEBHOOK_TOKEN),false);assert.equal(brevoWebhookAuthorized(null,env.BREVO_WEBHOOK_TOKEN),false);assert.equal(brevoWebhookAuthorized('Bearer a','a'),false);
 const e={event:'delivered','message-id':'<synthetic@example.invalid>',ts_event:1792360000};const result=brevoMailEvent(e);assert.equal(result.status,'delivered');assert.equal(result.providerId,brevoProviderId(e['message-id']));assert.equal(brevoMailEvent({...e,event:'request'}).status,'accepted');assert.equal(brevoMailEvent({...e,event:'opened'}),null);assert.equal(brevoMailEvent({...e,event:'spam'}).status,'complained');assert.throws(()=>brevoMailEvent({...e,ts_event:'invalid'}));assert.equal(result.eventId,brevoMailEvent(e).eventId);
});
import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
import {mailEventKey} from '../src/lib/mail-policy.ts';
function transport(providerResponse,reservation={reserved:true,id:1,status:'sending'}){
 const calls=[];const exports={};
 const client={rpc:async(name,args)=>{calls.push({name,args});return {data:name==='security_reserve_mail'?reservation:{status:args.p_status}};}};
 const context={exports,process:{env},Buffer,AbortSignal,fetch:async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});if(providerResponse instanceof Error)throw providerResponse;return providerResponse;},require:name=>name==='./auth'?{generateAdminUserToken:async()=> 'synthetic-token'}:name==='./postgrest'?{createPostgrestClient:()=>client}:name==='./brevo-mail'?{brevoProviderId,brevoIdempotencyKey}:{mailConfiguration,mailEventKey}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/lib/mail-service.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 return {send:exports.sendTransactionalMail,calls};
}
const message={to:'customer@example.invalid',subject:'Synthetic invitation',html:'<p>Synthetic</p>',text:'Synthetic',purpose:'contract_invitation',event:'synthetic:1'};
test('Brevo transport sends escaped message with idempotency and reply address, recording acceptance separately from delivery',async()=>{
 const t=transport(new Response(JSON.stringify({messageId:'<synthetic@example.invalid>'}),{status:201}));const result=await t.send(message);assert.equal(result.status,'accepted');assert.equal(result.accepted,true);
 const call=t.calls.find(c=>c.url);assert.equal(call.url,'https://api.brevo.com/v3/smtp/email');assert.equal(call.body.replyTo.email,env.BREVO_FROM_EMAIL);assert.equal(call.body.to[0].email,message.to);assert.match(call.body.headers.idempotencyKey,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);assert.equal(call.body.headers.idempotencyKey,brevoIdempotencyKey(mailEventKey(message.event,env.DATA_ENCRYPTION_KEY)));assert.equal(t.calls[0].args.p_event_key,mailEventKey(message.event,env.DATA_ENCRYPTION_KEY));assert.equal(t.calls.at(-1).args.p_provider_id,brevoProviderId('<synthetic@example.invalid>'));assert.equal(t.calls.at(-1).args.p_status,'accepted');
});
test('transport preserves uncertain sends and never resends an already reserved logical event',async()=>{
 const timeout=transport(new Error('Synthetic timeout'));assert.equal((await timeout.send(message)).status,'uncertain');
 const duplicate=transport(new Error('must not call'),{reserved:false,id:1,status:'accepted'});assert.equal((await duplicate.send(message)).accepted,true);assert.equal(duplicate.calls.filter(c=>c.url).length,0);
 const failed=transport(new Response('{}',{status:403}));assert.equal((await failed.send(message)).accepted,false);assert.equal(failed.calls.at(-1).args.p_status,'failed');
});

test('Brevo provider UUID stays stable per logical event while ledger keys remain unchanged',()=>{
 const key=mailEventKey('invoice:synthetic:1',env.DATA_ENCRYPTION_KEY);
 assert.equal(brevoIdempotencyKey(key),brevoIdempotencyKey(key));
 assert.notEqual(brevoIdempotencyKey(key),brevoIdempotencyKey(mailEventKey('invoice:synthetic:2',env.DATA_ENCRYPTION_KEY)));
 assert.notEqual(brevoIdempotencyKey(key),brevoIdempotencyKey(mailEventKey('invoice:synthetic:1','c'.repeat(64))));
 assert.throws(()=>brevoIdempotencyKey('arbitrary-public-input'));
 assert.match(key,/^jd-[a-f0-9]{64}$/);
});
