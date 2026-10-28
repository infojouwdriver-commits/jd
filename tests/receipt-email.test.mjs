import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {receiptMessage,receiptAdSchema,receiptSendSchema,receiptEmailHtml} from '../src/lib/receipt-email-model.ts';
import {memberEndpoint} from '../src/lib/security-policy.ts';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const sql=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').replaceAll(':"schema"','public').replaceAll(':"admin_role"','service').replaceAll(':"user_role"','browser');
async function setup(){const db=new PGlite();await db.waitReady;await db.exec('CREATE ROLE browser;CREATE ROLE service;'+sql('schema/reconstructed-staging.sql'));await db.exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;');await db.exec(sql('migrations/20261010_trip_invoice.sql'));await db.exec(sql('migrations/20261013_mail_delivery.sql'));await db.exec(sql('migrations/20261028_receipt_email.sql'));await db.exec("INSERT INTO users(id,email) VALUES(1,'admin@example.invalid'),(2,'driver@example.invalid');INSERT INTO companies(id,name) VALUES(1,'Original Company');INSERT INTO trips(id,user_id,company_id,status,price,end_time) VALUES(1,2,1,'completed',28.60,clock_timestamp());INSERT INTO invoices(id,user_id,company_id,trip_id,invoice_category,invoice_number,status,receipt_snapshot) VALUES(1,2,1,1,'trip','TRIP-1','issued','{\"document_number\":\"TRIP-1\",\"trip\":{\"price\":28.60}}');");return db;}
test('localized optional ad, safe edited text and strict recipient validation',()=>{
 const ad={version:1,enabled:true,text:{ar:'إعلان',fr:'Annonce',nl:'Advertentie'},url:'https://jouww.com'};
 for(const language of ['ar','fr','nl']){const d=receiptMessage(language,'TRIP-1','Original Company',ad);assert.match(d.subject,/TRIP-1/);assert.ok(d.message.includes(ad.text[language]));assert.ok(!receiptMessage(language,'TRIP-1','Original Company',{...ad,enabled:false}).message.includes(ad.text[language]));}
 assert.equal(receiptAdSchema.safeParse({...ad,url:'javascript:alert(1)'}).success,false);
 assert.equal(receiptAdSchema.safeParse({...ad,url:'https://user:pass@evil.invalid'}).success,false);
 assert.equal(receiptSendSchema.safeParse({request_id:randomUUID(),to:'x@example.invalid',subject:'header\r\nBcc:x',message:'hello',language:'fr',settings_version:1}).success,false);
 const html=receiptEmailHtml('<script>x</script> https://jouww.com?a=1&b=2');assert.match(html,/&lt;script&gt;/);assert.match(html,/<a href="https:\/\/jouww.com/);assert.doesNotMatch(html,/<script>/);
 assert.equal(memberEndpoint('/next_api/trips/receipt-email','POST','driver'),true);assert.equal(memberEndpoint('/next_api/receipt-email-settings','PUT','driver'),false);
});
test('receipt email migration preserves invoices, isolates browser access and rejects request mutation or stale settings',async()=>{const db=await setup();try{
 const before=(await db.query('SELECT to_jsonb(i) v FROM invoices i')).rows[0].v;
 assert.equal((await db.query("SELECT has_table_privilege('browser','receipt_email_settings','SELECT') v")).rows[0].v,false);
 assert.equal((await db.query("SELECT has_function_privilege('browser','security_claim_receipt_mail(bigint,bigint,uuid,text,integer)','EXECUTE') v")).rows[0].v,false);
 const id=randomUUID(),digest='jd-'+'a'.repeat(64),claim=(actor=2,d=digest,version=1,key=id)=>db.query('SELECT security_claim_receipt_mail($1,1,$2,$3,$4) v',[actor,key,d,version]);
 assert.equal((await claim()).rows[0].v,true);assert.equal((await claim()).rows[0].v,false);
 await assert.rejects(claim(1),/ownership/);await assert.rejects(claim(2,'jd-'+'b'.repeat(64)),/conflict/);
 const settings={enabled:false,text:{ar:'إعلان',fr:'Annonce',nl:'Advertentie'},url:'https://jouww.com'};
 const saved=(await db.query('SELECT security_save_receipt_email_settings(1,1,$1) v',[settings])).rows[0].v;assert.equal(saved.version,2);assert.equal(saved.enabled,false);
 await assert.rejects(db.query('SELECT security_save_receipt_email_settings(1,1,$1)',[settings]),/changed/);
 assert.equal((await claim()).rows[0].v,false,'An existing uncertain intent can be checked after ad changes');
 await assert.rejects(claim(2,digest,1,randomUUID()),/changed/);
 const reserve=(await db.query("SELECT security_reserve_mail($1,$2,'driver_receipt') v",['jd-'+'1'.repeat(64),'jd-'+'2'.repeat(64)])).rows[0].v;assert.equal(reserve.reserved,true);
 assert.equal((await db.query("SELECT security_reserve_mail($1,$2,'driver_receipt') v",['jd-'+'1'.repeat(64),'jd-'+'2'.repeat(64)])).rows[0].v.reserved,false);
 await db.exec(sql('migrations/20261028_receipt_email.sql'));assert.equal((await db.query('SELECT version FROM receipt_email_settings')).rows[0].version,2);
 assert.deepEqual((await db.query('SELECT to_jsonb(i) v FROM invoices i')).rows[0].v,before);
 assert.equal((await db.query('SELECT count(*)::int n FROM invoices')).rows[0].n,1);
 }finally{await db.close();}});
