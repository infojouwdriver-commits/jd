import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
test('trip invoice is durable, idempotent, preserves historical invoices and rejects unrelated records',async()=>{
 const db=new PGlite(); await db.waitReady;
 try {
 await db.exec(fs.readFileSync(new URL('../schema/reconstructed-staging.sql',import.meta.url),'utf8'));
 await db.exec('CREATE ROLE service_role;CREATE ROLE browser_role;');
 await db.exec(fs.readFileSync(new URL('../migrations/20261010_trip_invoice.sql',import.meta.url),'utf8').replaceAll(':"schema"','public').replaceAll(':"admin_role"','service_role'));
 await db.exec("INSERT INTO companies(id,name) VALUES(1,'Synthetic'),(2,'Other');INSERT INTO drivers(id,user_id,company_id) VALUES(1,10,1);INSERT INTO vehicles(id,company_id) VALUES(1,1),(2,2);INSERT INTO trips(id,user_id,company_id,driver_id,vehicle_id,status,start_time,end_time,price) VALUES(1,10,1,1,1,'completed',now(),now(),12.50),(2,10,1,1,1,'active',now(),NULL,5),(3,10,1,1,2,'completed',now(),now(),5),(4,10,1,1,1,'completed',now(),now(),5);");
 const save=(id=1,user=10,payload={client_name:'Synthetic customer',items:[]})=>db.query('SELECT security_create_trip_invoice($1,$2,$3::jsonb,$4::jsonb) result',[id,user,JSON.stringify(payload),JSON.stringify({document_number:'untrusted',trip:{price:12.50}})]);
 await assert.rejects(save(1,10,{company_id:2}));
 assert.equal((await db.query('SELECT count(*)::int n FROM invoices')).rows[0].n,0,'invalid invoice leaves no partially persisted receipt');
 const first=(await save()).rows[0].result,second=(await save()).rows[0].result;
 const retries=await Promise.all(Array.from({length:8},()=>save()));assert.ok(retries.every(r=>r.rows[0].result.id===first.id));
 assert.equal(first.id,second.id);assert.equal(first.invoice_number,'TRIP-1');assert.equal(first.receipt_snapshot.document_number,'TRIP-1');assert.equal(first.total_tvac,12.50);assert.equal(first.total_htva,11.79);assert.equal(first.structured_reference,'+++000/0000/00101+++');
 assert.equal((await db.query('SELECT count(*)::int n FROM invoices')).rows[0].n,1);
 await assert.rejects(save(1,11));await assert.rejects(save(2));await assert.rejects(save(3));
 await db.exec("INSERT INTO invoices(trip_id,invoice_number,company_id,user_id) VALUES(4,'HISTORICAL-2020',1,10)");
 assert.equal((await save(4)).rows[0].result.invoice_number,'HISTORICAL-2020');
 await db.exec('SET ROLE browser_role');await assert.rejects(save());await db.exec('RESET ROLE');
 } finally {await db.close();}
});
