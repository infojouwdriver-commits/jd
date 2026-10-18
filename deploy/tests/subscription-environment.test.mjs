import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const script=fs.readFileSync(new URL('../update-customer-portal.sh',import.meta.url),'utf8');
const source=script.split("<<'IMAGE'\n")[1].split('\nIMAGE')[0];
const image='ghcr.io/infojouwdriver-commits/jd@sha256:'+'b'.repeat(64);
const old='ghcr.io/infojouwdriver-commits/jd@sha256:'+'a'.repeat(64);
function execute(app){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jd-host-env-'));const config=`services:\n  postgrest:\n    environment:\n      DEPLOYMENT_MODE: unrelated\n  app:\n    image: ${old}\n${app}\n    read_only: true\nnetworks:\n  database: {internal: true}\n`;fs.writeFileSync(path.join(dir,'private-app.yaml'),config);fs.writeFileSync(path.join(dir,'.app-staging.env'),'EXISTING=preserve\nSUBSCRIPTION_SCHEDULER_ENABLED=false\n');try{const r=spawnSync(process.execPath,['--input-type=module','-e',source],{cwd:dir,env:{...process.env,CUSTOMER_IMAGE:image},encoding:'utf8'});return{...r,config,updated:fs.readFileSync(path.join(dir,'private-app.yaml'),'utf8'),env:fs.readFileSync(path.join(dir,'.app-staging.env'),'utf8')}}finally{fs.rmSync(dir,{recursive:true,force:true})}}
test('accepted foundation env_file receives scheduler through existing app environment',()=>{const r=execute('    env_file: [.app-staging.env]');assert.equal(r.status,0,r.stderr);assert.equal(r.updated,r.config.replace(old,image));assert.equal(r.env,'EXISTING=preserve\nSUBSCRIPTION_SCHEDULER_ENABLED=true\n')});
test('mapping installation receives scheduler only in app service',()=>{const r=execute('    environment:\n      DEPLOYMENT_MODE: ${DEPLOYMENT_MODE:?required}');assert.equal(r.status,0,r.stderr);assert.equal((r.updated.match(/^      SUBSCRIPTION_SCHEDULER_ENABLED:/gm)||[]).length,1);assert.match(r.updated,/postgrest:\n    environment:\n      DEPLOYMENT_MODE: unrelated\n  app:/);assert.match(r.updated,/      SUBSCRIPTION_SCHEDULER_ENABLED: \$\{SUBSCRIPTION_SCHEDULER_ENABLED:-false\}/)});
test('unrecognized app environment fails before changing image or configuration',()=>{const r=execute('    networks: [database]');assert.notEqual(r.status,0);assert.match(r.stderr,/App environment mapping unavailable/);assert.equal(r.updated,r.config);assert.equal(r.env,'EXISTING=preserve\nSUBSCRIPTION_SCHEDULER_ENABLED=false\n')});
test('rollback restores environment together with application configuration',()=>{assert.match(script,/cp \.app-staging\.env "\$work\/app\.env"/);assert.match(script,/cat "\$work\/app\.env" > \.app-staging\.env/)});
