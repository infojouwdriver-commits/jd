// Protected, manual domain transition. Never migrates/restores data or rotates keys.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const oldOrigin='https://jouw-driver.duckdns.org';
export const portalOrigin='https://app.jouww.com';
const newHosts=['jouww.com','www.jouww.com','app.jouww.com'];
const root='/srv/jouw-driver',foundation=root+'/foundation',recovery=root+'/domain-transition';
const baseline='c4ffb842af9f7a8fdde6fa5dc63c391be1623924';
const expectedProxyId='sha256:f2a1290d0463aad60660d4ec134943f183ee2a5f6c3eb7bf32dd984f2f020772';
const baselineProxy='b9a9030b8f8b6c59f60238bed5818f3e30e86d4dd746d11f2c8ead6352bbd370';
const imagePattern=/^ghcr\.io\/infojouwdriver-commits\/jd@sha256:[a-f0-9]{64}$/;
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const write=(p,value)=>fs.writeFileSync(p,value,{mode:0o600});
const command=(name,args)=>{try{return execFileSync(name,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:240000}).trim();}catch{throw Error('Required '+name+' operation failed; private output withheld');}};
const docker=(...args)=>command('docker',args);
const compose=(file,env,...args)=>docker('compose','--env-file',env,'--project-name','jouw-driver','--file',file,...args);
const app=()=>compose('private-app.yaml','.app-staging.env','ps','-q','app');
const edge=()=>compose('compose.yaml','.database.env','ps','-q','edge');
const reload=()=>{docker('exec',edge(),'caddy','validate','--config','/etc/caddy/Caddyfile');docker('exec',edge(),'caddy','reload','--config','/etc/caddy/Caddyfile');};
const up=()=>compose('private-app.yaml','.app-staging.env','up','-d','--no-deps','--wait','--wait-timeout','180','app');
const saved=['private-app.yaml','.app-staging.env','Caddyfile','runtime-mode.json'];

export function portalEnvironment(text){
  const lines=text.split(/\r?\n/),result=[];
  const changes={APP_ORIGIN:portalOrigin,TRUSTED_ORIGINS:oldOrigin};
  for(const key of Object.keys(changes)){
    const matches=lines.filter(l=>l.startsWith(key+'='));
    if(matches.length>1)throw Error('Ambiguous origin configuration');
    if(key==='APP_ORIGIN'&&matches[0]!==key+'='+oldOrigin)throw Error('Unexpected prior application origin');
    if(key==='TRUSTED_ORIGINS'&&matches.length&&matches[0]!==key+'='&&matches[0]!==key+'='+oldOrigin)throw Error('Existing trust requires review');
  }
  for(const line of lines){const key=line.split('=',1)[0];if(!(key in changes))result.push(line);}
  while(result.at(-1)==='')result.pop();
  return result.join('\n')+'\n'+Object.entries(changes).map(([k,v])=>k+'='+v).join('\n')+'\n';
}
export function replaceImage(text,previous,next){
  if(!imagePattern.test(previous)||!imagePattern.test(next))throw Error('Immutable image required');
  const refs=text.match(/ghcr\.io\/infojouwdriver-commits\/jd@sha256:[a-f0-9]{64}/g);
  if(refs?.length!==1||refs[0]!==previous)throw Error('Unexpected compose image');
  return text.replace(previous,next);
}
export function secureHttpRoutes(){
  return '\n'+['jouw-driver.duckdns.org',...newHosts].map(h=>'http://'+h).join(', ')+' {\n  @unsafe not method GET HEAD\n  handle @unsafe {\n    respond "HTTPS required" 405\n  }\n  handle {\n    redir https://{host}{uri} 308\n  }\n}\n';
}
export function maintenanceProxy(previous){
  if(newHosts.some(h=>previous.includes(h)))throw Error('New routing already exists');
  return previous+'\n'+newHosts.join(', ')+' {\n  tls {\n    protocols tls1.2 tls1.3\n  }\n  header Cache-Control no-store\n  respond "Domain preparation in progress" 503\n}\n'+secureHttpRoutes();
}
function https(host,path='/privacy-policy',headers=[]){
  const result=command('curl',['--proto','=https','--tlsv1.2','--resolve',host+':443:127.0.0.1','--max-time','20','--silent','--show-error','--output','/dev/null','--write-out','%{http_code}',...headers.flatMap(h=>['--header',h]),'https://'+host+path]);
  return Number(result);
}
function agreement(){
  const state=json('runtime-mode.json'),release=json(root+'/release.json');
  if(state.mode!=='public'||state.image!==release.image||state.revision!==release.revision)throw Error('Live state mismatch');
  const info=JSON.parse(docker('inspect',app()))[0];
  if(info.Config.Image!==state.image||info.State.Health?.Status!=='healthy')throw Error('Live container mismatch');
  if(Object.keys(info.HostConfig.PortBindings||{}).length)throw Error('Application must have no published ports');
  if(https('jouw-driver.duckdns.org')!==200)throw Error('Legacy HTTPS is not healthy');
  return state;
}
function restore(){
  const state=json(recovery+'/transition.json');
  for(const name of saved)write(name,fs.readFileSync(recovery+'/'+name));
  write(root+'/release.json',fs.readFileSync(recovery+'/release.json'));
  up();reload();agreement();
  write(recovery+'/transition.json',JSON.stringify({...state,phase:'rolled-back',rolledBackAt:new Date().toISOString()},null,2)+'\n');
  console.log('Prior image, origins and proxy restored; database and certificate volumes untouched.');
}
export function validateInputs(action,image,revision,backup){
  if(!['prepare-tls','activate','verify','rollback'].includes(action))throw Error('Invalid phase');
  if(!imagePattern.test(image)||!/^[a-f0-9]{40}$/.test(revision)||!/^\d+-\d+$/.test(backup))throw Error('Invalid immutable transition inputs');
}
export async function main(action,image,revision,backup){
  validateInputs(action,image,revision,backup);
  process.umask(0o077);process.chdir(foundation);
  fs.mkdirSync(root+'/.deployment-lock');
  let changed=false;
  try{
    if(action==='rollback'){const prepared=json(recovery+'/transition.json');if(prepared.image!==image||prepared.revision!==revision)throw Error('Recovery candidate mismatch');restore();return;}
    const live=agreement();
    if(action==='prepare-tls'){
      if(fs.existsSync(recovery))throw Error('Existing transition must be reviewed');
      if(live.revision!==baseline||hash(read('Caddyfile'))!==baselineProxy)throw Error('Live baseline changed; review before transition');
      const archive=root+'/backups/foundation-'+backup+'.tar.age';
      const stat=fs.statSync(archive);
      if(stat.mtimeMs<Date.parse(live.deployedAt)||Date.now()-stat.mtimeMs>86400000)throw Error('Recent backup covering current release required');
      // Streaming checksum avoids loading an archive into application memory.
      if(command('sha256sum',[archive]).split(/\s+/)[0]!==read(root+'/backups/foundation-'+backup+'.sha256').trim())throw Error('Backup checksum mismatch');
      const free=fs.statfsSync('.');if(free.bavail*free.bsize<1024**3)throw Error('Insufficient disk space');
      portalEnvironment(read('.app-staging.env'));
      const mounts=JSON.parse(docker('inspect','--format','{{json .Mounts}}',edge()));
      if(!mounts.some(m=>m.Destination==='/data'&&m.RW))throw Error('Certificate persistence unavailable');
      const proxyVersion=docker('exec',edge(),'caddy','version');
      if(!proxyVersion.startsWith('v2.11.7 ')||docker('inspect','--format','{{.Image}}',edge())!==expectedProxyId)throw Error('Proxy differs from the reviewed binary and digest');
      fs.mkdirSync(recovery,{mode:0o700});
      for(const name of saved)fs.copyFileSync(name,recovery+'/'+name);
      fs.copyFileSync(root+'/release.json',recovery+'/release.json');
      for(const name of ['.database.env','compose.yaml'])write(recovery+'/'+name+'.sha256',hash(read(name)));
      write(recovery+'/transition.json',JSON.stringify({phase:'prepared',image,revision,backup,previousImage:live.image,previousRevision:live.revision,proxyVersion,preparedAt:new Date().toISOString()},null,2)+'\n');
      changed=true;write('Caddyfile',maintenanceProxy(read('Caddyfile')));reload();
      if(https('jouw-driver.duckdns.org')!==200)throw Error('Legacy routing changed');
      console.log('TLS maintenance hosts prepared; legacy application unchanged. DNS may now point directly to the verified origin for ACME issuance.');return;
    }
    const transition=json(recovery+'/transition.json');
    if(transition.image!==image||transition.revision!==revision||transition.backup!==backup)throw Error('Prepared candidate differs');
    if(action==='activate'){
      if(transition.phase!=='prepared'||live.image!==transition.previousImage||live.revision!==transition.previousRevision)throw Error('Unexpected transition phase or live image');
      for(const host of newHosts)if(https(host)!==503)throw Error('Trusted origin TLS not ready');
      const free=fs.statfsSync('.');if(free.bavail*free.bsize<1024**3)throw Error('At least 1 GiB required after candidate pull');
      const labels=JSON.parse(docker('inspect','--format','{{json .Config.Labels}}',image));
      if(labels['org.opencontainers.image.revision']!==revision||labels['com.jouwdriver.portal-origin']!==portalOrigin)throw Error('Candidate image identity mismatch');
      const proxy=read(new URL('./Caddyfile.jouww.candidate',import.meta.url));
      if(!proxy.includes('header_up X-Real-IP {remote_host}')||!proxy.includes('header_up -Forwarded'))throw Error('Proxy header protection absent');
      changed=true;
      write('.app-staging.env',portalEnvironment(read('.app-staging.env')));
      write('private-app.yaml',replaceImage(read('private-app.yaml'),live.image,image));
      up();
      const id=app();
      if(docker('inspect','--format','{{.Config.Image}}',id)!==image||docker('inspect','--format','{{.HostConfig.ReadonlyRootfs}}',id)!=='true')throw Error('Candidate container verification failed');
      docker('exec',id,'node','scripts/preflight.mjs');docker('exec',id,'node','scripts/database-readiness.mjs');
      write('Caddyfile',proxy+secureHttpRoutes());reload();
      for(const host of ['jouw-driver.duckdns.org',...newHosts])if(https(host)!==200)throw Error('HTTPS acceptance failed');
      for(const host of ['jouw-driver.duckdns.org','app.jouww.com']){
        for(const origin of ['https://jouww.com','https://www.jouww.com'])if(https(host,'/next_api/auth/user',['Origin: '+origin])!==403)throw Error('Marketing origin accepted');
        if(https(host,'/next_api/auth/user',['Origin: '+oldOrigin])!==401)throw Error('Legacy client origin rejected');
      }
      for(const name of ['.database.env','compose.yaml'])if(hash(read(name))!==read(recovery+'/'+name+'.sha256'))throw Error('Protected runtime configuration changed');
      const state={...live,image,revision,previousImage:live.image,deployedAt:new Date().toISOString(),verifiedPrelaunchBackup:backup,domainOrigin:portalOrigin};
      for(const path of ['runtime-mode.json',root+'/release.json'])write(path,JSON.stringify(state,null,2)+'\n');
      write(recovery+'/transition.json',JSON.stringify({...transition,phase:'active',activatedAt:new Date().toISOString()},null,2)+'\n');
    }
    const current=agreement();if(current.image!==image||current.revision!==revision)throw Error('Live release identity mismatch');
    for(const host of ['jouw-driver.duckdns.org',...newHosts])if(https(host)!==200)throw Error('HTTPS verification failed');
    console.log(JSON.stringify({phase:'verified',image,revision,hosts:['jouw-driver.duckdns.org',...newHosts],recovery:'retained on origin; no database restore'},null,2));
  }catch(error){
    if(changed){try{restore();}catch{console.error('Automatic configuration rollback failed; recovery files retained on origin.');}}
    throw error;
  }finally{fs.rmdirSync(root+'/.deployment-lock');}
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])main(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
