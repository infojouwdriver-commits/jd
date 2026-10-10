import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contractSql,auditSql} from '../scripts/independent-schema.mjs';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
test('independent schema preserves legacy orphans, blocks new invalid writes and validates repaired references',async()=>{
 const db=new PGlite();await db.waitReady;
 try {
  await db.exec(fs.readFileSync(new URL('../schema/reconstructed-staging.sql',import.meta.url),'utf8'));
  await db.exec("INSERT INTO companies(id,name) VALUES(1,'Synthetic'),(2,'Other'); INSERT INTO users(id) VALUES(1); INSERT INTO vehicles(id,company_id) VALUES(1,1),(2,2); INSERT INTO drivers(id,user_id,company_id) VALUES(1,1,1); INSERT INTO trips(id,user_id,driver_id,vehicle_id,company_id,status) VALUES(1,999,1,1,1,'legacy');");
  await db.exec(contractSql('public'));
  assert.equal((await db.query('SELECT count(*)::int AS n FROM trips')).rows[0].n,1);
  assert.equal((await db.query('SELECT independent_schema_ready() AS ready')).rows[0].ready,false);
  let report=(await db.query(auditSql('public'))).rows[0].report;
  assert.equal(report.passed,false);assert.equal(report.findings.find(f=>f.check==='trips.user_id -> users').invalidRows,1);
  await assert.rejects(db.exec("INSERT INTO trips(user_id,driver_id,vehicle_id,company_id,status) VALUES(999,1,1,1,'legacy')"));
  await assert.rejects(db.exec("INSERT INTO trips(user_id,driver_id,vehicle_id,company_id,start_lat) VALUES(1,1,1,1,91)"));
  await assert.rejects(db.exec("INSERT INTO trips(user_id,driver_id,vehicle_id,company_id) VALUES(1,1,2,1)"));
  await assert.rejects(db.exec(contractSql('public',{validate:true})));await db.exec('ROLLBACK');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM trips')).rows[0].n,1);
  // Explicit synthetic repair, not an automatic record deletion or fabricated production identity.
  await db.exec('UPDATE trips SET user_id=1 WHERE id=1');
  await db.exec(contractSql('public',{validate:true}));
  assert.equal((await db.query('SELECT independent_schema_ready() AS ready')).rows[0].ready,true);
  report=(await db.query(auditSql('public'))).rows[0].report;assert.equal(report.passed,true);
  await db.exec("INSERT INTO users(id,user_type) VALUES(2,'manager'); INSERT INTO trips(user_id,driver_id,vehicle_id,company_id,status) VALUES(2,1,1,1,'legacy');");
  assert.equal((await db.query(auditSql('public'))).rows[0].report.passed,true);
  await assert.rejects(db.exec('DELETE FROM users WHERE id=1'));
  await db.exec(contractSql('public',{validate:true}));
 } finally {await db.close();}
});
