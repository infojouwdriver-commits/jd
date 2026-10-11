import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
test('initial owner RPC denies browser access, advances account sequence and cannot replace an existing installation',async()=>{
 const db=new PGlite();await db.waitReady;
 try{
  await db.exec('CREATE ROLE jouw_service; CREATE ROLE jouw_app_user; CREATE ROLE jouw_gateway; CREATE TABLE public.users(id bigserial PRIMARY KEY,email text,password text,display_name text,role text,user_type text); GRANT USAGE ON SCHEMA public TO jouw_service,jouw_app_user,jouw_gateway; GRANT SELECT,INSERT ON public.users TO jouw_service; GRANT USAGE,SELECT ON SEQUENCE public.users_id_seq TO jouw_service;');
  await db.exec(fs.readFileSync(new URL('../deploy/enroll-initial-owner.sql',import.meta.url),'utf8'));
  const hash='$2b$12$'+'a'.repeat(53);
  await db.exec('SET ROLE jouw_app_user');
  await assert.rejects(db.query('SELECT public.security_enroll_initial_owner($1)',[hash]));
  await db.exec('RESET ROLE; SET ROLE jouw_service');
  await assert.rejects(db.query('SELECT public.security_enroll_initial_owner($1)',['plaintext-is-forbidden']));
  assert.equal((await db.query('SELECT count(*)::int n FROM users')).rows[0].n,0);
  const result=(await db.query('SELECT public.security_enroll_initial_owner($1) AS owner',[hash])).rows[0].owner;
  assert.deepEqual(result,{id:1,email:'jouw2023@gmail.com'});
  assert.equal((await db.query("INSERT INTO users(email) VALUES('synthetic-next@example.invalid') RETURNING id")).rows[0].id,2);
  await assert.rejects(db.query('SELECT public.security_enroll_initial_owner($1)',['$2b$12$'+'b'.repeat(53)]));
  assert.equal((await db.query('SELECT password FROM users WHERE id=1')).rows[0].password,hash);
 }finally{await db.close();}
});
