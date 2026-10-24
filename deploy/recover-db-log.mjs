// Explicitly authorized retirement of one Docker diagnostic log; never database files.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';

const PROJECT='jouw-driver';
const compose=['compose','--env-file','.database.env','--project-name',PROJECT,'--file','compose.yaml'];
const digest=b=>createHash('sha256').update(b).digest('hex');
const run=(cmd,args)=>execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:180000,maxBuffer:8*1024*1024}).trim();
const docker=(...args)=>run('docker',args);

export function planLogRecovery({state,release,container,config,raw,expected,imageId}) {
 if(!/^[a-f0-9]{40}$/.test(expected)||state.mode!=='public'||state.revision!==expected||release.revision!==expected||release.image!==state.image)throw Error('Live revision mismatch');
 const id=container.Id;
 if(!/^[a-f0-9]{64}$/.test(id)||!container.State?.Running||container.Config?.Labels?.['com.docker.compose.project']!==PROJECT||container.Config?.Labels?.['com.docker.compose.service']!=='db')throw Error('Exact running database container required');
 if(container.Config.Image!=='postgres:16.15-bookworm'||container.Image!==imageId||container.HostConfig?.LogConfig?.Type!=='json-file')throw Error('Unexpected database image or logging driver');
 const mounts=container.Mounts?.filter(m=>m.Destination==='/var/lib/postgresql/data');
 if(mounts?.length!==1||mounts[0].Type!=='volume'||mounts[0].Name!==PROJECT+'_database_data')throw Error('Expected named database volume required');
 const log='/var/lib/docker/containers/'+id+'/'+id+'-json.log';
 if(container.LogPath!==log)throw Error('Unexpected diagnostic log path');
 if(config.services?.db?.logging||!config.services?.db||raw.match(/^  db:\r?$/gm)?.length!==1)throw Error('Database logging configuration already changed');
 const next=raw.replace(/^  db:\r?$/m,'  db:\n    logging:\n      driver: json-file\n      options:\n        max-size: "10m"\n        max-file: "3"');
 return {id,log,volume:mounts[0].Name,next};
}

export function assertOnlyLoggingChanged(before,after) {
 const next=structuredClone(after);
 const logging=next.services?.db?.logging;
 if(logging?.driver!=='json-file'||String(logging.options?.['max-size'])!=='10m'||String(logging.options?.['max-file'])!=='3')throw Error('Bounded logging required');
 delete next.services.db.logging;
 if(!isDeepStrictEqual(before,next))throw Error('Configuration differs beyond database diagnostic logging');
}

export function recoverDatabaseLog(expected,confirmation) {
 if(confirmation!=='DISCARD_OLD_DATABASE_DIAGNOSTICS')throw Error('Explicit diagnostic retirement approval required');
 process.chdir('/srv/jouw-driver/foundation');
 const lock='/srv/jouw-driver/.deployment-lock';
 fs.mkdirSync(lock,{mode:0o700});
 let raw,changed=false,complete=false;
 try {
  const state=JSON.parse(fs.readFileSync('runtime-mode.json'));
  const release=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
  raw=fs.readFileSync('compose.yaml','utf8');
  const preserved=Object.fromEntries(['.database.env','.app-staging.env','Caddyfile','private-app.yaml'].map(p=>[p,digest(fs.readFileSync(p))]));
  const ids=docker(...compose,'ps','--quiet','db').split('\n').filter(Boolean);
  if(ids.length!==1)throw Error('Exactly one database service required');
  const old=JSON.parse(docker('inspect',ids[0]))[0];
  const imageId=JSON.parse(docker('image','inspect',old.Config.Image))[0].Id;
  const config=JSON.parse(docker(...compose,'config','--format','json'));
  const plan=planLogRecovery({state,release,container:old,config,raw,expected,imageId});
  const stat=run('sudo',['-n','stat','--format=%F:%s','--',plan.log]);
  if(!/^regular file:[0-9]+$/.test(stat)||Number(stat.split(':')[1])<10*1024**3)throw Error('Large regular Docker diagnostic log required');
  // Capture a bounded private sample in memory first; a full filesystem must not
  // require another large allocation on disk before the authorized retirement.
  const tail=execFileSync('sudo',['-n','tail','-c','1048576','--',plan.log],{timeout:10000,maxBuffer:2*1024*1024});
  const sample=gzipSync(tail);
  // Only this verified json-file log is retired. No volume/file-tree deletion.
  run('sudo',['-n','truncate','--size=0','--',plan.log]);
  const archive='/srv/jouw-driver/operations';
  fs.mkdirSync(archive,{mode:0o700,recursive:true});
  const tag=Date.now().toString();
  fs.writeFileSync(archive+'/db-diagnostic-tail-'+tag+'.gz',sample,{mode:0o600,flag:'wx'});
  fs.writeFileSync(archive+'/compose-before-log-rotation-'+tag+'.yaml',raw,{mode:0o600,flag:'wx'});
  fs.writeFileSync('compose.yaml',plan.next,{mode:0o600});changed=true;
  assertOnlyLoggingChanged(config,JSON.parse(docker(...compose,'config','--format','json')));
  docker(...compose,'up','-d','--no-deps','--force-recreate','--pull','never','--wait','--wait-timeout','120','db');
  const currentId=docker(...compose,'ps','--quiet','db');
  const current=JSON.parse(docker('inspect',currentId))[0];
  if(current.Image!==old.Image||current.State?.Health?.Status!=='healthy'||!current.Mounts.some(m=>m.Destination==='/var/lib/postgresql/data'&&m.Name===plan.volume))throw Error('Database image, volume or health recovery failed');
  const logging=current.HostConfig.LogConfig;
  if(logging.Type!=='json-file'||logging.Config?.['max-size']!=='10m'||logging.Config?.['max-file']!=='3')throw Error('Docker log bounds not active');
  if(docker('exec',currentId,'psql','-U','postgres','-d','jouw_driver','-Atq','-c','SELECT 1')!=='1')throw Error('Database SQL health failed');
  for(const [p,sha] of Object.entries(preserved))if(digest(fs.readFileSync(p))!==sha)throw Error('Preserved configuration changed');
  complete=true;
  console.log(JSON.stringify({diagnosticBytesRetired:Number(stat.split(':')[1]),retainedTailBytes:tail.length,logRotation:{maxSize:'10m',maxFiles:3},sameImage:true,sameDatabaseVolume:true,sqlHealthy:true,configurationPreserved:true}));
 } finally {
  try {
   if(changed&&!complete){
    fs.writeFileSync('compose.yaml',raw,{mode:0o600});
    docker(...compose,'up','-d','--no-deps','--pull','never','--wait','--wait-timeout','120','db');
   }
  } finally {fs.rmdirSync(lock);}
 }
}

if(process.argv[1]==='-')recoverDatabaseLog(process.argv[2],process.argv[3]);
