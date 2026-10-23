import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as links from '../src/lib/document-links.ts';

function fixture(){
 const snapshot={document_number:'TRIP-7',trip:{price:18.4},company:{name:'Original company'}};
 let reads=0,rendered,limit=null,error=null,row={receipt_snapshot:snapshot};
 const exports={};
 const dependencies={
  '@/lib/document-links':links,
  '@/lib/auth':{generateAdminUserToken:async()=>'synthetic-service'},
  '@/lib/postgrest':{createPostgrestClient:()=>({from:table=>{assert.equal(table,'invoices');return {select:columns=>{assert.equal(columns,'receipt_snapshot');return {eq:(column,id)=>{reads++;assert.equal(column,'id');assert.equal(id,7);return {maybeSingle:async()=>({data:row,error})};}};}};}})},
  '@/lib/rate-limit':{rateLimit:async()=>limit},
  '@/legal/vervoerbewijs':{generateVervoerbewijs:data=>{rendered=data;return {};},getVervoerbewijsArrayBuffer:()=>Buffer.from('%PDF-synthetic')},
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/app/documents/receipts/[token]/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Response,Buffer,require:name=>{if(!dependencies[name])throw Error(name);return dependencies[name];}});
 return {snapshot,get:token=>exports.GET({}, {params:Promise.resolve({token})}),reads:()=>reads,rendered:()=>rendered,missing:()=>{row=null;},unavailable:()=>{error={code:'offline'};},limit:()=>{limit=new Response('Limited',{status:429});}};
}
test('anonymous receipt scan renders only the saved invoice snapshot; no ledger writes or current profile reads',async()=>{
 process.env.DOCUMENT_LINK_SECRET='ab'.repeat(32);
 const f=fixture(),before=JSON.stringify(f.snapshot),token=links.receiptCapability(7);
 const response=await f.get(token);assert.equal(response.status,200);assert.equal(await response.text(),'%PDF-synthetic');
 assert.equal(f.reads(),1);assert.equal(f.rendered().company.name,'Original company');assert.equal(f.rendered().trip.price,18.4);assert.equal(f.rendered().document_url,links.receiptDocumentUrl(7));assert.equal(JSON.stringify(f.snapshot),before);
 for(const name of ['cache-control','referrer-policy','x-robots-tag','x-content-type-options'])assert.ok(response.headers.get(name));
 assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('content-type'),'application/pdf');
 const forged=await f.get('8.'+token.split('.')[1]);assert.equal(forged.status,404);assert.equal(f.reads(),1,'invalid capability never reaches invoice storage');
 f.missing();assert.equal((await f.get(token)).status,404,'legacy or absent snapshots are not reconstructed');
 delete process.env.DOCUMENT_LINK_SECRET;
});
test('receipt delivery fails closed during rate limits, configuration and storage failures',async()=>{
 process.env.DOCUMENT_LINK_SECRET='ab'.repeat(32);const token=links.receiptCapability(7);
 const f=fixture();f.limit();assert.equal((await f.get(token)).status,429);assert.equal(f.reads(),0);
 const g=fixture();g.unavailable();assert.equal((await g.get(token)).status,503);assert.equal(g.rendered(),undefined);
 delete process.env.DOCUMENT_LINK_SECRET;const key=process.env.DATA_ENCRYPTION_KEY;delete process.env.DATA_ENCRYPTION_KEY;
 const h=fixture();assert.equal((await h.get(token)).status,503);assert.equal(h.reads(),0);if(key)process.env.DATA_ENCRYPTION_KEY=key;
});
