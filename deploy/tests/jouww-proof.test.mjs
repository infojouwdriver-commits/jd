import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../../.github/workflows/jouww-cutover.yml',import.meta.url),'utf8');
const guard=source.match(/const requiredNativeChecks = [\s\S]*?throw Error\('Exact image\/origin acceptance missing'\);/)[0];
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/jouww-native-proof.json',import.meta.url)));
const run=proof=>vm.runInNewContext(guard,{proof,i:{image:fixture.candidateImage}});
test('complete observed 45-group exact-image proof is accepted',()=>run(structuredClone(fixture)));
test('proof for another image is rejected',()=>assert.throws(()=>run({...fixture,candidateImage:'jd:latest'})));
test('reported total must equal the completed check list',()=>assert.throws(()=>run({...fixture,passed:70})));
test('repeated check cannot substitute for an omitted tenant/auth/restore/origin check',()=>{
  for(const term of ['Gateway database login','Native MFA','Candidate app origin','cross-tenant isolation','Encrypted backup restores','Wrong decryption key']){
    const proof=structuredClone(fixture),index=proof.checks.findIndex(c=>c.includes(term));assert.ok(index>=0);
    proof.checks[index]=proof.checks[0];assert.throws(()=>run(proof));
  }
});
test('missing or malformed proof check lists fail closed',()=>{
  for(const checks of [[],null,'not-a-list'])assert.throws(()=>run({...fixture,checks,passed:0}));
});
