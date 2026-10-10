#!/usr/bin/env node
// Read-only diagnostics: counts only, never record IDs or personal values.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditSql} from './independent-schema.mjs';
import {writePrivate} from './convert-database.mjs';
async function main() {
 const [output,schema=process.env.POSTGREST_SCHEMA]=process.argv.slice(2);
 if(!output)throw Error('A new private report path is required');
 const repo=fileURLToPath(new URL('../',import.meta.url));const parent=await fs.realpath(path.dirname(path.resolve(output)));const target=path.join(parent,path.basename(output));if(target.startsWith(repo))throw Error('Keep reports outside Git');
 for(const name of ['PGHOST','PGDATABASE','PGUSER'])if(!process.env[name])throw Error('Missing connection configuration');
 if(!process.env.PGHOST.startsWith('/')&&!['localhost','127.0.0.1','::1'].includes(process.env.PGHOST)&&process.env.PGSSLMODE!=='verify-full')throw Error('Remote audit needs verified TLS');
 const query='BEGIN READ ONLY; SET LOCAL search_path=pg_catalog; '+auditSql(schema)+' ROLLBACK;';
 const raw=await new Promise((resolve,reject)=>{
  const child=spawn('psql',['--no-psqlrc','--no-password','--quiet','--tuples-only','--no-align','--set=ON_ERROR_STOP=1'],{env:{...process.env,PGCONNECT_TIMEOUT:'10',PGOPTIONS:(process.env.PGOPTIONS||'')+' -c default_transaction_read_only=on -c statement_timeout=60000'},stdio:['pipe','pipe','ignore']});let text='';
  const timer=setTimeout(()=>child.kill('SIGKILL'),90000);child.stdout.on('data',data=>{text+=data;if(text.length>1000000)child.kill('SIGKILL');});child.once('error',()=>{clearTimeout(timer);reject(Error('psql unavailable'));});child.once('close',code=>{clearTimeout(timer);code===0?resolve(text):reject(Error('Audit query failed'));});child.stdin.on('error',()=>{});child.stdin.end(query);
 });
 const report=JSON.parse(raw.trim());report.auditedAt=new Date().toISOString();report.source='independent application contract';report.scope='Core relations, trip identity, numeric/coordinate/time checks; not full application or legal acceptance';
 await writePrivate(target,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failedChecks:report.findings.filter(f=>f.invalidRows>0).length,status:'private-read-only-audit-saved'}));if(!report.passed)process.exitCode=2;
}
main().catch(()=>{console.error('Independent schema audit failed. Check the connection, verified TLS, schema and a new private output path. No database diagnostics or record values are printed.');process.exitCode=1;});
