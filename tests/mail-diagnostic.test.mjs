import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const workflow=fs.readFileSync(new URL('../.github/workflows/diagnose-mail.yml',import.meta.url),'utf8');
const source=workflow.split("<<'DIAGNOSE'\n")[1].split('\n          DIAGNOSE')[0].replace("import {createHmac,randomUUID} from 'node:crypto';","const {createHmac,randomUUID}=await import('node:crypto');");
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function run(status){
 const calls=[],output=[],process={env:{MAIL_PROVIDER:'brevo',BREVO_FROM_EMAIL:'jouw2023@gmail.com',BREVO_API_KEY:'private-api-key',POSTGREST_URL:'http://postgrest:3000',POSTGREST_SCHEMA:'public',SCHEMA_ADMIN_USER:'jouw_service',JWT_SECRET:'private-signing-key'}};
 const fetch=async(url,options)=>{calls.push({url,options});if(url.startsWith('http://postgrest:3000'))return Response.json([]);return Response.json(status===201?{messageId:'private-message-id'}:{code:'invalid_parameter',message:'idempotencyKey invalid private-data'}, {status});};
 await new AsyncFunction('fetch','process','console',source)(fetch,process,{log:x=>output.push(x),error:x=>output.push(x)});
 return {calls,output,process};
}
test('mail diagnostic only reads bounded metadata and uses sandbox for each provider request',async()=>{
 const {calls,output,process}=await run(400);
 assert.equal(process.exitCode,undefined);
 assert.equal(calls.length,4);
 for(const {url,options} of calls){
  if(url.startsWith('http://postgrest:3000')){assert.equal(options.method,undefined);assert.match(url,/limit=10$/);assert.doesNotMatch(url,/recipient|event_key|select=\*/);}
  else {assert.equal(url,'https://api.brevo.com/v3/smtp/email');const body=JSON.parse(options.body);assert.equal(body.headers['X-Sib-Sandbox'],'drop');assert.deepEqual(body.to,[{email:'jouw2023@gmail.com'}]);assert.equal(body.attachment,undefined);}
 }
 assert.match(JSON.parse(calls[3].options.body).headers.idempotencyKey,/^[a-f0-9-]{36}$/);
 assert.doesNotMatch(output.join(''),/private-/);
 assert.equal(JSON.parse(output[1]).category,'idempotency');
});
test('accepted sandbox does not trigger another send or claim actual delivery',async()=>{
 const {calls,output}=await run(201);
 assert.equal(calls.length,3);
 assert.equal(JSON.parse(output[1]).sandbox,true);
 assert.equal(JSON.parse(output[1]).accepted,true);
 assert.doesNotMatch(output.join(''),/private-message-id|delivered/);
 assert.match(workflow,/if: github.ref == 'refs\/heads\/main'/);
 assert.match(workflow,/StrictHostKeyChecking=yes/);
});
