import test from 'node:test';import assert from 'node:assert/strict';
import {createDriverApi,ApiError} from '../src/api.ts';
import {pausePushInstallation} from '../src/push-pause.ts';
// Same API error contract used by both report screens.
const ok=data=>Response.json({success:true,data});
test('a missing reporting deployment is a 404, not an offline error or silent partial report',async()=>{
 let calls=0;const api=createDriverApi(async url=>{calls++;return url.endsWith('/drivers/me')?ok({driver:{id:1}}):new Response('<html>missing route</html>',{status:404});});
 await assert.rejects(api.activity(1,{from:'2026-10-01',to:'2026-10-17',platform:'all',status:'all'}),e=>e instanceof ApiError&&e.status===404);assert.equal(calls,2);
});
test('a non-JSON server failure retains a server error rather than claiming offline',async()=>{const api=createDriverApi(async()=>new Response('<html>proxy</html>',{status:200}));await assert.rejects(api.profile(),e=>e instanceof ApiError&&e.status===502);});
test('push pause persists opt-out before revoking only the existing installation',async()=>{
 const calls=[];await pausePushInstallation({set:async(k,v)=>calls.push([k,v]),get:async k=>{calls.push(k);return 'existing-installation';}},async id=>calls.push(['revoke',id]));assert.deepEqual(calls,[['jd-push-opt-in-v1','0'],'jd-push-installation-v1',['revoke','existing-installation']]);
});
test('push pause never creates registration and preserves opt-out when revocation fails',async()=>{let optedOut=false,called=0;await pausePushInstallation({set:async()=>{optedOut=true;},get:async()=>null},async()=>called++);assert.equal(called,0);await assert.rejects(pausePushInstallation({set:async()=>{optedOut=true;},get:async()=> 'existing'},async()=>{throw Error('offline');}));assert.equal(optedOut,true);});
