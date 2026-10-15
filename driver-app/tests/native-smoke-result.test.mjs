import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {spawnSync} from 'node:child_process';
function fixture(id,{failWrite=false}={}){
 const calls=[];const db={execAsync:async sql=>calls.push(['schema',sql]),runAsync:async(...args)=>{calls.push(['write',...args]);if(failWrite)throw Error('storage failed');},closeAsync:async()=>calls.push(['close'])};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/native-smoke-result.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>({openDatabaseAsync:async name=>{calls.push(['open',name]);return db;}}),process:{env:{EXPO_PUBLIC_NATIVE_SMOKE_ID:id}},Error});return{...exports,calls};
}
test('regular builds never open a diagnostic database',async()=>{for(const id of [undefined,'','not-a-run','12-3-other']){const f=fixture(id);await f.recordNativeCryptoResult('passed');assert.equal(f.calls.length,0);}});
test('simulator records only fixed status and current ID; storage is closed on write failure',async()=>{const f=fixture('123-2');await f.recordNativeCryptoResult('passed');assert.equal(f.calls[0][1],'native-crypto-smoke.db');assert.deepEqual(Array.from(f.calls[2]),['write','INSERT OR REPLACE INTO native_crypto_smoke(probe_id,version,status) VALUES(?,1,?)','123-2','passed']);assert.equal(f.calls[3][0],'close');const failed=fixture('123-2',{failWrite:true});await assert.rejects(failed.recordNativeCryptoResult('failed'));assert.equal(failed.calls.at(-1)[0],'close');await assert.rejects(f.recordNativeCryptoResult('raw secret'));});
test('verifier refuses stale, failed, missing or ambiguous records',()=>{const r=spawnSync('python3',[new URL('../scripts/test-native-crypto-result.py',import.meta.url).pathname],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);});
