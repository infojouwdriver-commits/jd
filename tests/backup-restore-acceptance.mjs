// Run only inside the synthetic Docker acceptance test. Never reads a user's backup.
import {spawn, execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';

function command(binary,args,{env=process.env,cwd,input}={}) {
 return new Promise((resolve,reject)=>{
  const child=spawn(binary,args,{env,cwd,stdio:['pipe','pipe','ignore']});let result='';
  const timer=setTimeout(()=>child.kill('SIGKILL'),90000);
  child.stdout.on('data',data=>{result+=data;if(result.length>1000000)child.kill('SIGKILL');});
  child.once('error',()=>{clearTimeout(timer);reject(Error('Backup acceptance tool unavailable'));});
  child.once('close',code=>{clearTimeout(timer);code===0?resolve(result.trim()):reject(Error('Backup acceptance command failed; private diagnostics omitted'));});
  child.stdin.on('error',()=>{});child.stdin.end(input);
 });
}

// Decrypt directly into pg_restore's stdin: no unencrypted dump on disk.
async function restore(archive,identity,target,database) {
 return new Promise((resolve,reject)=>{
  const decrypt=spawn('age',['--decrypt','--identity',identity,archive],{stdio:['ignore','pipe','ignore']});
  const load=spawn('docker',['exec','-i',target,'pg_restore','--exit-on-error','--single-transaction','-U','postgres','-d',database],{stdio:['pipe','ignore','ignore']});
  decrypt.stdout.pipe(load.stdin);load.stdin.on('error',()=>{});
  let completed=0,failed=false;
  const timer=setTimeout(()=>{failed=true;decrypt.kill('SIGKILL');load.kill('SIGKILL');},90000);
  const done=code=>{failed ||= code!==0;if(++completed===2){clearTimeout(timer);failed?reject(Error('Encrypted restore rejected')):resolve();}};
  decrypt.once('error',()=>{failed=true;load.kill('SIGKILL');});load.once('error',()=>{failed=true;decrypt.kill('SIGKILL');});
  decrypt.once('close',done);load.once('close',done);
 });
}

export async function backupRestoreAcceptance({docker,source,image,prefix}) {
 const work=fs.mkdtempSync(path.join(os.tmpdir(),'jd-backup-acceptance-'));fs.chmodSync(work,0o700);
 const target=prefix+'-restore';const database='jd_restore_test';const checks=[];
 const sql=(container,db,query)=>docker(['exec','-i',container,'psql','--no-psqlrc','-U','postgres','-d',db,'-v','ON_ERROR_STOP=1','-At'],{input:query});
 try {
  const key=path.join(work,'identity');await command('age-keygen',['-o',key]);fs.chmodSync(key,0o600);
  const recipient=await command('age-keygen',['-y',key]);
  const dockerPath=execFileSync('sh',['-c','command -v docker'],{encoding:'utf8'}).trim();
  // Adapt only compose's DB exec to our already-created synthetic source container.
  const wrapper=path.join(work,'docker');
  fs.writeFileSync(wrapper,`#!/usr/bin/env node\nconst {spawnSync}=require('node:child_process');const a=process.argv.slice(2);if(JSON.stringify(a.slice(0,4))!==JSON.stringify(['compose','exec','-T','db']))process.exit(2);const r=spawnSync(${JSON.stringify(dockerPath)},['exec','-i',${JSON.stringify(source)},...a.slice(4)],{stdio:'inherit'});process.exit(r.status??1);\n`,{mode:0o700});
  const env={...process.env,PATH:work+path.delimiter+process.env.PATH,BACKUP_RECIPIENT:recipient};
  const backupScript=new URL('../deploy/backup.sh',import.meta.url).pathname;
  await command('sh',[backupScript],{cwd:work,env});
  const backups=path.join(work,'backups');const files=fs.readdirSync(backups);assert.equal(files.length,1);assert.ok(files[0].endsWith('.dump.age'));
  const archive=path.join(backups,files[0]);assert.equal(fs.statSync(archive).mode&0o777,0o600);assert.equal(fs.statSync(backups).mode&0o777,0o700);
  assert.match(fs.readFileSync(archive).subarray(0,30).toString(),/age-encryption\.org\/v1/);
  checks.push('Actual backup.sh produces a private age-encrypted custom-format dump with no plaintext dump file');
  // A failed producer must never publish even an encrypted incomplete archive.
  fs.writeFileSync(wrapper,'#!/bin/sh\nprintf partial\nexit 1\n',{mode:0o700});
  await assert.rejects(command('sh',[backupScript],{cwd:work,env}));assert.deepEqual(fs.readdirSync(backups),files);
  checks.push('Failed pg_dump leaves no published backup or temporary plaintext file');
  const restorePassword=randomBytes(32).toString('hex');
  await docker(['run','--detach','--name',target,'--network','none','--env','POSTGRES_DB','--env','POSTGRES_PASSWORD',image],{env:{POSTGRES_DB:database,POSTGRES_PASSWORD:restorePassword}});
  // pg_isready also accepts the temporary Unix-socket bootstrap server. Wait
  // for the final TCP server so role creation cannot race its shutdown.
  let ready=false;for(let i=0;i<60;i++){try{const probe=await docker(['exec','--env','PGPASSWORD',target,'psql','-h','127.0.0.1','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1','-Atc','SELECT 1'],{env:{PGPASSWORD:restorePassword},timeout:5000});if(probe==='1'){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,1000));}assert.ok(ready,'Final isolated restore PostgreSQL server did not become ready');
  // Database archives exclude global roles/passwords; provision fresh roles separately.
  await sql(target,database,'CREATE ROLE jd_browser; CREATE ROLE jd_service; CREATE ROLE jd_gateway;');
  await restore(archive,key,target,database);
  const tables=JSON.parse(await sql(source,'jd_test',"SELECT json_agg(tablename ORDER BY tablename) FROM pg_tables WHERE schemaname='public';"));
  for(const table of tables){const id='"'+table.replaceAll('"','""')+'"';const query=`SELECT count(*)::text||':'||coalesce(md5(string_agg(row_data::text,'' ORDER BY row_data::text)),'empty') FROM (SELECT to_jsonb(t) AS row_data FROM public.${id} t) rows;`;assert.equal(await sql(target,database,query),await sql(source,'jd_test',query));}
  const sequences="SELECT coalesce(jsonb_agg(jsonb_build_array(sequencename,last_value,increment_by) ORDER BY sequencename),'[]'::jsonb) FROM pg_sequences WHERE schemaname='public';";
  assert.equal(await sql(target,database,sequences),await sql(source,'jd_test',sequences));
  const metadata=`SELECT jsonb_build_object(
   'constraints',(SELECT md5(string_agg(conrelid::regclass::text||':'||conname||':'||pg_get_constraintdef(oid),'' ORDER BY conrelid::regclass::text,conname)) FROM pg_constraint WHERE connamespace='public'::regnamespace),
   'policies',(SELECT md5(jsonb_agg(to_jsonb(p) ORDER BY tablename,policyname)::text) FROM pg_policies p WHERE schemaname='public'),
   'functions',(SELECT md5(string_agg(pg_get_functiondef(oid),'' ORDER BY proname,pg_get_function_identity_arguments(oid))) FROM pg_proc WHERE pronamespace='public'::regnamespace AND prokind='f'));`;
  assert.equal(await sql(target,database,metadata),await sql(source,'jd_test',metadata));
  await assert.rejects(sql(target,database,'SET ROLE jd_browser; SELECT * FROM public.trips;'));
  assert.match(await sql(target,database,'SET ROLE jd_service; SELECT count(*) FROM public.trips;'),/\d+/);
  checks.push('Encrypted backup restores in a separate network-isolated PostgreSQL container with matching all-table hashes, sequences, constraints, functions, RLS and browser/service access');
  const wrongKey=path.join(work,'wrong-identity');await command('age-keygen',['-o',wrongKey]);
  await assert.rejects(command('age',['--decrypt','--identity',wrongKey,archive]));
  const damaged=path.join(work,'damaged.age');const bytes=fs.readFileSync(archive);bytes[bytes.length-20]^=1;fs.writeFileSync(damaged,bytes,{mode:0o600});
  await assert.rejects(command('age',['--decrypt','--identity',key,damaged]));
  checks.push('Wrong decryption key and corrupted encrypted backup are rejected');
  return checks;
 } finally {
  await docker(['rm','--force','--volumes',target],{timeout:20000}).catch(()=>{});
  fs.rmSync(work,{recursive:true,force:true});
 }
}
