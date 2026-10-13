import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const key=n=>'jd-'+String(n).padStart(64,'0');
async function database(){const db=new PGlite();await db.waitReady;await db.exec('CREATE ROLE browser;CREATE ROLE service;');const sql=fs.readFileSync(new URL('../migrations/20261013_mail_delivery.sql',import.meta.url),'utf8').replaceAll(':"schema"','public').replaceAll(':"user_role"','browser').replaceAll(':"admin_role"','service');await db.exec(sql);return {db,sql};}
async function reserve(db,event=1,recipient=2){return (await db.query('SELECT security_reserve_mail($1,$2,$3) AS data',[key(event),key(recipient),'verification'])).rows[0].data;}
test('mail reservations are idempotent, private and capped before provider requests',async()=>{const {db,sql}=await database();try{
 const first=await reserve(db);assert.equal(first.reserved,true);assert.equal((await reserve(db)).reserved,false);
 assert.equal((await db.query("SELECT has_function_privilege('browser','security_reserve_mail(text,text,text)','EXECUTE') AS allowed")).rows[0].allowed,false);
 assert.equal((await db.query("SELECT has_table_privilege('browser','mail_deliveries','SELECT') AS allowed")).rows[0].allowed,false);
 for(let i=2;i<=90;i++)assert.equal((await reserve(db,i)).reserved,true);
 assert.equal((await reserve(db,91)).status,'quota_exceeded');await db.exec(sql);assert.equal((await db.query('SELECT count(*)::int AS count FROM mail_deliveries')).rows[0].count,90);
 }finally{await db.close();}});
test('verified early delivery is reconciled, duplicates ignored and later sent events cannot downgrade proof',async()=>{const {db}=await database();try{
 const r=await reserve(db);const id='00000000-0000-4000-8000-000000000001';
 const event=async(eventId,status,time)=>db.query('SELECT security_record_mail_event($1,$2,$3,$4) AS added',[eventId,id,status,time]);
 assert.equal((await event('synthetic-delivery','delivered','2026-01-01T12:00:00Z')).rows[0].added,true);
 assert.equal((await event('synthetic-delivery','delivered','2026-01-01T12:00:00Z')).rows[0].added,false);
 assert.equal((await db.query('SELECT security_complete_mail($1,$2,$3) AS data',[r.id,'accepted',id])).rows[0].data.status,'delivered');
 await event('synthetic-sent','accepted','2026-01-01T13:00:00Z');assert.equal((await db.query('SELECT status FROM mail_deliveries WHERE id=$1',[r.id])).rows[0].status,'delivered');
 await event('synthetic-complaint','complained','2026-01-01T14:00:00Z');assert.equal((await reserve(db,3)).status,'suppressed');
 }finally{await db.close();}});
