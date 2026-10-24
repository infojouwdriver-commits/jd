import test from 'node:test';import assert from 'node:assert/strict';
import {stripeRuntimeFiles,checkedStripeSetup,enabledStripeEvents,stripeApiVersion,stripeRuntimeKeys} from '../configure-stripe.mjs';
test('private installer only changes allowlisted Stripe settings in the application service',()=>{
 const values=Object.fromEntries(stripeRuntimeKeys.map(k=>[k,'synthetic']));const env='APP_ORIGIN=https://app.jouww.com\nJWT_SECRET=synthetic\nSTRIPE_ENABLED=false\n';
 for(const compose of ['services:\n  app:\n    image: synthetic\n    env_file: [.app-staging.env]\n  db:\n    image: postgres:16\n','services:\n  app:\n    image: synthetic\n    environment:\n      JWT_SECRET: ${JWT_SECRET}\n  db:\n    image: postgres:16\n']){
  const r=stripeRuntimeFiles(env,compose,values);assert.match(r.env,/JWT_SECRET=synthetic/);assert.equal(r.env.match(/^STRIPE_ENABLED=/gm).length,1);assert.equal(r.compose.split('  db:')[1],compose.split('  db:')[1]);assert.equal(stripeRuntimeFiles(r.env,r.compose,values).env,r.env);
 }
 assert.throws(()=>stripeRuntimeFiles(env,'services:\n  db:\n',values));assert.throws(()=>stripeRuntimeFiles(env,'',{...values,JWT_SECRET:'changed'}));assert.throws(()=>stripeRuntimeFiles(env,'',{...values,STRIPE_SECRET_KEY:'injected\nX=1'}));
});
const hook={id:'we_synthetic',url:'https://app.jouww.com/next_api/webhooks/stripe',secret:'whsec_synthetic',status:'enabled',api_version:stripeApiVersion,enabled_events:enabledStripeEvents};
const price={active:true,livemode:true,currency:'eur',unit_amount:5000,tax_behavior:'inclusive',recurring:{interval:'month',interval_count:1},product:'prod_jouw_driver_platform_20261024'};
test('installer verifies merchant and inclusive price before creating a scoped signed webhook; no customer or payment calls',async()=>{
 const calls=[];let saved;const api=async(p,m='GET',body)=>{calls.push({p,m,body});if(p==='/account')return {id:'acct_1SilSIGxKLKWDAZ9',charges_enabled:true,payouts_enabled:true};if(p.startsWith('/prices/'))return price;if(p.startsWith('/tax_rates?'))return {data:[],has_more:false};if(p==='/tax_rates')return {id:'txr_synthetic'};if(p.startsWith('/webhook_endpoints?'))return {data:[],has_more:false};if(p==='/webhook_endpoints')return hook;throw Error('Unexpected API');};
 const v=await checkedStripeSetup(api,null,async s=>saved=s);assert.equal(v.STRIPE_WEBHOOK_SECRET,hook.secret);assert.equal(saved.endpoint,hook.id);assert.equal(calls.filter(c=>c.m==='POST').length,2);assert.equal(calls.find(c=>c.p==='/tax_rates').body.inclusive,true);assert.deepEqual(calls.find(c=>c.p==='/webhook_endpoints').body.enabled_events,enabledStripeEvents);
 const wrong=async(p,...args)=>p.startsWith('/prices/')?{...price,unit_amount:5001}:api(p,...args);await assert.rejects(checkedStripeSetup(wrong,null,async()=>{}),/price/);
 const account=async p=>({id:'acct_other',charges_enabled:true,payouts_enabled:true});await assert.rejects(checkedStripeSetup(account,null,async()=>{}),/merchant/);
});
test('existing callbacks require matching private signing-secret recovery; never disable or replace an unknown endpoint',async()=>{
 const api=async p=>p==='/account'?{id:'acct_1SilSIGxKLKWDAZ9',charges_enabled:true,payouts_enabled:true}:p.startsWith('/prices/')?price:p.startsWith('/tax_rates?')?{data:[{id:'txr_synthetic',metadata:{project:'jouw-driver'},active:true,livemode:true,inclusive:true,percentage:21,country:'BE'}]}:{data:[hook]};
 await assert.rejects(checkedStripeSetup(api,null,async()=>{}),/recovery/);const v=await checkedStripeSetup(api,{account:'acct_1SilSIGxKLKWDAZ9',endpoint:hook.id,secret:hook.secret},async()=>assert.fail('Must reuse persisted secret'));assert.equal(v.STRIPE_TAX_RATE_ID,'txr_synthetic');
});
