import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const {PGlite}=await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const migration=readFileSync(new URL('../migrations/20261128_road_reports.sql',import.meta.url),'utf8')
 .replaceAll(':"schema"','public').replaceAll(':"admin_role"','service').replaceAll(':"user_role"','browser');

test('road reports deduplicate, protect writes, expire by vote and retain airport notices',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`
   CREATE ROLE browser;
   CREATE ROLE service;
   CREATE TABLE users(id bigint PRIMARY KEY,is_active boolean);
   CREATE TABLE drivers(user_id bigint,archived_at timestamptz);
   INSERT INTO users VALUES(1,true),(2,true),(3,true),(4,false);
   INSERT INTO drivers VALUES(1,NULL),(2,NULL),(3,NULL),(4,NULL);
  `);
  await db.exec(migration);
  await db.exec(migration);
  assert.equal((await db.query("SELECT has_table_privilege('browser','road_reports','SELECT') AS allowed")).rows[0].allowed,false);
  await assert.rejects(db.query("SELECT road_report_command(4,'closure',50.85,4.35,NULL,NULL)"),/Active driver required/);
  const submit=actor=>db.query('SELECT road_report_command($1,\'closure\',50.85,4.35,NULL,NULL) AS id',[actor]);
  const [{id}]=(await submit(1)).rows;
  assert.equal((await submit(2)).rows[0].id,id);
  const vote=actor=>db.query('SELECT road_report_command($1,NULL,50.85,4.35,$2,false)',[actor,id]);
  await vote(2);
  await vote(2);
  assert.equal((await db.query('SELECT count(*) AS count FROM road_reports WHERE expires_at>now()')).rows[0].count,1);
  await vote(3);
  assert.equal((await db.query('SELECT count(*) AS count FROM road_reports WHERE expires_at>now()')).rows[0].count,0);
  await db.query("SELECT road_report_command(1,'congestion',50.85,4.35,NULL,NULL)");
  assert.equal((await db.query("SELECT count(*) AS count FROM road_reports WHERE kind='congestion' AND expires_at>now()")).rows[0].count,1);
  await db.query("INSERT INTO airport_road_notices(kind,detail,expires_at) VALUES('meeting_changed','Parking P1',now()+interval '1 hour')");
  assert.equal((await db.query('SELECT kind FROM airport_road_notices')).rows[0].kind,'meeting_changed');
 }finally{await db.close();}
});
