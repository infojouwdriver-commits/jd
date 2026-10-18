import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {contractPeriod,contractFee,contractIsImmutable,todayInBrussels} from '../src/lib/contract-terms.ts';
const style={}, template={};
function compile(file, context) {
  const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
}
compile('../src/lib/contract-document-style.ts',{exports:style});
compile('../src/lib/contract-template.ts',{exports:template,require:name=>{assert.equal(name,'./contract-document-style');return style;}});
const {generateContractHTML}=template;

test('contract periods clamp to the last valid calendar day, including leap years', () => {
  assert.equal(todayInBrussels(new Date('2026-10-12T22:10:00Z')),'2026-10-13');
  assert.equal(contractPeriod('2026-01-31',1).endDate,'2026-02-28');
  assert.equal(contractPeriod('2024-01-31',1).endDate,'2024-02-29');
  assert.equal(contractPeriod('2026-12-31',12).endDate,'2027-12-31');
  for (const args of [['2026-02-30',12],['invalid',12],['2026-01-01',0],['2026-01-01',1.5],['2026-01-01',true]]) assert.throws(()=>contractPeriod(...args));
});
test('subscription fees are derived in cents and a free contract remains valid', () => {
  assert.deepEqual(contractFee(99.95),{monthlyFee:99.95,annualFee:1199.4});
  assert.deepEqual(contractFee(0),{monthlyFee:0,annualFee:0});
  for (const value of [null,'',-1,Infinity,99.999]) assert.throws(()=>contractFee(value));
});
test('signed and finalized documents remain immutable even after suspension', () => {
  assert.equal(contractIsImmutable({contract_status:'pending_signature'}),false);
  for (const contract of [{contract_status:'active'},{contract_status:'suspended'},{contract_status:'cancelled'},{contract_status:'pending_signature',signed_at:'2026-01-01'}]) assert.equal(contractIsImmutable(contract),true);
});
test('document generation escapes customer text and preserves literal replacement characters', () => {
  const data={contractNumber:'TEST-$&',companyName:'شركة <script>unsafe</script> & Co $&',companyVAT:'BE0000000000',companyKBO:'0000000000',startDate:'2026-01-31',endDate:'2027-01-31',monthlyFee:99.95,annualFee:1199.4,durationMonths:12};
  for (const language of ['nl','fr']) {
    const html=generateContractHTML({...data,language});
    assert.ok(html.includes('TEST-$&amp;'));
    assert.ok(html.includes('&lt;script&gt;unsafe&lt;/script&gt; &amp; Co $&amp;'));
    assert.equal(html.includes('<script>'),false);
    assert.ok(html.includes('contract-document'));
    assert.ok(html.includes('size:A4'));
    assert.equal(html.includes('radial-gradient'),false);
    assert.equal(/{{[A-Z_]+}}/.test(html),false);
    assert.ok(html.includes('99.95'));
  }
});

test('new annual gross contracts state the monthly VAT split and have no automatic renewal clause',()=>{for(const language of ['fr','nl']){const html=generateContractHTML({contractNumber:'SYN-50',companyName:'Synthetic Company',companyVAT:'BE0123456789',companyKBO:'0123456789',startDate:'2026-01-31',endDate:'2027-01-31',durationMonths:12,monthlyFee:50,annualFee:600,language,grossBilling:{vatBps:2100,autoRenew:false}});assert.ok(html.includes('41.32'));assert.ok(html.includes('8.68'));assert.ok(html.includes('600.00'));assert.ok(html.includes(language==='fr'?'Pas de renouvellement automatique':'Geen automatische verlenging'));assert.equal(html.includes(language==='fr'?'tacitement':'stilzwijgend'),false);}});
