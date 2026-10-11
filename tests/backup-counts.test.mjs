import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const pglite=process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite';
const {PGlite}=await import(pglite);
test('restore comparison counts empty tables and safely quotes historical schemas without changing rows',async()=>{
 const db=new PGlite();
 try{
  await db.waitReady;
  await db.exec(`CREATE TABLE public.invoices(id bigint,amount numeric);
    INSERT INTO public.invoices VALUES(1,32.15),(2,0);
    CREATE TABLE public.trips(id bigint);
    CREATE SCHEMA "history quoted";
    CREATE TABLE "history quoted"."invoice archive"(id bigint);
    INSERT INTO "history quoted"."invoice archive" VALUES(7);`);
  const query=fs.readFileSync(new URL('../deploy/backup-table-counts.sql',import.meta.url),'utf8').split('\n').filter(x=>!x.startsWith('\\')).join('\n');
  const original=(await db.query('SELECT jsonb_agg(t ORDER BY id) AS records FROM public.invoices t')).rows[0].records;
  const result=await db.exec(query);
  const counts=result.at(-1).rows[0].backup_table_counts;
  assert.deepEqual(counts,{'public.invoices':2,'public.trips':0,'history quoted.invoice archive':1});
  assert.deepEqual((await db.query('SELECT jsonb_agg(t ORDER BY id) AS records FROM public.invoices t')).rows[0].records,original);
 }finally{await db.close();}
});
