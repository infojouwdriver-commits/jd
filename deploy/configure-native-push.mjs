import fs from 'node:fs';import path from 'node:path';import {generateKeyPairSync} from 'node:crypto';
import {openPushCredential} from './native-push-envelope.mjs';
const root='/srv/jouw-driver/foundation',dir=path.join(root,'.push-transfer');
if(process.cwd()!==root)throw Error('Unexpected push configuration directory');
fs.mkdirSync(dir,{recursive:true,mode:0o700});
const mode=process.argv[2];
if(mode==='prepare'){
 if(!fs.existsSync(path.join(dir,'private.pem'))){const keys=generateKeyPairSync('rsa',{modulusLength:3072,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});fs.writeFileSync(path.join(dir,'private.pem'),keys.privateKey,{mode:0o600,flag:'wx'});fs.writeFileSync(path.join(dir,'public.pem'),keys.publicKey,{mode:0o600,flag:'wx'});}
 console.log('PUSH_TRANSPORT_PUBLIC_KEY='+Buffer.from(fs.readFileSync(path.join(dir,'public.pem'))).toString('base64'));
}else if(mode==='activate'){
 const revision=process.argv[3],release=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
 if(!/^[a-f0-9]{40}$/.test(revision)||release.revision!==revision||release.pushMigration!=='20261016_native_push'||!/^ghcr\.io\/infojouwdriver-commits\/jd@sha256:[a-f0-9]{64}$/.test(release.image))throw Error('Tested push release must be live before activation');
 const envelope=JSON.parse(fs.readFileSync(path.join(dir,'credential.sealed.json')));
 const account=JSON.parse(openPushCredential(envelope,fs.readFileSync(path.join(dir,'private.pem'))).toString('utf8'));
 if(account.type!=='service_account'||account.project_id!=='jouw-driver'||account.client_email!=='jouw-driver-push@jouw-driver.iam.gserviceaccount.com'||typeof account.private_key!=='string')throw Error('Unexpected FCM identity');
 let env=fs.readFileSync('.app-staging.env','utf8');if(/^FCM_SERVICE_ACCOUNT_B64=/m.test(env))throw Error('An FCM credential already exists; review before rotation');
 const encoded=Buffer.from(JSON.stringify(account)).toString('base64');
 env=env.trimEnd()+'\nFCM_PROJECT_ID=jouw-driver\nFCM_SERVICE_ACCOUNT_B64='+encoded+'\n';
 // Do not share unrelated Chiron, mail or database-administrator secrets with the worker.
 const wanted=['FCM_PROJECT_ID','FCM_SERVICE_ACCOUNT_B64','JWT_SECRET','SCHEMA_ADMIN_USER','POSTGREST_URL','POSTGREST_SCHEMA','POSTGREST_API_KEY','DATA_ENCRYPTION_KEY'];
 const lines=env.split('\n').filter(line=>wanted.includes(line.split('=')[0]));
 for(const key of wanted.filter(key=>key!=='POSTGREST_API_KEY'))if(!lines.some(line=>line.startsWith(key+'=')&&line.length>key.length+1))throw Error('Worker setting missing');
 fs.writeFileSync('.push-worker.env',lines.join('\n')+'\n',{mode:0o600});
 const compose=`services:
  push:
    image: ${release.image}
    command: [node, scripts/push-worker.mjs]
    restart: unless-stopped
    init: true
    env_file:
      - path: .push-worker.env
        format: raw
    networks: [database]
    read_only: true
    tmpfs: [/tmp]
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    mem_limit: 128m
    logging:
      options: {max-size: "2m", max-file: "2"}
networks:
  database: {external: true, name: jouw-driver_database}
`;
 fs.writeFileSync('push-worker.yaml',compose,{mode:0o600});
 fs.writeFileSync('.app-staging.env.before-push',fs.readFileSync('.app-staging.env'),{mode:0o600,flag:'wx'});
 fs.writeFileSync('.app-staging.env.push-new',env,{mode:0o600,flag:'wx'});fs.renameSync('.app-staging.env.push-new','.app-staging.env');

 console.log('Push sender configuration prepared privately; no credentials in output.');
}else throw Error('Unknown push configuration mode');
