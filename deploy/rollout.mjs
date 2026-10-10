#!/usr/bin/env node
// Host-side deployment. Secrets are inherited from Node --env-file, never argv.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const [image, revision, target] = process.argv.slice(2);
if (!/^ghcr\.io\/[a-z0-9_.-]+\/[a-z0-9_.-]+@sha256:[a-f0-9]{64}$/.test(image || '')) throw Error('Immutable GHCR image digest required');
if (!/^[a-f0-9]{40}$/.test(revision || '')) throw Error('Full release revision required');
if (!['staging','production'].includes(target) || process.env.DEPLOYMENT_MODE !== target) throw Error('Deployment environment must match server DEPLOYMENT_MODE');
if (!process.env.BACKUP_RECIPIENT) throw Error('Encrypted backup recipient required before deployment');
if (target === 'production' && process.env.SCHEMA_VALIDATED !== 'true') throw Error('Production requires validated database and encrypted backup recipient');
const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(directory);
const stateDirectory = '/srv/jouw-driver';
const env = {...process.env, POSTGREST_URL:'http://postgrest:3000', POSTGREST_INTERNAL_NETWORK:'true', TRUST_PROXY:'true', APP_IMAGE:image, COMPOSE_PROJECT_NAME:'jouw-driver', COMPOSE_FILE:path.join(directory,'compose.yaml'), BACKUP_DIRECTORY:path.join(stateDirectory,'backups')};
const run = (command,args,capture=false) => new Promise((resolve,reject)=>{
  const child=spawn(command,args,{cwd:directory,env,stdio:['ignore',capture?'pipe':'inherit','inherit']});
  let output=''; if(capture) child.stdout.on('data',chunk=>{output+=chunk;});
  child.on('error',reject); child.on('exit',code=>code===0?resolve(output.trim()):reject(Error(`${command} failed (${code}); inspect host privately`)));
});
const compose = (...args) => run('docker',['compose',...args]);
// Lock works across Actions environments and operators sharing this host.
const lock=path.join(stateDirectory,'.deployment-lock');
await fs.mkdir(lock,{mode:0o700});
try {
  await run('node',[path.join(root,'scripts/preflight.mjs')]);
  await run('docker',['pull',image]);
  const builtRevision=await run('docker',['inspect','--format={{index .Config.Labels "org.opencontainers.image.revision"}}',image],true);
  if(builtRevision!==revision) throw Error('Image revision differs from migration revision');
  await compose('up','-d','--wait','--wait-timeout','120','db');
  // First installation also backs up the restored/reviewed database before applying changes.
  await run('sh',[path.join(directory,'backup.sh')]);
  await compose('stop','edge','app');
  await run('node',[path.join(root,'scripts/apply-release.mjs')]);
  await compose('up','-d','--force-recreate','postgrest');
  await compose('up','-d','--no-build','--wait','--wait-timeout','180','app');
  await compose('up','-d','--no-build','edge');
  const response=await fetch(new URL('/privacy-policy',process.env.APP_ORIGIN),{redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw Error(`Public TLS smoke check failed (${response.status})`);
  const state=path.join(stateDirectory,'release.json');
  try { await fs.copyFile(state,path.join(stateDirectory,'previous-release.json')); } catch(error) { if(error.code!=='ENOENT') throw error; }
  const temporary=path.join(stateDirectory,'.release.json.tmp');
  await fs.writeFile(temporary,JSON.stringify({image,revision,deployedAt:new Date().toISOString()},null,2)+'\n',{mode:0o600});
  await fs.rename(temporary,state);
  console.log('Deployment healthy; revision '+revision);
} catch(error) {
  console.error('Deployment halted. Database migrations can be forward-only: do not automatically restore production or force old binaries. Use the recovery runbook.');
  throw error;
} finally { await fs.rmdir(lock); }
