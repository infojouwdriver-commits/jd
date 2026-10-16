import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const ids=['684778fa-9fd4-4a31-aa18-a44df9d97bd1','684778fa-9fd4-4a31-aa18-a44df9d97bd2'];
const sql=fs.readFileSync(new URL('../migrations/20261016_native_push.sql',import.meta.url),'utf8').replaceAll(':"schema"','public').replaceAll(':"user_role"','browser').replaceAll(':"admin_role"','service');
async function setup(){const db=new PGlite();await db.waitReady;await db.exec(`CREATE ROLE browser;CREATE ROLE service;
 CREATE TABLE users(id bigint PRIMARY KEY,security_revoked_before timestamptz);
 CREATE TABLE drivers(id bigint PRIMARY KEY,user_id bigint,company_id bigint,status text);
 CREATE TABLE notifications(id bigint PRIMARY KEY,is_active boolean,target_company_id bigint,target_audience text,scheduled_at timestamptz,expires_at timestamptz);
 CREATE TABLE internal_messages(id bigint PRIMARY KEY);
 CREATE TABLE message_recipients(id bigint PRIMARY KEY,message_id bigint,recipient_user_id bigint,is_deleted boolean,is_read boolean);
 INSERT INTO users(id) VALUES(101),(102);INSERT INTO drivers VALUES(1,101,1,'active'),(2,102,2,'active');GRANT USAGE ON SCHEMA public TO service;`);await db.exec(sql);return db;}
const register=(db,user,id,hash,enabled=true,issued=Math.floor(Date.now()/1000)+1)=>db.query("SELECT security_push_device($1,$2,$3,'enc:v1:test','ar',$4,$5) AS data",[user,id,hash.repeat(64),enabled,issued]);
const claim=async db=>(await db.query('SELECT security_claim_native_push() AS jobs')).rows[0].jobs;
test('transactional push delivery, tenant isolation, revoked sessions and migration reruns',async()=>{const db=await setup();try{
 await register(db,101,ids[0],'a');await register(db,102,ids[1],'b');
 await db.exec("INSERT INTO notifications VALUES(1,true,1,'specific_company',NULL,NULL)");
 let jobs=await claim(db);assert.equal(jobs.length,1);assert.equal(jobs[0].user_id,101);assert.equal(jobs[0].authorized,true);
 await db.query("SELECT security_finish_native_push($1,$2,'accepted','projects/jouw-driver/messages/test',false)",[jobs[0].id,jobs[0].lease_id]);
 const receipt=(await db.query('SELECT state,accepted_at,received_at FROM native_push_jobs')).rows[0];assert.equal(receipt.state,'accepted');assert.ok(receipt.accepted_at);assert.equal(receipt.received_at,null);assert.equal((await claim(db)).length,0);
 await db.exec("INSERT INTO internal_messages VALUES(10);INSERT INTO message_recipients VALUES(1,10,102,false,false)");
 await db.exec("UPDATE users SET security_revoked_before=clock_timestamp() WHERE id=102");jobs=await claim(db);assert.equal(jobs[0].authorized,false);
 await assert.rejects(register(db,102,ids[1],'b',true,1),/Session revoked/);
 await register(db,101,ids[0],'a',false);await db.exec("INSERT INTO notifications VALUES(2,true,NULL,'all_drivers',NULL,NULL)");
 jobs=await claim(db);assert.equal(jobs.some(j=>j.user_id===101),false);
 await db.exec(sql);assert.ok((await db.query('SELECT count(*)::int n FROM native_push_jobs')).rows[0].n>=2);
 assert.equal((await db.query("SELECT has_table_privilege('browser','native_push_devices','SELECT') allowed")).rows[0].allowed,false);
 assert.equal((await db.query("SELECT has_function_privilege('browser','security_claim_native_push()','EXECUTE') allowed")).rows[0].allowed,false);
 }finally{await db.close();}});
test('device account transfer cancels old delivery and concurrent claims do not duplicate work',async()=>{const db=await setup();try{
 await register(db,101,ids[0],'a');await db.exec("INSERT INTO notifications VALUES(1,true,NULL,'all_drivers',NULL,NULL)");
 await register(db,102,ids[0],'a');let jobs=await claim(db);assert.equal(jobs.length,1);assert.equal(jobs[0].authorized,false);
 await db.exec("INSERT INTO internal_messages VALUES(20);INSERT INTO message_recipients VALUES(2,20,102,false,false)");
 jobs=await claim(db);assert.equal(jobs.length,1);assert.equal(jobs[0].authorized,true);assert.equal((await claim(db)).length,0);
 await db.query("SELECT security_finish_native_push($1,$2,'failed',NULL,true)",[jobs[0].id,jobs[0].lease_id]);assert.equal((await db.query('SELECT enabled FROM native_push_devices')).rows[0].enabled,false);
 }finally{await db.close();}});

test('optional account flags are respected when present but are not required by the live schema',async()=>{const db=await setup();try{
 await db.exec("ALTER TABLE users ADD COLUMN is_active boolean;ALTER TABLE users ADD COLUMN status text;");
 await db.exec("UPDATE users SET is_active=false WHERE id=101");await assert.rejects(register(db,101,ids[0],'a'),/Driver unavailable/);
 await db.exec("UPDATE users SET is_active=true,status='disabled' WHERE id=101");await assert.rejects(register(db,101,ids[0],'a'),/Driver unavailable/);
 await db.exec("UPDATE users SET status=NULL WHERE id=101");await register(db,101,ids[0],'a');
 await db.exec("INSERT INTO notifications VALUES(1,true,NULL,'all_drivers',NULL,NULL);UPDATE users SET is_active=false WHERE id=101");assert.equal((await claim(db))[0].authorized,false);
 }finally{await db.close();}});
