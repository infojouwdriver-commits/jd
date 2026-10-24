import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const workflow=fs.readFileSync('.github/workflows/publish-contract-signing.yml','utf8');
test('contract update pins tested source and exact image with recent encrypted restore and narrow additive migration',()=>{
 for(const fragment of ["refs/heads/main",'release-domain-candidate.yml','verify-domain-image.yml','backup-foundation.yml',"checks / native-database",'candidate-native-proof.json','20261024_contract_email_signing.sql','CONTRACT_MIGRATION_SHA','independent_schema_ready','has_function_privilege',"NOTIFY pgrst",'preserved.sha256','readonlyrootfs','email contract']){
 assert.ok(workflow.toLowerCase().includes(fragment.toLowerCase()),fragment);
 }
 assert.ok(!workflow.includes('native_run'));assert.ok(!workflow.includes("compose stop"));assert.ok(!workflow.includes('down --volumes'));assert.ok(workflow.includes('up -d --no-deps --wait'));assert.ok(workflow.includes('cleanup'));
});
