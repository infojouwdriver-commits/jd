import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const workflow=fs.readFileSync(new URL('../../.github/workflows/update-driver-experience.yml',import.meta.url),'utf8');
const gate=workflow.split("node --input-type=module <<'GATE'\n")[1].split('\n          GATE')[0].split('\n').map(l=>l.replace(/^          /,'')).join('\n');
const revision='a'.repeat(40),image='ghcr.io/infojouwdriver-commits/jd@sha256:'+'b'.repeat(64);
function run(options={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'driver-experience-gate-'));
 try{
  const inputs={revision,image,release_run:'111',backup_run:'222',native_run:'333',acceptance_run:'444',...options.inputs};
  fs.writeFileSync(path.join(dir,'event.json'),JSON.stringify({inputs}));
  const proof=JSON.parse(fs.readFileSync(new URL('./fixtures/jouww-native-proof.json',import.meta.url)));proof.candidateImage=options.proofImage||image;
  if(options.omitCheck){proof.checks=proof.checks.filter(x=>!x.includes(options.omitCheck));proof.passed=proof.checks.length;}
  const zip=spawnSync('python3',['-c','import zipfile,io,sys; b=io.BytesIO(); z=zipfile.ZipFile(b,"w"); z.writestr("candidate-native-proof.json",sys.stdin.buffer.read()); z.close(); sys.stdout.buffer.write(b.getvalue())'],{input:JSON.stringify(proof)});assert.equal(zip.status,0);
  const digest='sha256:'+createHash('sha256').update(zip.stdout).digest('hex');
  const mock=`const options=${JSON.stringify(options)},zip=Buffer.from('${zip.stdout.toString('base64')}','base64');
  globalThis.fetch=async url=>{
   const name=String(url).split('/repos/fixture/jd')[1];let data;
   if(name.endsWith('...main'))data={status:options.ancestry||'ahead'};
   else if(name==='/compare/'+(options.nativeHead||'${revision}')+'...${revision}'&&options.nativeHead)data={status:options.nativeAncestry||'ahead',files:options.nativeFiles||[{filename:'tests/run-mapbox-trip-ui.mjs',status:'modified'}]};
   else if(name.startsWith('/compare/'))data={status:'ahead',files:options.files||[{filename:'src/lib/document-links.ts',status:'added'}]};
   else if(name.endsWith('/jobs?per_page=100'))data={jobs:(name.includes('/333/')?['android','visual-review']:['checks / verify','checks / native-database','domain / candidate','publish']).filter(n=>n!==options.missingJob).map(name=>({name,conclusion:'success'}))};
   else if(name==='/actions/runs/111')data={status:'completed',conclusion:options.releaseConclusion||'success',path:'.github/workflows/release-domain-candidate.yml',head_sha:options.head||'${revision}'};
   else if(name==='/actions/runs/333')data={status:'completed',conclusion:options.nativeConclusion||'success',path:'.github/workflows/native-driver.yml',head_sha:options.nativeHead||'${revision}'};
   else if(name==='/actions/runs/222')data={id:222,run_attempt:2,status:'completed',conclusion:options.backupConclusion||'success',path:options.backupPath||'.github/workflows/backup-foundation.yml',updated_at:options.backupDate||new Date().toISOString()};
   else if(name==='/actions/runs/444')data={status:'completed',conclusion:options.acceptanceConclusion||'success',path:'.github/workflows/verify-domain-image.yml',head_sha:'${revision}',head_branch:options.acceptanceBranch||'main'};
   else if(name==='/actions/runs/444/artifacts')data={artifacts:options.missingProof?[]:[{id:777,name:'jouww-image-acceptance-444',expired:false,digest:options.badDigest?'sha256:'+'0'.repeat(64):'${digest}'}]};
   else if(name==='/actions/artifacts/777/zip')return {ok:!options.unavailable,arrayBuffer:async()=>zip};
   else throw Error('Unexpected acceptance URL '+name);
   return {ok:!options.unavailable,json:async()=>data};
  };`;
  return spawnSync(process.execPath,['--input-type=module'],{input:mock+'\n'+gate,encoding:'utf8',env:{PATH:process.env.PATH,GITHUB_EVENT_PATH:path.join(dir,'event.json'),GITHUB_OUTPUT:path.join(dir,'output'),GITHUB_REPOSITORY:'fixture/jd',GITHUB_REF:options.ref||'refs/heads/main',GH_TOKEN:'synthetic'}});
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
test('jouww image update accepts complete exact-image, native and recovery proof',()=>{const r=run();assert.equal(r.status,0,r.stderr);});
test('unchanged native sources may reuse a verified APK after test-only source changes',()=>{const r=run({nativeHead:'c'.repeat(40)});assert.equal(r.status,0,r.stderr);});
for(const [name,options,error] of [
 ['unprotected workflow source',{ref:'refs/heads/feature'},/Protected main/],
 ['mutable image',{inputs:{image:'jd:latest'}},/Invalid immutable/],
 ['unmerged source',{ancestry:'diverged'},/reachable from main/],
 ['unreviewed database migration',{files:[{filename:'migrations/new.sql',status:'added'}]},/Only reviewed driver experience/],
 ['source deletion',{files:[{filename:'src/lib/document-links.ts',status:'removed'}]},/Only reviewed driver experience/],
 ['truncated source comparison',{files:Array(300).fill({filename:'DESIGN.md',status:'modified'})},/Only reviewed driver experience/],
 ['failed release',{releaseConclusion:'failure'},/Acceptance did not pass/],
 ['wrong release revision',{head:'d'.repeat(40)},/Release revision/],
 ['missing domain acceptance job',{missingJob:'domain / candidate'},/Full native and browser/],
 ['failed native build',{nativeConclusion:'failure'},/Native application acceptance/],
 ['changed native sources',{nativeHead:'c'.repeat(40),nativeFiles:[{filename:'driver-app/src/api.ts',status:'modified'}]},/Native application sources differ/],
 ['unrelated native revision',{nativeHead:'c'.repeat(40),nativeAncestry:'diverged'},/Native application sources differ/],
 ['missing native visual review',{missingJob:'visual-review'},/Android build and visual review/],
 ['failed exact-image acceptance',{acceptanceConclusion:'failure'},/Exact image acceptance did not pass/],
 ['feature-branch exact-image acceptance',{acceptanceBranch:'feature'},/Exact image acceptance did not pass/],
 ['missing image proof',{missingProof:true},/Exact image proof missing/],
 ['tampered proof archive',{badDigest:true},/integrity mismatch/],
 ['proof for another image',{proofImage:'jd:latest'},/Exact image\/origin acceptance missing/],
 ['incomplete tenant/origin acceptance',{omitCheck:'Candidate app origin'},/Exact image\/origin acceptance missing/],
 ['failed recovery drill',{backupConclusion:'failure'},/Acceptance did not pass/],
 ['stale recovery drill',{backupDate:'2020-01-01T00:00:00Z'},/Recent restore drill/],
 ['unavailable gates',{unavailable:true},/Acceptance unavailable/],
])test('jouww image update rejects '+name,()=>{const r=run(options);assert.notEqual(r.status,0);assert.match(r.stderr,error);});
test('image-only runtime preserves database, origins, certificates and rollback without SQL',()=>{
 const block=workflow.split('      - name: Replace only')[1].split('        run: |\n')[1].split('\n').map(l=>l.replace(/^          /,'')).join('\n');
 const r=spawnSync('bash',['-n'],{input:block,encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 assert.doesNotMatch(block,/\bpsql\b|\bMIGRATE\b|CHIRON_.*=|SUBSCRIPTION_.*=|caddy reload/);
 assert.match(block,/APP_ORIGIN=https:\/\/app\.jouww\.com/);assert.match(block,/com\.jouwdriver\.portal-origin/);assert.match(block,/sha256sum --status --check/);assert.match(block,/--no-deps --wait/);assert.match(block,/s\.revision!==process\.env\.DRIVER_BASELINE/);
 assert.match(block,/\/documents\/receipts\/invalid/);assert.match(block,/Legacy client origin rejected/);assert.match(block,/cat "\$work\/private-app.yaml" > private-app.yaml/);
});
