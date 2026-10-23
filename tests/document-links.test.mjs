import {test} from 'node:test';
import assert from 'node:assert/strict';
import {receiptCapability,verifyReceiptCapability,receiptDocumentUrl} from '../src/lib/document-links.ts';
import {shiftReference,shiftDocumentUrl} from '../src/lib/shift-document.ts';

test('receipt capabilities are stable, scoped and reject tampering and malformed identities',()=>{
 process.env.DOCUMENT_LINK_SECRET='ab'.repeat(32);
 const a=receiptCapability(17), b=receiptCapability(18);
 assert.equal(receiptCapability(17),a);assert.equal(verifyReceiptCapability(a),17);
 assert.equal(verifyReceiptCapability('18.'+a.split('.')[1]),null);
 assert.notEqual(a,b);
 for(const bad of ['0.'+a.split('.')[1], '017.'+a.split('.')[1],a+'x',a.replace(/.$/,a.endsWith('A')?'B':'A'),'9999999999999999.'+a.split('.')[1],'', '../17',a+'?admin=1'])assert.equal(verifyReceiptCapability(bad),null);
 assert.equal(receiptDocumentUrl(17),'https://app.jouww.com/documents/receipts/'+a);
 process.env.DOCUMENT_LINK_SECRET='cd'.repeat(32);assert.equal(verifyReceiptCapability(a),null,'key rotation revokes old capabilities');
 for(const id of [0,-1,NaN,Infinity,1.3,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>receiptCapability(id));
 delete process.env.DOCUMENT_LINK_SECRET;
});
test('document signatures fail closed without key configuration',()=>{
 const key=process.env.DATA_ENCRYPTION_KEY;delete process.env.DATA_ENCRYPTION_KEY;
 assert.throws(()=>receiptCapability(1));if(key)process.env.DATA_ENCRYPTION_KEY=key;
});
test('shift reference is lossless and QR points to the authenticated detail route',()=>{
 for(const id of ['45bf75f8-bae3-4df3-b809-287134548a54','00000000-0000-0000-0000-000000000001','ffffffff-ffff-ffff-ffff-ffffffffffff']){
 const ref=shiftReference(id);assert.match(ref,/^DS-(?:[0-9A-Z]{5}-){4}[0-9A-Z]{5}$/);
 let n=0n;for(const char of ref.slice(3).replaceAll('-',''))n=n*36n+BigInt(parseInt(char,36));
 assert.equal(n.toString(16).padStart(32,'0'),id.replaceAll('-',''));
 assert.equal(shiftDocumentUrl(id),`https://app.jouww.com/driver/shifts?id=${id}`);
 }
 assert.throws(()=>shiftReference('../other'));assert.throws(()=>shiftDocumentUrl('invalid'));
});

test('driver QR survives login without allowing open redirects or arbitrary query state',async()=>{
 const {driverReturnPath}=await import('../src/lib/driver-return-path.ts');
 const path='/driver/shifts?id=45bf75f8-bae3-4df3-b809-287134548a54';
 assert.equal(driverReturnPath(path),path);
 for(const path of ['https://evil.invalid','//evil.invalid','/driver/shifts/../../admin','/admin/companies','javascript:alert(1)'])assert.equal(driverReturnPath(path),'/driver/taximeter');
 assert.equal(driverReturnPath('/driver/shifts?id=invalid&token=secret'),'/driver/shifts');
 assert.equal(driverReturnPath('/driver/trips?secret=x'),'/driver/trips');
});
