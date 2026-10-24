// Purpose-limited live installation: stdin secret, verified deployed revision, app restart only.
import fs from 'node:fs';import path from 'node:path';import {parseEnv} from 'node:util';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
export const stripeRuntimeKeys=['STRIPE_ENABLED','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_ACCOUNT_ID','STRIPE_PRICE_ID','STRIPE_TAX_RATE_ID'];
export const stripeApiVersion='2026-09-30.endive';
export const enabledStripeEvents=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','invoice.paid','invoice.payment_failed','invoice.payment_action_required','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','subscription_schedule.canceled','subscription_schedule.completed','subscription_schedule.aborted','charge.refunded','charge.dispute.created'];
const accountId='acct_1SilSIGxKLKWDAZ9',priceId='price_1UTuRPGxKLKWDAZ9P9es44o3',productId='prod_jouw_driver_platform_20261024',webhookUrl='https://app.jouww.com/next_api/webhooks/stripe';
export function stripeRuntimeFiles(text,compose,values){
 for(const [k,v] of Object.entries(values))if(!stripeRuntimeKeys.includes(k)||typeof v!=='string'||!v||/[\r\n'"\\]/.test(v))throw Error('Invalid private Stripe configuration');
 if(stripeRuntimeKeys.some(k=>!values[k]))throw Error('Incomplete Stripe configuration');
 const env=text.split(/\r?\n/).filter(line=>!stripeRuntimeKeys.some(k=>line.startsWith(k+'='))).join('\n').trimEnd()+'\n'+stripeRuntimeKeys.map(k=>k+'='+values[k]).join('\n')+'\n';
 const lines=compose.split('\n'),start=lines.findIndex(l=>/^  app:\s*$/.test(l));if(start<0)throw Error('Application service missing');
 let end=start+1;while(end<lines.length&&!/^  [a-zA-Z0-9_-]+:\s*$/.test(lines[end])&&!/^\S/.test(lines[end]))end++;
 let app=lines.slice(start,end).join('\n');
 if(!/^    env_file:\s*\[\s*\.app-staging\.env\s*\]\s*$/m.test(app)){
  if(!/^    environment:\s*$/m.test(app))throw Error('Reviewed app environment required');
  for(const k of stripeRuntimeKeys){const pattern=new RegExp('^      '+k+':.*$','m'),line='      '+k+': ${'+k+':?required}';app=pattern.test(app)?app.replace(pattern,line):app.replace(/^    environment:\s*$/m,'    environment:\n'+line);}
 }
 lines.splice(start,end-start,...app.split('\n'));return {env,compose:lines.join('\n')};
}
export async function checkedStripeSetup(api,previous,persist){
 const account=await api('/account');if(account.id!==accountId||account.charges_enabled!==true||account.payouts_enabled!==true)throw Error('Verified live merchant required');
 const price=await api('/prices/'+priceId);if(!price.active||!price.livemode||price.currency!=='eur'||price.unit_amount!==5000||price.tax_behavior!=='inclusive'||price.recurring?.interval!=='month'||price.recurring?.interval_count!==1||price.product!==productId)throw Error('Reviewed inclusive monthly price required');
 const rates=await api('/tax_rates?active=true&limit=100');if(rates.has_more)throw Error('Tax rate review required');
 let rate=rates.data.filter(r=>r.metadata?.project==='jouw-driver'&&r.active&&r.livemode&&r.inclusive&&r.percentage===21&&r.country==='BE');
 if(rate.length>1)throw Error('Tax rate identity ambiguous');
 if(!rate.length)rate=[await api('/tax_rates','POST',{display_name:'TVA',description:'JOUW DRIVER — TVA belge 21% incluse',percentage:21,inclusive:true,country:'BE',tax_type:'vat',metadata:{project:'jouw-driver'}},'jd-inclusive-vat21-v1')];
 const hooks=await api('/webhook_endpoints?limit=100');if(hooks.has_more)throw Error('Webhook review required');
 const found=hooks.data.filter(h=>h.url===webhookUrl);if(found.length>1)throw Error('Webhook identity ambiguous');
 let hook;
 if(found.length){hook=found[0];if(!previous||previous.endpoint!==hook.id||previous.account!==accountId||!/^whsec_[A-Za-z0-9]+$/.test(previous.secret||'')||hook.status!=='enabled'||hook.api_version!==stripeApiVersion||JSON.stringify([...hook.enabled_events].sort())!==JSON.stringify([...enabledStripeEvents].sort()))throw Error('Existing webhook requires private signing-secret recovery');}
 else{hook=await api('/webhook_endpoints','POST',{url:webhookUrl,description:'JOUW DRIVER automatic subscription reconciliation',enabled_events:enabledStripeEvents,api_version:stripeApiVersion,metadata:{project:'jouw-driver'}},'jd-live-billing-hook-v1');if(!/^whsec_[A-Za-z0-9]+$/.test(hook.secret||''))throw Error('Signing secret unavailable');previous={endpoint:hook.id,secret:hook.secret,account:accountId};await persist(previous);}
 return {STRIPE_ENABLED:'true',STRIPE_WEBHOOK_SECRET:previous.secret,STRIPE_ACCOUNT_ID:accountId,STRIPE_PRICE_ID:priceId,STRIPE_TAX_RATE_ID:rate[0].id};
}
function encoded(body){const form=new URLSearchParams();const add=(k,v)=>{if(v===null||v===undefined)return;if(Array.isArray(v))v.forEach((x,i)=>add(k+'['+i+']',x));else if(typeof v==='object')for(const [p,x]of Object.entries(v))add(k+'['+p+']',x);else form.append(k,String(v));};for(const [k,v]of Object.entries(body||{}))add(k,v);return form;}
async function main(){
 if(process.cwd()!=='/srv/jouw-driver/foundation')throw Error('Unexpected installation directory');
 const revision=process.argv[2];if(!/^[a-f0-9]{40}$/.test(revision||''))throw Error('Tested revision required');
 const state=JSON.parse(fs.readFileSync('runtime-mode.json')),release=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
 if(state.mode!=='public'||state.revision!==revision||release.revision!==revision||release.image!==state.image)throw Error('Tested Stripe release must already be live');
 let key='',size=0;for await(const chunk of process.stdin){size+=chunk.length;if(size>512)throw Error('Invalid credential size');key+=chunk.toString('utf8');}key=key.trim();if(!/^rk_live_[A-Za-z0-9]+$/.test(key))throw Error('Restricted live credential required');
 const oldEnv=fs.readFileSync('.app-staging.env','utf8'),oldCompose=fs.readFileSync('private-app.yaml','utf8'),env=parseEnv(oldEnv);
 if(env.APP_ORIGIN!=='https://app.jouww.com'||env.DEPLOYMENT_MODE!=='production')throw Error('Reviewed production origin required');
 const directory='/srv/jouw-driver/stripe-setup',privateState=directory+'/webhook.json';fs.mkdirSync(directory,{recursive:true,mode:0o700});
 const previous=fs.existsSync(privateState)?JSON.parse(fs.readFileSync(privateState)):null;
 fs.mkdirSync('/srv/jouw-driver/.deployment-lock');let written=false,stage='provider-validation';
 const compose=(...args)=>execFileSync('docker',['compose','--env-file','.app-staging.env','--project-name','jouw-driver','--file','private-app.yaml',...args],{stdio:['ignore','pipe','pipe'],timeout:210000}).toString();
 try{
  const api=async(endpoint,method='GET',body,idempotencyKey)=>{const r=await fetch('https://api.stripe.com/v1'+endpoint,{method,headers:{Authorization:'Bearer '+key,'Stripe-Version':stripeApiVersion,...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotencyKey?{'Idempotency-Key':idempotencyKey}:{})},...(body?{body:encoded(body)}:{}),signal:AbortSignal.timeout(20000)});if(!r.ok){console.error('Stripe setup '+stage+' HTTP '+r.status);throw Error('Provider configuration rejected');}return r.json();};
  const values={...await checkedStripeSetup(api,previous,async value=>{fs.writeFileSync(privateState,JSON.stringify(value),{mode:0o600,flag:'wx'});}),STRIPE_SECRET_KEY:key};
  const next=stripeRuntimeFiles(oldEnv,oldCompose,values);
  stage='runtime-write';fs.writeFileSync('.app-staging.env.stripe-next',next.env,{mode:0o600,flag:'wx'});fs.renameSync('.app-staging.env.stripe-next','.app-staging.env');written=true;fs.writeFileSync('private-app.yaml',next.compose,{mode:0o600});
  // Ensure only the allowlisted Stripe app environment differs from the previous Compose model.
  const model=JSON.parse(compose('config','--format','json'));
  fs.writeFileSync('private-app.yaml',oldCompose,{mode:0o600});fs.writeFileSync('.app-staging.env',oldEnv,{mode:0o600});
  const before=JSON.parse(compose('config','--format','json'));fs.writeFileSync('private-app.yaml',next.compose,{mode:0o600});fs.writeFileSync('.app-staging.env',next.env,{mode:0o600});
  for(const m of [model,before])for(const k of stripeRuntimeKeys)delete m.services.app.environment[k];
  if(JSON.stringify(model)!==JSON.stringify(before))throw Error('Unrelated Compose configuration changed');
  stage='app-restart';compose('up','-d','--no-deps','--wait','--wait-timeout','180','app');
  stage='notification-guard';const probe=await fetch(webhookUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',redirect:'error',signal:AbortSignal.timeout(15000)});if(probe.status!==400)throw Error('Unsigned notification guard failed');
  console.log('Restricted live key installed privately; exact EUR50 inclusive21% price and merchant verified; signed billing callback active. No customer charged.');
 }catch{if(written){fs.writeFileSync('.app-staging.env',oldEnv,{mode:0o600});fs.writeFileSync('private-app.yaml',oldCompose,{mode:0o600});try{compose('up','-d','--no-deps','--wait','--wait-timeout','180','app');}catch{console.error('Previous application requires operator recovery');}}throw Error('Stripe configuration failed at '+stage+'; credentials and provider responses withheld');}
 finally{fs.rmdirSync('/srv/jouw-driver/.deployment-lock');}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(()=>{console.error('Stripe installation did not complete; private credentials withheld.');process.exitCode=1;});
