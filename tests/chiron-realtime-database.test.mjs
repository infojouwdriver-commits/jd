import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';

const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const sql=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8')
 .replaceAll(':"schema"','public').replaceAll(':"admin_role"','test_service').replaceAll(':"user_role"','test_driver');
const start='2026-10-20T12:10:00.123Z',end='2026-10-20T12:20:00.432Z';

test('real-time departure and completion preserve the frozen trip and record shift activity once',async()=>{
 const db=new PGlite();await db.waitReady;
 try {
  await db.exec('CREATE ROLE test_service;CREATE ROLE test_driver;'+sql('schema/reconstructed-staging.sql'));
  await db.exec('GRANT ALL ON ALL TABLES IN SCHEMA public TO test_service;GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO test_service;');
  for (const file of ['20261009_security','20261010_release','20261018_company_lifecycle','20261019_driver_shifts','20261019_shift_activity','20261109_chiron_realtime','20261109_chiron_realtime']) {
   await db.exec(sql('migrations/'+file+'.sql'));
  }
  const shift=randomUUID(),key=randomUUID();
  await db.exec(`INSERT INTO users(id,email) VALUES(1,'synthetic1@example.invalid'),(2,'synthetic2@example.invalid');
   INSERT INTO companies(id,name,chiron_mode) VALUES(1,'Synthetic A','TEST'),(2,'Synthetic B','PRODUCTION');
   INSERT INTO vehicles(id,company_id,plate_number,status) VALUES(1,1,'SYN-1','active'),(2,2,'SYN-2','active');
   INSERT INTO drivers(id,company_id,user_id,full_name,status,current_vehicle_id) VALUES(1,1,1,'Synthetic A','active',1),(2,2,2,'Synthetic B','active',2);
   INSERT INTO driver_shifts(id,driver_id,user_id,company_id,vehicle_id,driver_name,company_name,plate_number,started_at,start_odometer,odometer,work_status)
   VALUES('${shift}',1,1,1,1,'Synthetic A','Synthetic A','SYN-1','2026-10-20T12:00:00Z',10,10,'available');
   INSERT INTO trips(user_id,company_id,driver_id,vehicle_id,status,price,start_time,end_time) VALUES(1,1,1,1,'completed',42,'2026-10-19T08:00Z','2026-10-19T08:10Z');`);
  const departure={driver_id:1,company_id:1,vehicle_id:1,trip_uuid:key,ritnummer:'UBER-'+key,start_time:start,start_lat:50.85012,
   start_lon:4.35012,ride_type:'EXTERNAL',external_source:'UBER',external_ride_number:'synthetic',chiron_environment:'test',
   chiron_sync_state:'CREATED',chiron_sync_attempts:0,chiron_agreed_price:12};
  const arrival={...departure,end_time:end,end_lat:50.85567,end_lon:4.35567,price:19.25,distance_km:3.511,duration_minutes:10,payment_method:'cash',currency:'EUR'};
  const call=async(fn,payload=departure,owner=1,id=key)=>(await db.query(`SELECT ${fn}($1::jsonb,$2::bigint,$3::uuid) data`,[JSON.stringify(payload),owner,id])).rows[0].data;
  const begin=(payload=departure,owner=1,id=key)=>call('security_save_trip_departure',payload,owner,id);
  const finish=(payload=arrival,owner=1)=>call('security_finish_realtime_trip',payload,owner);
  assert.equal((await finish()).conflict,true);
  assert.equal((await begin({...departure,chiron_environment:'production'})).conflict,true);
  assert.equal((await begin({...departure,vehicle_id:2})).conflict,true);
  assert.equal((await begin(departure,2)).conflict,true);
  const first=await begin();
  assert.equal(first.created,true);
  assert.equal(first.trip.shift_id,shift);
  assert.equal((await begin()).trip.id,first.trip.id);
  assert.equal((await begin({...departure,start_lat:50.9})).conflict,true);
  assert.equal((await begin(departure,1,randomUUID())).conflict,true);
  assert.equal((await db.query('SELECT work_status FROM driver_shifts')).rows[0].work_status,'with_passenger');
  await db.query("UPDATE trips SET chiron_sync_state='START_ACCEPTED',chiron_departure_payload='{\"saved\":true}' WHERE id=$1",[first.trip.id]);
  assert.equal((await finish(arrival,2)).conflict,true);
  const completed=await finish({...arrival,start_lat:90,vehicle_id:2,chiron_environment:'production',chiron_sync_state:'COMPLETED'});
  assert.equal(completed.created,true);
  assert.equal(completed.trip.id,first.trip.id);
  assert.equal(completed.trip.chiron_environment,'test');
  assert.equal(completed.trip.chiron_sync_state,'START_ACCEPTED');
  assert.deepEqual(completed.trip.chiron_departure_payload,{saved:true});
  assert.equal(completed.trip.start_lat,50.85012);
  assert.equal(completed.trip.vehicle_id,1);
  assert.equal(completed.trip.ritnummer,first.trip.ritnummer);
  assert.equal(completed.trip.price,19.25);
  assert.equal(completed.trip.chiron_agreed_price,12);
  assert.equal(completed.trip.locked_after_completion,true);
  assert.equal((await finish({...arrival,price:999})).trip.price,19.25);
  assert.equal((await begin({...departure,ritnummer:'another-trip'},1,randomUUID())).conflict,true);
  assert.deepEqual((await db.query("SELECT kind FROM driver_shift_activity WHERE trip_id IS NOT NULL ORDER BY occurred_at")).rows,[{kind:'trip_start'},{kind:'trip_end'}]);
  assert.equal((await db.query('SELECT work_status FROM driver_shifts')).rows[0].work_status,'available');
  assert.deepEqual((await db.query("SELECT chiron_realtime,price FROM trips WHERE start_time<'2026-10-20Z'")).rows,[{chiron_realtime:false,price:'42'}]);
  await db.exec('SET ROLE test_driver');
  await assert.rejects(begin(),/permission denied/);
  await assert.rejects(finish(),/permission denied/);
 } finally {await db.close();}
});
