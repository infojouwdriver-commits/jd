import {createSign,createDecipheriv} from 'node:crypto';
export function decryptPushToken(value,installationId,key){
 if(!/^[a-f0-9]{64}$/i.test(key||'')||!value.startsWith('enc:v1:'))throw Error('Push encryption unavailable');
 const parts=value.slice(7).split('.');if(parts.length!==3)throw Error('Invalid ciphertext');
 const [iv,tag,data]=parts.map(v=>Buffer.from(v,'base64url'));
 if(iv.length!==12||tag.length!==16)throw Error('Invalid ciphertext');
 const cipher=createDecipheriv('aes-256-gcm',Buffer.from(key,'hex'),iv);cipher.setAAD(Buffer.from(`native_push:${installationId}`));cipher.setAuthTag(tag);
 return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8');
}
const copy={ar:['لديك تحديث جديد في JOUW DRIVER','افتح التطبيق للاطلاع عليه.'],fr:['Nouvelle information JOUW DRIVER','Ouvrez l’application pour la consulter.'],nl:['Nieuw bericht van JOUW DRIVER','Open de app om het te bekijken.'],en:['New JOUW DRIVER update','Open the app to view it.']};
export function fcmPayload(job,token){
 if(!/^[0-9a-f-]{36}$/i.test(job.id)||!['message','notification','test'].includes(job.source_kind))throw Error('Invalid push job');
 const [title,body]=copy[job.language]||copy.ar;
 return {message:{token,notification:{title:job.source_kind==='test'?'JOUW DRIVER ✓':title,body},data:{job_id:job.id,kind:job.source_kind,screen:job.source_kind==='message'?'messages':'notifications'},android:{priority:'HIGH',ttl:'300s',collapse_key:'jouw-driver-'+job.source_kind,notification:{channel_id:'jouw-driver',tag:job.id,sound:'default'}}}};
}
export function serviceAccount(raw){
 const account=JSON.parse(Buffer.from(raw||'','base64').toString('utf8'));
 if(account.project_id!=='jouw-driver'||account.type!=='service_account'||!account.client_email?.endsWith('@jouw-driver.iam.gserviceaccount.com')||typeof account.private_key!=='string')throw Error('FCM service account unavailable');
 return account;
}
export async function fcmAccessToken(account,transport=fetch){
 const now=Math.floor(Date.now()/1000),b64=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const unsigned=b64({alg:'RS256',typ:'JWT'})+'.'+b64({iss:account.client_email,scope:'https://www.googleapis.com/auth/firebase.messaging',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const assertion=unsigned+'.'+createSign('RSA-SHA256').update(unsigned).sign(account.private_key,'base64url');
 const r=await transport('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(15000)});
 const result=await r.json();if(!r.ok||typeof result.access_token!=='string')throw Error('FCM authorization unavailable');
 return result.access_token;
}
export async function sendFcm(job,token,access,transport=fetch){
 const r=await transport('https://fcm.googleapis.com/v1/projects/jouw-driver/messages:send',{method:'POST',headers:{Authorization:`Bearer ${access}`,'Content-Type':'application/json'},body:JSON.stringify(fcmPayload(job,token)),signal:AbortSignal.timeout(15000)});
 let result;try{result=await r.json();}catch{return {state:'pending',invalid:false};}
 if(r.ok&&typeof result.name==='string'&&result.name.startsWith('projects/jouw-driver/messages/'))return {state:'accepted',provider:result.name,invalid:false};
 const codes=(result.error?.details||[]).map(v=>v.errorCode);
 // INVALID_ARGUMENT alone may describe a bad payload; it must not disable a valid token.
 const invalid=codes.includes('UNREGISTERED');
 return {state:invalid?'failed':r.status===429||r.status>=500||r.status===401||r.status===403?'pending':'failed',invalid};
}
