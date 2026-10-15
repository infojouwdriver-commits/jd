import test from 'node:test';
import assert from 'node:assert/strict';
import {createDriverApi,API_ORIGIN} from '../src/api.ts';
const ok=data=>Response.json({success:true,data});
const profile={native_trip_contract_version:1,driver:{id:1,company_id:2,current_vehicle_id:3,status:'active'},company:{id:2,chiron_mode:'PRODUCTION'}};
test('inbox, receipt and account operations reject account switches before reading/writing',async()=>{
 for(const operation of [a=>a.messages(1),a=>a.notifications(1),a=>a.readMessage(1,9),a=>a.readNotification(1,9),a=>a.replies(1,9),a=>a.sendMessage(1,'subject','body'),a=>a.changeAccount(1,{action:'update_password',current_password:'synthetic',password:'synthetic-new-password'}),a=>a.invoice(1,9)]){
 const calls=[];const api=createDriverApi(async url=>{calls.push(url);return ok({...profile,driver:{...profile.driver,id:2}});});await assert.rejects(operation(api));assert.equal(calls.length,1);assert.ok(calls[0].endsWith('/drivers/me'));}
});
test('messaging derives sender at server, replies to explicit parent and never automatically retries writes',async()=>{
 const calls=[];const api=createDriverApi(async(url,options)=>{calls.push({url,options});return ok(url.endsWith('/drivers/me')?profile:{id:9});});
 await api.sendMessage(1,'  Vehicle question  ',' Synthetic body ');let sent=calls.at(-1);assert.equal(sent.url,API_ORIGIN+'/next_api/messages');assert.deepEqual(JSON.parse(sent.options.body),{subject:'Vehicle question',message_body:'Synthetic body'});assert.equal(sent.options.credentials,'include');
 await api.sendMessage(1,'',' Reply ',9);sent=calls.at(-1);assert.deepEqual(JSON.parse(sent.options.body),{parent_message_id:9,reply_body:'Reply'});
 let writes=0;const bad=createDriverApi(async url=>{if(url.endsWith('/drivers/me'))return ok(profile);writes++;return Response.json({}, {status:503});});await assert.rejects(bad.sendMessage(1,'question','body'));assert.equal(writes,1);
});
test('receipt accepts authenticated PDF only, not HTML or raw provider errors',async()=>{
 for(const response of [new Response('<html>login</html>',{headers:{'content-type':'text/html'}}),new Response('secret provider error',{headers:{'content-type':'application/pdf'}}),new Response('%PDF-1.7 synthetic',{headers:{'content-type':'application/pdf','content-length':'8000001'}})]){
 const api=createDriverApi(async url=>url.endsWith('/drivers/me')?ok(profile):response);await assert.rejects(api.invoice(1,7));}
 const calls=[];const api=createDriverApi(async(url,options)=>{calls.push({url,options});return url.endsWith('/drivers/me')?ok(profile):new Response('%PDF-1.7 synthetic',{headers:{'content-type':'application/pdf'}});});assert.equal(new TextDecoder().decode(await api.invoice(1,7)),'%PDF-1.7 synthetic');const request=calls.at(-1);assert.equal(request.url,API_ORIGIN+'/next_api/trips/generate-invoice?id=7');assert.equal(request.options.method,'POST');assert.equal(request.options.credentials,'include');assert.equal(request.options.redirect,'error');assert.equal(request.options.headers.Origin,API_ORIGIN);await assert.rejects(api.invoice(1,-1));await assert.rejects(api.invoice(1,NaN));
});
test('notification read failures propagate instead of confirming read state',async()=>{let writes=0;const api=createDriverApi(async url=>{if(url.endsWith('/drivers/me'))return ok(profile);writes++;return Response.json({}, {status:403});});await assert.rejects(api.readNotification(1,4));assert.equal(writes,1);});
