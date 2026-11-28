import test from 'node:test';
import assert from 'node:assert/strict';
import {accountExportPdf} from '../src/lib/account-export-pdf.ts';
import {memberEndpoint,publicEndpoint} from '../src/lib/security-policy.ts';

test('account export and road reports cannot be downloaded anonymously',()=>{
 const pdf='/next_api/gdpr/export/pdf';
 const road='/next_api/drivers/road-reports';
 for(const role of ['driver','manager','owner','company','distributor']) assert.ok(memberEndpoint(pdf,'GET',role));
 assert.ok(!publicEndpoint(pdf,'GET'));
 assert.ok(!memberEndpoint(pdf,'POST','driver'));
 assert.ok(!publicEndpoint(road,'GET')&&!publicEndpoint(road,'POST'));
 assert.ok(memberEndpoint(road,'POST','driver')&&!memberEndpoint(road,'POST','company'));
});

test('account PDF uses Unicode fonts and paginates large records',()=>{
 const trips=Array.from({length:42},(_,index)=>({id:index+1,start_time:'2026-11-28T10:04:28Z',status:'completed'}));
 for(const locale of ['ar','fr','nl']){
  const pdf=accountExportPdf(locale,new Date('2026-11-28T10:04:28Z'),[53,'demo@example.invalid','driver','سائق تجريبي'],trips,[],[]);
  const text=Buffer.from(pdf).toString('latin1');
  assert.ok(text.startsWith('%PDF-'));
  assert.match(text,/\/FontFile2/);
  assert.match(text,/\/Count [3-9]/);
 }
});
