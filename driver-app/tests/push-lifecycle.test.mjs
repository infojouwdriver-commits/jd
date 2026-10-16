import test from 'node:test';import assert from 'node:assert/strict';
import {serialPushRegistration,pushDestination,registerPushStopper,stopPushRuntime} from '../src/push-lifecycle.ts';
test('logout waits for in-flight registration before disabling the device',async()=>{
 const queue=serialPushRegistration(),events=[];let started;const startedPromise=new Promise(r=>started=r);let release;const gate=new Promise(r=>{release=r;});
 const registering=queue.run(async()=>{events.push('registering');started();await gate;events.push('registered');});
 await startedPromise;const stopping=queue.stop(async()=>{events.push('revoked');});
 release();await Promise.all([registering,stopping]);assert.deepEqual(events,['registering','registered','revoked']);
 await queue.run(async()=>events.push('late'));assert.equal(events.includes('late'),false);
});
test('disposed registration cannot write after fetching a token',async()=>{
 const queue=serialPushRegistration();let finish;const gate=new Promise(r=>finish=r);let wrote=false;
 const pending=queue.run(async current=>{await gate;if(current())wrote=true;});await Promise.resolve();queue.dispose();finish();await pending;assert.equal(wrote,false);
});
test('push navigation only accepts known app screens and well-formed job IDs',()=>{
 const job_id='684778fa-9fd4-4a31-aa18-a44df9d97bd1';assert.equal(pushDestination({job_id,screen:'messages'}),'/messages');
 assert.equal(pushDestination({job_id,screen:'https://attacker.example'}),null);assert.equal(pushDestination({screen:'messages'}),null);
});
test('old unmount cannot unregister the newer session stopper',async()=>{
 const old=registerPushStopper(async()=>{throw Error('wrong account');});let stopped=false;
 const current=registerPushStopper(async()=>{stopped=true;});old();await stopPushRuntime();assert.equal(stopped,true);current();
});
