// Explicit, opt-in provider acceptance. Synthetic data only, isolated test credentials only.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID,createHash} from 'node:crypto';import Stripe from 'stripe';
import {finiteSchedule,stripeCycleAt,verifiedStripeReceipt} from '../src/lib/stripe-billing-core.ts';
const credentialFile=process.env.STRIPE_QA_CREDENTIALS,qa=process.env.STRIPE_QA_DIRECTORY;
if(!credentialFile||!qa)throw Error('Private isolated sandbox credentials and output directory required');
if(process.env.STRIPE_QA_NO_CLOCK==='true'&&process.env.STRIPE_QA_SMOKE!=='true')throw Error('A smoke test cannot certify the full subscription lifecycle');
const credentials=JSON.parse(fs.readFileSync(credentialFile,'utf8'));
if(!/^(?:rkcs|rk|sk)_test_[A-Za-z0-9]+$/.test(credentials.secret_key||'')||!/^acct_[A-Za-z0-9]+$/.test(credentials.account_id||''))throw Error('Only isolated test keys accepted');
fs.mkdirSync(qa,{recursive:true,mode:0o700});const stateFile=path.join(qa,'state.json');
const state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile)): {run:randomUUID(),account:credentials.account_id,scenarios:{}};
assert.equal(state.account,credentials.account_id);
const save=()=>fs.writeFileSync(stateFile,JSON.stringify(state,null,2),{mode:0o600});
const stripe=new Stripe(credentials.secret_key,{apiVersion:'2026-09-30.endive',httpClient:Stripe.createFetchHttpClient(),maxNetworkRetries:2,timeout:20000});
const options=name=>({idempotencyKey:'jd-qa-'+state.run+'-'+name});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const id=v=>typeof v==='string'?v:v?.id;
let stage='account';
async function advance(clock,time){
 let c=await stripe.testHelpers.testClocks.retrieve(clock);
 if(c.frozen_time<time&&c.status==='ready')c=await stripe.testHelpers.testClocks.advance(clock,{frozen_time:time});
 for(let n=0;n<100&&c.status==='advancing';n++){await pause(400);c=await stripe.testHelpers.testClocks.retrieve(clock);}
 assert.equal(c.status,'ready');return c;
}
async function bootstrap(){
 // Claimable sandbox keys intentionally cannot read Account administration.
 // Their test-only scope and the CLI provisioning result bind this isolated QA account.
 if(!credentials.secret_key.startsWith('rkcs_test_')){const account=await stripe.accounts.retrieve();assert.equal(account.id,credentials.account_id);}
 stage='catalog';
 if(!state.product){const p=await stripe.products.create({name:'Synthetic JOUW DRIVER QA — never live',metadata:{project:'jouw-driver-qa'}},options('product'));assert.equal(p.livemode,false);state.product=p.id;save();}
 if(!state.price){const p=await stripe.prices.create({product:state.product,unit_amount:5000,currency:'eur',tax_behavior:'inclusive',recurring:{interval:'month'}},options('price'));assert.equal(p.livemode,false);state.price=p.id;save();}
 if(!state.tax){const t=await stripe.taxRates.create({display_name:'TVA',percentage:21,inclusive:true,country:'BE',tax_type:'vat',metadata:{project:'jouw-driver-qa'}},options('tax'));assert.equal(t.livemode,false);state.tax=t.id;save();}
 stage='checkout';
 if(!state.checkoutCustomer){state.checkoutCustomer=(await stripe.customers.create({name:'Synthetic Checkout QA',email:'qa@example.invalid'},options('checkout-customer'))).id;save();}
 if(!state.checkout){const c=await stripe.checkout.sessions.create({mode:'setup',currency:'eur',customer:state.checkoutCustomer,client_reference_id:state.run,setup_intent_data:{metadata:{enrollment_id:state.run}},metadata:{enrollment_id:state.run},integration_identifier:'jouw_driver_qa_abcdefgh',custom_text:{submit:{message:'Synthetic test only. 50 EUR TTC par mois, 12 mensualités maximum, sans renouvellement automatique.'}},success_url:'https://app.jouww.com/company/dashboard?billing=stripe_pending',cancel_url:'https://app.jouww.com/company/dashboard?billing=stripe_cancelled'},options('checkout'));assert.equal(c.livemode,false);state.checkout=c.id;state.checkoutUrl=c.url;save();}
 console.log('Sandbox catalog and hosted Checkout parameters accepted; no live resources used.');
}
async function scenario(name,start,end,payment='pm_card_visa'){
 const noClock=process.env.STRIPE_QA_NO_CLOCK==='true';
 const s=state.scenarios[name]||{enrollment:randomUUID(),start,end,step:0};state.scenarios[name]=s;save();
 stage=name+'-clock';if(!noClock&&!s.clock){const c=await stripe.testHelpers.testClocks.create({frozen_time:start,name:'JOUW DRIVER synthetic '+name},options(name+'-clock'));assert.equal(c.livemode,false);s.clock=c.id;save();}
 if(!s.customer){const c=await stripe.customers.create({name:'Synthetic '+name,email:'qa@example.invalid',...(!noClock?{test_clock:s.clock}:{})},options(name+'-customer'));assert.equal(c.livemode,false);s.customer=c.id;save();}
 stage=name+'-authorization';if(!s.payment){const setup=await stripe.setupIntents.create({customer:s.customer,payment_method:payment,confirm:true,usage:'off_session',automatic_payment_methods:{enabled:true,allow_redirects:'never'}},options(name+'-setup'));assert.equal(setup.livemode,false);assert.equal(setup.status,'succeeded');s.payment=id(setup.payment_method);save();}
 const enrollment={id:s.enrollment,customer_id:s.customer,session_id:state.checkout,price_id:state.price,tax_rate_id:state.tax,end_at:end,livemode:false};
 stage=name+'-schedule';if(!s.schedule){const r=await stripe.subscriptionSchedules.create(finiteSchedule(enrollment,s.payment,start),options(name+'-schedule'));assert.equal(r.livemode,false);s.schedule=r.id;s.subscription=id(r.subscription);save();}
 enrollment.subscription_id=s.subscription;
 stage=name+'-first-invoice';let sub=await stripe.subscriptions.retrieve(s.subscription,{expand:['latest_invoice']});let invoice=typeof sub.latest_invoice==='object'?sub.latest_invoice:await stripe.invoices.retrieve(sub.latest_invoice);
 if(invoice.status==='draft')invoice=await stripe.invoices.finalizeInvoice(invoice.id,{auto_advance:true},options(name+'-finalize'));
 if(!noClock)await advance(s.clock,start+7200);
 else{for(let n=0;n<12;n++){const fresh=await stripe.invoices.retrieve(invoice.id);if(fresh.status==='paid')break;await pause(500);}const fresh=await stripe.invoices.retrieve(invoice.id);if(fresh.status==='open')await stripe.invoices.pay(fresh.id,{},options(name+'-sandbox-only-pay'));}
 const invoices=(await stripe.invoices.list({customer:s.customer,subscription:s.subscription,limit:100})).data;
 console.log(JSON.stringify({scenario:name,stage:'first-payment',invoices:invoices.map(i=>({status:i.status,total:i.total,paid:i.amount_paid}))}));
 if(name==='failure'){assert.ok(invoices.some(i=>i.status==='open'&&i.amount_paid===0));s.failed=true;save();return;}
 for(const paid of invoices.filter(i=>i.status==='paid'))await verifiedStripeReceipt(stripe,paid,enrollment);
 if(process.env.STRIPE_QA_SMOKE==='true'){s.summary={scope:'initial-payment-only',count:invoices.length,paid:invoices.filter(i=>i.status==='paid').length,sum:invoices.reduce((n,i)=>n+i.amount_paid,0)};save();return;}
 // Advance monthly, then settle the asynchronous invoice cycle. Never jump >2 billing intervals.
 for(let n=s.step;n<14;n++){
  stage=name+'-cycle-'+n;
  const scheduleEnd=stripeCycleAt(start,12);
  const target=Math.min(stripeCycleAt(start,n+1)+7200,scheduleEnd+86400);
  await advance(s.clock,target);s.step=n+1;save();console.log(JSON.stringify({scenario:name,completed_cycle:n+1}));if(target>=scheduleEnd+86400)break;
 }
 const all=(await stripe.invoices.list({customer:s.customer,subscription:s.subscription,limit:100})).data;
 const final=await stripe.subscriptions.retrieve(s.subscription),schedule=await stripe.subscriptionSchedules.retrieve(s.schedule);
 s.summary={count:all.length,paid:all.filter(i=>i.status==='paid').length,totals:all.map(i=>i.total),sum:all.reduce((n,i)=>n+i.amount_paid,0),subscription_status:final.status,schedule_status:schedule.status};save();console.log(JSON.stringify({scenario:name,...s.summary}));
 assert.equal(all.length,12);assert.ok(all.every(i=>i.status==='paid'&&i.total===5000&&i.amount_paid===5000));assert.equal(s.summary.sum,60000);assert.equal(final.status,'canceled');assert.ok(all.every(i=>i.lines.data.every(l=>l.period.start<end)),'All twelve installment due dates stay inside the legal contract');
 for(const paid of all)await verifiedStripeReceipt(stripe,paid,enrollment);
}
try{
 await bootstrap();
 if(process.env.STRIPE_QA_NO_CLOCK==='true')await scenario('initial-payment',Math.floor(Date.now()/1000),Math.floor(Date.now()/1000)+365*86400);
 else await scenario('month-end',Date.parse('2026-01-31T12:00:00Z')/1000,Date.parse('2027-01-30T23:00:00Z')/1000);
 if(process.env.STRIPE_QA_SMOKE!=='true'){
  await scenario('late-first-period',Date.parse('2026-02-27T12:00:00Z')/1000,Date.parse('2027-01-30T23:00:00Z')/1000);
  await scenario('failure',Date.parse('2026-04-01T12:00:00Z')/1000,Date.parse('2027-03-31T22:00:00Z')/1000,'pm_card_chargeCustomerFail');
 }
 const proof={passed:process.env.STRIPE_QA_SMOKE!=='true',account:state.account,created_at:new Date().toISOString(),core_sha256:createHash('sha256').update(fs.readFileSync('src/lib/stripe-billing-core.ts')).digest('hex'),scenarios:Object.fromEntries(Object.entries(state.scenarios).map(([k,v])=>[k,v.summary||{failed_payment_confirmed:v.failed===true}]))};
 fs.writeFileSync(path.join(qa,'proof.json'),JSON.stringify(proof,null,2),{mode:0o600});
}catch(error){console.error(JSON.stringify({passed:false,stage,type:error.type,code:error.code,param:error.param,message:String(error.message).replace(/(?:rkcs|[sr]k|pk)_(?:test|live)_[A-Za-z0-9]+/g,'[REDACTED]').slice(0,500)}));process.exitCode=1;}
