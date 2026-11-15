import assert from 'node:assert/strict';
import test from 'node:test';
import {renderEmail} from '../src/lib/email/renderer.ts';
import {contactEmailDesign,approvalEmailDesign} from '../src/lib/email/operational.ts';
import {contactSubmission,supportEmail,supportPhone,supportWhatsApp} from '../src/lib/public-contact.ts';
import {approvalPath,approvalReturnPath,approvalTarget} from '../src/lib/approval-link.ts';
import {allowContactSubmission} from '../deploy/contact-edge.mjs';

const requestId='f8961732-e001-4869-91fa-42ccf356e6fe';
test('contact support details and all four locales use the branded mail renderer',()=>{
  assert.equal(supportEmail,'jouw2023@gmail.com');
  assert.equal(supportPhone,'+32465555596');
  assert.equal(supportWhatsApp,'https://wa.me/32465555596');
  for(const language of ['fr','nl','ar','en']){
    const input={requestId,language,name:'Test <name>',email:'visitor@example.invalid',topic:'billing',message:'<script>message</script>'};
    const data=contactSubmission.parse(input);
    assert.equal(contactSubmission.safeParse({...input,to:'other@example.invalid'}).success,false);
    assert.equal(contactSubmission.safeParse({...input,name:'Name\nInjected header'}).success,false);
    const {html,text}=renderEmail(contactEmailDesign(data));
    assert.ok(html.includes('&lt;script&gt;message'));
    assert.ok(!html.includes('<script>'));
    assert.ok(text.includes('visitor@example.invalid'));
    assert.ok(html.includes('jouw-driver-logo-v2.png'));
  }
});
test('approval emails contain only review information and return to the exact authenticated request',()=>{
  for(const [source,id] of [['company-registration',requestId],['driver-registration','77'],['company-changes','79'],['general','81']]){
    const design=approvalEmailDesign({source,id,request_key:id,entity:'vehicle',operation:'create',company_name:'Company <Fleet>',submitted_at:'2026-11-15T08:30:00Z',documents:'private'});
    const path=approvalPath(source,id);
    assert.deepEqual(approvalTarget(new URL(design.action.url).searchParams),{tab:source,id});
    assert.equal(approvalReturnPath(path),path);
    const {html,text}=renderEmail(design);
    assert.ok(html.includes('Company &lt;Fleet&gt;'));
    assert.ok(text.includes(path));
    assert.ok(!html.includes('private'));
  }
  for(const path of ['https://example.invalid','//app.jouww.com/admin/approval-requests','/admin/approval-requests?tab=general&request=other'])assert.equal(approvalReturnPath(path),null);
});
test('production ingress adds a single exact same-origin contact path in front of the existing mutation guard',()=>{
  const prefix='app.jouww.com {\n  handle {\n    import jouww_proxy\n  }\n}\n';
  const original=prefix+'jouww.com, www.jouww.com {\n  @unsafe not method GET HEAD\n  handle @unsafe {\n    respond "Method not allowed" 405\n  }\n}\n';
  const result=allowContactSubmission(original);
  assert.ok(result.startsWith(prefix));
  assert.match(result,/path \/contact\/submit\n    method POST/);
  assert.ok(result.indexOf('handle @public_contact')<result.indexOf('handle @unsafe'));
  assert.throws(()=>allowContactSubmission(result));
  assert.throws(()=>allowContactSubmission(prefix));
});

test('contact API validates origin and target, and reports success only after mail acceptance',async()=>{
  const {readFileSync}=await import('node:fs');
  const {runInNewContext}=await import('node:vm');
  const ts=(await import('typescript')).default;
  const source=readFileSync(new URL('../src/app/contact/submit/route.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mail=[];
  let accepted=true;
  const deps={
    'node:crypto':await import('node:crypto'),
    '@/lib/public-contact':{contactSubmission,supportEmail},
    '@/lib/mail-service':{sendTransactionalMail:async input=>{mail.push(input);return {accepted,status:accepted?'accepted':'failed'};}},
    '@/lib/email/operational':{contactEmailDesign},
    '@/lib/rate-limit':{consumeRateLimit:async()=>null},
    '@/lib/api-utils':{getRequestIp:()=> '192.0.2.1'},
  };
  const exports={};
  runInNewContext(code,{exports,require:name=>deps[name],Response,Buffer,process:{env:{NODE_ENV:'production',MAIL_METADATA_KEY:'s'.repeat(64)}}});
  const data={requestId,language:'fr',name:'Test',email:'visitor@example.invalid',topic:'support',message:'Synthetic contact request'};
  const post=async(body,origin='https://jouww.com',host='jouww.com')=>exports.POST({
    headers:new Headers({host,origin,'content-type':'application/json'}),
    text:async()=>JSON.stringify(body),
  });
  assert.equal((await post(data,'https://example.invalid')).status,403);
  assert.equal((await post(data,'https://jouww.com','app.jouww.com')).status,403);
  assert.equal((await post({...data,to:'other@example.invalid'})).status,400);
  assert.equal((await post({...data,website:'bot'})).status,200);
  assert.equal(mail.length,0);
  assert.equal((await post(data)).status,200);
  assert.equal((await post(data)).status,200);
  assert.equal(mail[0].to,supportEmail);
  assert.equal(mail[0].event,mail[1].event);
  accepted=false;
  assert.equal((await post({...data,message:'Different contact message'})).status,503);
  assert.notEqual(mail[1].event,mail[2].event);
});
