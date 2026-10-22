// Execute the actual orchestrator against disposable files and simulated commands.
// This proves rollback orchestration, not external TLS or a real Docker rollout.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const image=n=>'ghcr.io/infojouwdriver-commits/jd@sha256:'+n.repeat(64);
const revision='b'.repeat(40),baseline='c4ffb842af9f7a8fdde6fa5dc63c391be1623924';
function fixture(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jouww-flow-')),root=dir+'/runtime',foundation=root+'/foundation';
  fs.mkdirSync(foundation,{recursive:true});fs.mkdirSync(root+'/backups');fs.mkdirSync(dir+'/bin');
  fs.copyFileSync(new URL('../Caddyfile.customers',import.meta.url),foundation+'/Caddyfile');
  fs.copyFileSync(new URL('../Caddyfile.jouww.candidate',import.meta.url),dir+'/Caddyfile.jouww.candidate');
  fs.writeFileSync(foundation+'/.app-staging.env','APP_ORIGIN=https://jouw-driver.duckdns.org\nJWT_SECRET=synthetic-preserved\nCHIRON_PRODUCTION_ENABLED=true\nMAIL_PROVIDER=fixture\n');
  fs.writeFileSync(foundation+'/private-app.yaml','services:\n  app:\n    image: '+image('a')+'\n');
  fs.writeFileSync(foundation+'/.database.env','SYNTHETIC=true\n');fs.writeFileSync(foundation+'/compose.yaml','synthetic: true\n');
  const state=JSON.stringify({mode:'public',image:image('a'),revision:baseline,deployedAt:new Date(Date.now()-60000).toISOString(),previousImage:image('c')});
  fs.writeFileSync(foundation+'/runtime-mode.json',state);fs.writeFileSync(root+'/release.json',state);fs.writeFileSync(root+'/running-image',image('a'));
  const archive=Buffer.from('synthetic encrypted archive placeholder');fs.writeFileSync(root+'/backups/foundation-123-1.tar.age',archive);
  fs.writeFileSync(root+'/backups/foundation-123-1.sha256',createHash('sha256').update(archive).digest('hex'));
  const script=fs.readFileSync(new URL('../jouww-cutover.mjs',import.meta.url),'utf8').replace("const root='/srv/jouw-driver'",'const root='+JSON.stringify(root));
  fs.writeFileSync(dir+'/cutover.mjs',script);
  const mock=`#!${process.execPath}
const fs=require('node:fs');const root=process.env.FIXTURE_ROOT;const a=process.argv.slice(2);const name=require('node:path').basename(process.argv[1]);
const out=x=>process.stdout.write(typeof x==='string'?x:JSON.stringify(x));
if(name==='curl'){
 const url=a.at(-1),host=new URL(url).hostname;
 if(url.includes('/next_api/'))out(a.some(x=>x==='Origin: https://jouww.com'||x==='Origin: https://www.jouww.com')?'403':'401');
 else out(host==='jouw-driver.duckdns.org'?'200':fs.readFileSync(root+'/foundation/Caddyfile','utf8').includes('Domain preparation in progress')?'503':'200');
}else if(a[0]==='compose'){
 if(a.includes('ps'))out(a.at(-1));
 else if(a.includes('up')){
  if(fs.existsSync(root+'/fail-up')){fs.unlinkSync(root+'/fail-up');process.exit(2);}
  const ref=fs.readFileSync(root+'/foundation/private-app.yaml','utf8').match(/ghcr\\.io\\/infojouwdriver-commits\\/jd@sha256:[a-f0-9]{64}/)[0];fs.writeFileSync(root+'/running-image',ref);
 }
}else if(a[0]==='inspect'){
 const running=fs.readFileSync(root+'/running-image','utf8'),format=a.includes('--format')?a[a.indexOf('--format')+1]:null;
 if(!format)out([{Config:{Image:running},State:{Health:{Status:'healthy'}},HostConfig:{PortBindings:{}}}]);
 else if(format.includes('Mounts'))out([{Destination:'/data',RW:true}]);
 else if(format.includes('Labels'))out({'org.opencontainers.image.revision':'${revision}','com.jouwdriver.portal-origin':'https://app.jouww.com'});
 else if(format.includes('ReadonlyRootfs'))out('true');else if(format.includes('Config.Image'))out(running);else if(format==='{{.Image}}')out('sha256:f2a1290d0463aad60660d4ec134943f183ee2a5f6c3eb7bf32dd984f2f020772');else process.exit(3);
}else if(a.includes('version'))out('v2.11.7 fixture');else if(a[0]!=='exec')process.exit(4);
`;
  for(const name of ['docker','curl'])fs.writeFileSync(dir+'/bin/'+name,mock,{mode:0o755});
  const run=phase=>spawnSync(process.execPath,[dir+'/cutover.mjs',phase,image('d'),revision,'123-1'],{encoding:'utf8',env:{...process.env,FIXTURE_ROOT:root,PATH:dir+'/bin:'+process.env.PATH}});
  return {dir,root,foundation,run,cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
test('prepare, activate, verify and configuration-only rollback preserve protected files',()=>{
  const f=fixture();try{
    const originals=Object.fromEntries(['.app-staging.env','.database.env','compose.yaml','private-app.yaml','Caddyfile','runtime-mode.json'].map(n=>[n,fs.readFileSync(f.foundation+'/'+n)]));
    for(const phase of ['prepare-tls','activate','verify']){const r=f.run(phase);assert.equal(r.status,0,r.stderr);}
    assert.equal(JSON.parse(fs.readFileSync(f.root+'/release.json')).image,image('d'));
    for(const n of ['.database.env','compose.yaml'])assert.deepEqual(fs.readFileSync(f.foundation+'/'+n),originals[n]);
    const rollback=f.run('rollback');assert.equal(rollback.status,0,rollback.stderr);
    for(const [n,bytes]of Object.entries(originals))assert.deepEqual(fs.readFileSync(f.foundation+'/'+n),bytes);
    assert.equal(fs.existsSync(f.root+'/.deployment-lock'),false);
  }finally{f.cleanup();}
});
test('failure during application replacement restores origins, image and proxy automatically',()=>{
  const f=fixture();try{
    assert.equal(f.run('prepare-tls').status,0);fs.writeFileSync(f.root+'/fail-up','once');
    const r=f.run('activate');assert.notEqual(r.status,0);assert.match(r.stderr,/operation failed/);
    assert.equal(JSON.parse(fs.readFileSync(f.root+'/release.json')).image,image('a'));
    assert.equal(fs.readFileSync(f.root+'/running-image','utf8'),image('a'));
    assert.ok(!fs.readFileSync(f.foundation+'/.app-staging.env','utf8').includes('app.jouww.com'));
    assert.equal(JSON.parse(fs.readFileSync(f.root+'/domain-transition/transition.json')).phase,'rolled-back');
    assert.equal(fs.existsSync(f.root+'/.deployment-lock'),false);
  }finally{f.cleanup();}
});
