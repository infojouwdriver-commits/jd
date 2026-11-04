import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const migration=readFileSync(new URL('../migrations/20261104_company_tariffs.sql',import.meta.url),'utf8')
 .replaceAll(':"schema"','public').replaceAll(':"admin_role"','tariff_service');
test('tariff migration preserves legacy rows, can be rerun and isolates immutable document data',async()=>{
 const db=new PGlite();await db.waitReady;
 try{
  await db.exec(`CREATE ROLE tariff_service;CREATE ROLE tariff_driver;
   CREATE TABLE companies(id bigint PRIMARY KEY,minimum_fare numeric);INSERT INTO companies VALUES(1,9.25),(2,17);
   CREATE TABLE trips(id bigint PRIMARY KEY,price numeric);INSERT INTO trips VALUES(1,42.50);`);
  await db.exec(migration);await db.exec(migration);
  assert.deepEqual((await db.query('SELECT id,minimum_fare,tariff_profiles,tariff_revision FROM companies ORDER BY id')).rows,[
   {id:1,minimum_fare:'9.25',tariff_profiles:null,tariff_revision:0},{id:2,minimum_fare:'17',tariff_profiles:null,tariff_revision:0}]);
  assert.deepEqual((await db.query('SELECT price,tariff_code,tariff_settings_snapshot FROM trips')).rows,[{price:'42.50',tariff_code:null,tariff_settings_snapshot:null}]);
  await db.exec(`SET ROLE tariff_service;INSERT INTO company_tariff_documents VALUES ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',1,now(),'{}','PDF');`);
  assert.equal((await db.query('SELECT pdf_base64 FROM company_tariff_documents WHERE company_id=1')).rows[0].pdf_base64,'PDF');
  await assert.rejects(db.exec("UPDATE company_tariff_documents SET pdf_base64='replaced'"));
  await db.exec('RESET ROLE;SET ROLE tariff_driver;');
  await assert.rejects(db.query('SELECT * FROM company_tariff_documents'));
 }finally{await db.close();}
});
