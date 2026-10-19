// Reviewed, purpose-limited installation. Never prints a credential or provider response.
import fs from 'node:fs';import path from 'node:path';import {randomBytes} from 'node:crypto';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
import {parseEnv} from 'node:util';
let setupStage='runtime';
export const readMailRuntimeEnv=text=>parseEnv(text);
export async function readBrevoSetupResponse(response,endpoint,method){
 if(response.ok)return response.status===204?{}:response.json();
 const error=await response.json().catch(()=>null);
 // An account without legacy webhook records can return document_not_found as HTTP 400.
 // Treat only this exact collection-read result as empty, never authentication or parameter failures.
 if(endpoint==='/webhooks?type=transactional'&&method==='GET'&&[400,404].includes(response.status)&&error?.code==='document_not_found')return {webhooks:[]};
 const rejected=Error('Provider configuration rejected');rejected.setupReason=['document_not_found','invalid_parameter','unauthorized','permission_denied'].includes(error?.code)?error.code:'provider_rejected';throw rejected;
}
export const mailRuntimeKeys=['MAIL_PROVIDER','BREVO_API_KEY','BREVO_FROM_EMAIL','BREVO_SENDER_VERIFIED','BREVO_FREE_PLAN_CONFIRMED','BREVO_WEBHOOK_TOKEN'];
export function mailRuntimeFiles(envText,compose,key,sender,token){
 if(typeof key!=='string'||key.length<32||key.length>512||/[\r\n\0]/.test(key)||sender!=='jouw2023@gmail.com'||!/^[a-f0-9]{64}$/.test(token))throw Error('Invalid mail configuration');
 const values={MAIL_PROVIDER:'brevo',BREVO_API_KEY:key,BREVO_FROM_EMAIL:sender,BREVO_SENDER_VERIFIED:'true',BREVO_FREE_PLAN_CONFIRMED:'true',BREVO_WEBHOOK_TOKEN:token};
 const lines=envText.split('\n').filter(line=>!mailRuntimeKeys.includes(line.split('=')[0]));
 const updatedEnv=lines.join('\n').trimEnd()+'\n'+mailRuntimeKeys.map(k=>k+'='+values[k]).join('\n')+'\n';
 const parts=compose.split('\n'),start=parts.findIndex(line=>/^  app:\s*$/.test(line));if(start<0)throw Error('Application service required');
 let end=start+1;while(end<parts.length&&(!parts[end].trim()||/^ {4}/.test(parts[end])))end++;
 let app=parts.slice(start,end).join('\n');
 if(!/^    env_file:\s*\[\s*\.app-staging\.env\s*\]\s*$/m.test(app)){
  if(!/^    environment:\s*$/m.test(app))throw Error('Application environment required');
  for(const name of mailRuntimeKeys){const pattern=new RegExp('^      '+name+':.*$','m');const line='      '+name+': ${'+name+':?required}';app=pattern.test(app)?app.replace(pattern,line):app.replace(/^    environment:\s*$/m,'    environment:\n'+line);}
 }
 parts.splice(start,end-start,...app.split('\n'));return {env:updatedEnv,compose:parts.join('\n')};
}
export async function checkedBrevoSetup(api,token){
 const account=await api('/account');
 if(!account.plan?.some(p=>p.type==='free')||account.plan.some(p=>['subscription','payAsYouGo'].includes(p.type)))throw Error('Free plan required');
 const senders=await api('/senders');
 if(!senders.senders?.some(s=>s.email?.toLowerCase()==='jouw2023@gmail.com'&&s.active===true))throw Error('Verified sender required');
 const url='https://jouw-driver.duckdns.org/next_api/webhooks/brevo',description='JOUW DRIVER delivery status';
 const hooks=await api('/webhooks?type=transactional');const found=hooks.webhooks?.filter(w=>w.url===url)||[];
 if(found.length>1||found.some(w=>w.description!==description))throw Error('Existing webhook requires review');
 const body={url,description,type:'transactional',batched:false,events:['request','delivered','hardBounce','softBounce','blocked','spam','invalid','deferred'],auth:{type:'bearer',token}};
 await api(found.length?'/webhooks/'+found[0].id:'/webhooks',found.length?'PUT':'POST',body);
}
async function main(){
 const root='/srv/jouw-driver/foundation';if(process.cwd()!==root)throw Error('Unexpected runtime');
 const revision=process.argv[2],sender=process.argv[3];if(!/^[a-f0-9]{40}$/.test(revision||'')||sender!=='jouw2023@gmail.com')throw Error('Reviewed release and sender required');
 const state=JSON.parse(fs.readFileSync('runtime-mode.json')),release=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
 if(state.mode!=='public'||state.revision!==revision||release.revision!==revision||state.image!==release.image)throw Error('Tested mail release must be live');
 setupStage='credential_read';
 const chunks=[];for await(const chunk of process.stdin){chunks.push(chunk);if(chunks.reduce((n,c)=>n+c.length,0)>1024)throw Error('Invalid credential size');}
 setupStage='runtime_files';
 const key=Buffer.concat(chunks).toString('utf8').trim();const oldEnv=fs.readFileSync('.app-staging.env','utf8'),oldCompose=fs.readFileSync('private-app.yaml','utf8');
 const existing=readMailRuntimeEnv(oldEnv);setupStage='runtime_environment';
 if(existing.APP_ORIGIN!=='https://jouw-driver.duckdns.org'||existing.DEPLOYMENT_MODE!=='production')throw Error('Reviewed runtime required');
 if(existing.BREVO_API_KEY&&existing.BREVO_API_KEY!==key)throw Error('Credential rotation requires separate review');
 setupStage='compose_configuration';
 const token=existing.BREVO_WEBHOOK_TOKEN||randomBytes(32).toString('hex');const next=mailRuntimeFiles(oldEnv,oldCompose,key,sender,token);
 setupStage='deployment_lock';
 fs.mkdirSync('/srv/jouw-driver/.deployment-lock');let written=false;
 const compose=(...args)=>execFileSync('docker',['compose','--env-file','.app-staging.env','--project-name','jouw-driver','--file','private-app.yaml',...args],{stdio:['ignore','pipe','pipe'],timeout:210000}).toString().trim();
 try{
  const api=async(endpoint,method='GET',body)=>{setupStage=endpoint==='/account'?'provider_account':endpoint==='/senders'?'provider_sender':method==='GET'?'provider_webhook_read':'provider_webhook_write';const response=await fetch('https://api.brevo.com/v3'+endpoint,{method,headers:{'api-key':key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});try{return await readBrevoSetupResponse(response,endpoint,method);}catch(error){console.error('Mail setup '+setupStage+' HTTP '+response.status+' '+(error.setupReason||'invalid_response'));throw Error('Provider configuration rejected');}};
  await checkedBrevoSetup(api,token);
  setupStage='runtime_write';
  fs.writeFileSync('.app-staging.env.mail-next',next.env,{mode:0o600,flag:'wx'});fs.renameSync('.app-staging.env.mail-next','.app-staging.env');written=true;
  fs.writeFileSync('private-app.yaml',next.compose,{mode:0o600});
  setupStage='application_restart';
  compose('up','-d','--wait','--wait-timeout','180','app');const app=compose('ps','-q','app');
  setupStage='application_preflight';
  execFileSync('docker',['exec',app,'node','scripts/preflight.mjs'],{stdio:['ignore','pipe','pipe'],timeout:30000});
  console.log('Verified free plan and sender; mail credentials installed privately; authenticated delivery callback configured. No test email sent.');
 }catch{
  if(written){fs.writeFileSync('.app-staging.env',oldEnv,{mode:0o600});fs.writeFileSync('private-app.yaml',oldCompose,{mode:0o600});try{compose('up','-d','--wait','--wait-timeout','180','app');}catch{console.error('Previous application requires operator recovery.');}}
  throw Error('Mail configuration failed; credentials and provider responses withheld.');
 }finally{fs.rmdirSync('/srv/jouw-driver/.deployment-lock');}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(()=>{console.error('Mail setup did not complete at '+setupStage+'; credentials and provider responses withheld.');process.exitCode=1;});
