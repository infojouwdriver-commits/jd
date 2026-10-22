import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const workflow=fs.readFileSync(new URL('../../.github/workflows/update-native-driver.yml',import.meta.url),'utf8');
const gate=workflow.split("node --input-type=module <<'GATE'\n")[1].split('\n          GATE')[0].split('\n').map(l=>l.replace(/^          /,'')).join('\n');
const revision='a'.repeat(40),image='ghcr.io/infojouwdriver-commits/jd@sha256:'+'b'.repeat(64);
function run(options={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'marketing-gate-'));
 try{
  const inputs={revision,image,release_run:'111',backup_run:'222',native_run:'333',...options.inputs};
  fs.writeFileSync(path.join(dir,'event.json'),JSON.stringify({inputs}));
  const mock=`const options=${JSON.stringify(options)};
  globalThis.fetch=async url=>{
   const name=String(url).split('/repos/fixture/jd')[1];let data;
   if(name.endsWith('...main'))data={status:options.ancestry||'ahead'};
   else if(name.startsWith('/compare/'))data={status:'ahead',files:options.files||[{filename:'src/app/next_api/drivers/shifts/pdf/route.ts',status:'modified'}]};
   else if(name.endsWith('/jobs?per_page=100'))data={jobs:(name.includes('/333/')?['android','visual-review']:['checks / verify','checks / native-database','publish']).filter(n=>n!==options.missingJob).map(name=>({name,conclusion:'success'}))};
   else if(name==='/actions/runs/111')data={status:'completed',conclusion:options.releaseConclusion||'success',path:'.github/workflows/release.yml',head_sha:options.head||'${revision}'};
   else if(name==='/actions/runs/333')data={status:'completed',conclusion:options.nativeConclusion||'success',path:'.github/workflows/native-driver.yml',head_sha:options.nativeHead||'${revision}'};
   else if(name==='/actions/runs/222')data={id:222,run_attempt:2,status:'completed',conclusion:options.backupConclusion||'success',path:options.backupPath||'.github/workflows/backup-foundation.yml',updated_at:options.backupDate||new Date().toISOString()};
   else throw Error('Unexpected acceptance URL');
   return {ok:!options.unavailable,json:async()=>data};
  };`;
  const result=spawnSync(process.execPath,['--input-type=module'],{input:mock+'\n'+gate,encoding:'utf8',env:{PATH:process.env.PATH,GITHUB_EVENT_PATH:path.join(dir,'event.json'),GITHUB_OUTPUT:path.join(dir,'output'),GITHUB_REPOSITORY:'fixture/jd',GH_TOKEN:'synthetic'}});
  return {...result,outputs:fs.existsSync(path.join(dir,'output'))?fs.readFileSync(path.join(dir,'output'),'utf8'):''};
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
test('native driver gate accepts completed release, native/browser jobs and recent restore proof',()=>{const r=run();assert.equal(r.status,0,r.stderr);assert.match(r.outputs,/backup_tag=222-2/);});
for(const [name,options,error] of [
 ['failed native build',{nativeConclusion:'failure'},/Native application acceptance/],
 ['wrong native revision',{nativeHead:'c'.repeat(40)},/Native application acceptance/],
 ['missing native UI review',{missingJob:'visual-review'},/Android build and visual review/],
 ['mutable image',{inputs:{image:'ghcr.io/infojouwdriver-commits/jd:latest'}},/Invalid immutable/],
 ['untrusted revision',{inputs:{revision:'main; echo unsafe'}},/Invalid immutable/],
 ['unmerged source',{ancestry:'diverged'},/reachable from main/],
 ['backend changes',{files:[{filename:'src/lib/chiron-service.ts',status:'modified'}]},/Only reviewed native driver/],
 ['deleted source',{files:[{filename:'src/app/next_api/drivers/shifts/pdf/route.ts',status:'removed'}]},/Only reviewed native driver/],
 ['truncated comparison',{files:Array.from({length:300},()=>({filename:'DESIGN.md',status:'modified'}))},/Only reviewed native driver/],
 ['failed release',{releaseConclusion:'failure'},/Acceptance did not pass/],
 ['another revision',{head:'c'.repeat(40)},/revision mismatch/],
 ['missing native acceptance',{missingJob:'checks / native-database'},/Full native and browser/],
 ['failed restore',{backupConclusion:'failure'},/Acceptance did not pass/],
 ['wrong recovery workflow',{backupPath:'.github/workflows/ci.yml'},/Acceptance did not pass/],
 ['stale backup',{backupDate:'2020-01-01T00:00:00Z'},/Recent restore/],
 ['unavailable acceptance',{unavailable:true},/Acceptance unavailable/],
])test('native driver gate refuses '+name,()=>{const r=run(options);assert.notEqual(r.status,0);assert.match(r.stderr,error);});
test('image-only rollout has valid shell syntax and excludes migration and configuration changes',()=>{
 const block=workflow.split('      - name: Replace only')[1].split('        run: |\n')[1].split('\n').map(l=>l.replace(/^          /,'')).join('\n');
 const r=spawnSync('bash',['-n'],{input:block,encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 assert.doesNotMatch(block,/\bpsql\b|\bMIGRATE\b|CHIRON_.*=|SUBSCRIPTION_.*=|caddy reload/);
 assert.match(block,/sha256sum --status --check/);assert.match(block,/--no-deps --wait/);
 assert.match(block,/s\.revision!==process\.env\.DRIVER_BASELINE/);
});
