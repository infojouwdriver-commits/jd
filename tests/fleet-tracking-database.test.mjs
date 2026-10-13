import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const {PGlite}=await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');

async function database(){
 const db=new PGlite();await db.waitReady;
 await db.exec(`CREATE ROLE browser;CREATE ROLE service;
  CREATE TABLE companies(id bigint PRIMARY KEY,name text NOT NULL);
  CREATE TABLE users(id bigint PRIMARY KEY);
  CREATE TABLE vehicles(id bigint PRIMARY KEY,company_id bigint NOT NULL,plate_number text);
  CREATE TABLE drivers(id bigint PRIMARY KEY,user_id bigint NOT NULL,company_id bigint NOT NULL,full_name text NOT NULL,status text,current_vehicle_id bigint,assigned_vehicle_id bigint);
  CREATE TABLE company_users(id bigserial PRIMARY KEY,user_id bigint NOT NULL,company_id bigint NOT NULL,role text);
  CREATE TABLE trips(id bigint PRIMARY KEY,driver_id bigint,status text);
  INSERT INTO companies VALUES(1,'Tenant one'),(2,'Tenant two');
  INSERT INTO users VALUES(10),(20),(101),(102);
  INSERT INTO vehicles VALUES(11,1,'ONE-001'),(22,2,'TWO-002');
  INSERT INTO drivers VALUES(1,101,1,'Driver one','active',11,NULL),(2,102,2,'Driver two','active',22,NULL);
  INSERT INTO company_users(user_id,company_id,role) VALUES(10,1,'manager'),(20,2,'manager');`);
 const sql=fs.readFileSync(new URL('../migrations/20261013_fleet_tracking.sql',import.meta.url),'utf8')
  .replaceAll(':"schema"','public').replaceAll(':"user_role"','browser').replaceAll(':"admin_role"','service');
 await db.exec(sql);return {db,sql};
}

const update=(db,user,shift,share,lat=null,lon=null,accuracy=null,recorded=null)=>db.query(
 'SELECT security_update_driver_fleet_location($1,$2,$3,$4,$5,$6,$7) AS data',
 [user,shift,share,lat,lon,accuracy,recorded]);
const fleet=async(db,actor,admin)=>(await db.query('SELECT security_fleet_locations($1,$2) AS data',[actor,admin])).rows[0].data;

test('fleet view is tenant-scoped while platform admin sees every active driver',async()=>{const {db}=await database();try{
 const now=new Date().toISOString();
 await update(db,101,true,true,50.85,4.35,8,now);await update(db,102,true,true,51.21,4.40,12,now);
 const one=await fleet(db,10,false);assert.deepEqual(one.map(item=>item.driver_id),[1]);assert.equal(one[0].plate_number,'ONE-001');
 const two=await fleet(db,20,false);assert.deepEqual(two.map(item=>item.driver_id),[2]);
 const admin=await fleet(db,999,true);assert.deepEqual(admin.map(item=>item.driver_id),[1,2]);
 }finally{await db.close();}});

test('ending a shift clears coordinates and only the latest point can replace fleet state',async()=>{const {db}=await database();try{
 const now=new Date();await update(db,101,true,true,50.85,4.35,5,now.toISOString());
 await assert.rejects(update(db,101,true,true,50.1,4.1,5,new Date(now.getTime()-1000).toISOString()),/Stale fleet position/);
 const stopped=(await update(db,101,false,true)).rows[0].data;
 assert.equal(stopped.shift_active,false);assert.equal(stopped.sharing_enabled,false);assert.equal(stopped.latitude,null);assert.equal(stopped.recorded_at,null);
 const visible=await fleet(db,10,false);assert.equal(visible[0].work_status,'off_shift');assert.equal(visible[0].latitude,null);
 }finally{await db.close();}});

test('trip status takes precedence and storage is private from browser role',async()=>{const {db,sql}=await database();try{
 await update(db,101,true,true,50.85,4.35,6,new Date().toISOString());await db.exec("INSERT INTO trips VALUES(90,1,'in_progress')");
 assert.equal((await fleet(db,10,false))[0].work_status,'on_trip');
 assert.equal((await db.query("SELECT has_table_privilege('browser','driver_fleet_locations','SELECT') AS allowed")).rows[0].allowed,false);
 assert.equal((await db.query("SELECT has_function_privilege('browser','security_fleet_locations(bigint,boolean)','EXECUTE') AS allowed")).rows[0].allowed,false);
 await db.exec(sql);assert.equal((await db.query('SELECT count(*)::int AS count FROM driver_fleet_locations')).rows[0].count,1);
 }finally{await db.close();}});
