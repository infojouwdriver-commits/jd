import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function fixture(send) {
 const exports={};let now=100000;
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/native-fleet-runtime.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date:{now:()=>now},Map,Promise,require:()=>({driverApi:{reportFleet:send}})});
 return {exports,advance:n=>now+=n};
}
test('foreground and background share one request; logout drains it and blocks late callbacks',async()=>{
 let release;let calls=0;const f=fixture(async()=>{calls++;await new Promise(r=>release=r);});
 const first=f.exports.publishFleetPoint(1,{});assert.equal(await f.exports.publishFleetPoint(1,{}),false);
 let stopped=false;const stop=f.exports.stopFleetPublishing(1).then(()=>stopped=true);await Promise.resolve();assert.equal(stopped,false);
 release();assert.equal(await first,true);await stop;f.advance(30000);assert.equal(await f.exports.publishFleetPoint(1,{}),false);assert.equal(calls,1);
 f.exports.resumeFleetPublishing(1);const next=f.exports.publishFleetPoint(1,{});release();await next;assert.equal(calls,2);
});
test('failed fleet delivery is not queued or announced; a fresh later attempt can recover',async()=>{
 let calls=0;const f=fixture(async()=>{calls++;throw Error('offline');});await assert.rejects(f.exports.publishFleetPoint(1,{}));assert.equal(await f.exports.publishFleetPoint(1,{}),false);f.advance(21000);await assert.rejects(f.exports.publishFleetPoint(1,{}));assert.equal(calls,2);
});
