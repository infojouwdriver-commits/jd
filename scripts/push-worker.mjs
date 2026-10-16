import {createHmac} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {serviceAccount,fcmAccessToken,sendFcm,decryptPushToken} from './push-fcm.mjs';
const e=process.env,account=serviceAccount(e.FCM_SERVICE_ACCOUNT_B64);
if(e.FCM_PROJECT_ID!=='jouw-driver'||!e.JWT_SECRET||!e.SCHEMA_ADMIN_USER||!e.POSTGREST_URL)throw Error('Push worker configuration unavailable');
const origin=new URL(e.POSTGREST_URL);if(!['http:','https:'].includes(origin.protocol)||origin.username||origin.password)throw Error('Invalid database gateway');
let running=true;process.on('SIGTERM',()=>{running=false;});process.on('SIGINT',()=>{running=false;});
let access='',refreshAt=0;
function jwt(){const now=Math.floor(Date.now()/1000),b64=v=>Buffer.from(JSON.stringify(v)).toString('base64url');const body=b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:'0',role:e.SCHEMA_ADMIN_USER,iat:now,exp:now+120,aud:'jouw-driver'});return body+'.'+createHmac('sha256',e.JWT_SECRET).update(body).digest('base64url');}
async function rpc(name,body={}){const r=await fetch(e.POSTGREST_URL.replace(/\/$/,'')+'/rpc/'+name,{method:'POST',headers:{Authorization:'Bearer '+jwt(),'Content-Type':'application/json','Content-Profile':e.POSTGREST_SCHEMA||'public',...(e.POSTGREST_API_KEY?{'Postgrest-API-Key':e.POSTGREST_API_KEY}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Push queue unavailable');return r.status===204?null:r.json();}
if(process.argv.includes('--check')){await fcmAccessToken(account);if(await rpc('security_native_push_ready')!==true)throw Error('Push schema unavailable');console.log('FCM authorization and protected push queue ready');process.exit(0);}
while(running){
 try{
  if(Date.now()>refreshAt){access=await fcmAccessToken(account);refreshAt=Date.now()+45*60*1000;}
  const jobs=await rpc('security_claim_native_push');
  for(const job of jobs){
   if(!running)break;
   let result={state:'cancelled',invalid:false};
   if(job.authorized){try{result=await sendFcm(job,decryptPushToken(job.encrypted_token,job.installation_id,e.DATA_ENCRYPTION_KEY),access);}catch{result={state:'pending',invalid:false};}}
   await rpc('security_finish_native_push',{p_id:job.id,p_lease:job.lease_id,p_state:result.state,p_provider:result.provider||null,p_invalid:result.invalid});
   // Logs contain status only; tokens, users, payloads and provider responses stay private.
   console.log('Push queue result:',result.state);
  }
 }catch{console.error('Push worker temporarily unavailable');}
 if(running)await delay(5000);
}
