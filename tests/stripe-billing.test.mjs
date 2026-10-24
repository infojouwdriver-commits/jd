import test from 'node:test';import assert from 'node:assert/strict';import Stripe from 'stripe';
import {finiteSchedule,assertStripeInvoice,verifiedStripeReceipt,stripePaymentRequest,stripeConfiguration} from '../src/lib/stripe-billing-core.ts';
const e={id:'synthetic',customer_id:'cus_synthetic',session_id:'cs_synthetic',subscription_id:'sub_synthetic',price_id:'price_synthetic',tax_rate_id:'txr_synthetic',end_at:Math.floor(Date.now()/1000)+31536000,livemode:false};
const invoice=()=>({id:'in_synthetic',livemode:false,customer:e.customer_id,parent:{subscription_details:{subscription:e.subscription_id}},currency:'eur',status:'paid',total:5000,amount_due:5000,amount_paid:5000,amount_remaining:0,discounts:[],status_transitions:{paid_at:Math.floor(Date.now()/1000)},lines:{has_more:false,data:[{amount:5000,quantity:1,pricing:{price_details:{price:e.price_id}},parent:{subscription_item_details:{proration:false}},period:{start:Math.floor(Date.now()/1000)},taxes:[{amount:868,tax_behavior:'inclusive',tax_rate_details:{tax_rate:e.tax_rate_id}}]}]}});
test('finite schedule cancels at signed contract end, uses inclusive manual tax and never renews',()=>{const s=finiteSchedule(e,'pm_synthetic');assert.equal(s.end_behavior,'cancel');assert.equal(s.phases.length,1);assert.equal(s.phases[0].end_date,e.end_at);assert.equal(s.phases[0].proration_behavior,'none');assert.deepEqual(s.phases[0].default_tax_rates,[e.tax_rate_id]);assert.equal(s.default_settings.default_payment_method,'pm_synthetic');assert.equal(s.payment_method_types,undefined);assert.equal(s.automatic_tax,undefined);assert.throws(()=>finiteSchedule({...e,end_at:1},'pm_synthetic'));});
test('receipt requires exact owned invoice, correct price, tax and full amount; redirects or status alone cannot settle',()=>{
 assertStripeInvoice(invoice(),e);
 for(const patch of [{livemode:true},{customer:'cus_other'},{currency:'usd'},{amount_paid:0},{total:5001},{amount_due:0},{status:'open'},{discounts:[{id:'di_synthetic'}]},{parent:{subscription_details:{subscription:'sub_other'}}}])assert.throws(()=>assertStripeInvoice({...invoice(),...patch},e));
 for(const change of [v=>v.lines.has_more=true,v=>v.lines.data.push(v.lines.data[0]),v=>v.lines.data[0].quantity=2,v=>v.lines.data[0].taxes[0].amount=0,v=>v.lines.data[0].parent.subscription_item_details.proration=true,v=>v.lines.data[0].pricing.price_details.price='price_other']){const v=invoice();change(v);assert.throws(()=>assertStripeInvoice(v,e));}
});
test('paid outside Stripe, credited balance, refunded or disputed payments do not become valid receipts',async()=>{
 const payment={livemode:false,status:'succeeded',customer:e.customer_id,currency:'eur',amount:5000,amount_received:5000,latest_charge:{id:'ch_synthetic',refunded:false,amount_refunded:0,disputed:false}};
 const mock=(intent=payment,paid={amount_paid:5000,currency:'eur',livemode:false,payment:{type:'payment_intent',payment_intent:'pi_synthetic'}})=>({invoicePayments:{list:async()=>({data:[paid],has_more:false})},paymentIntents:{retrieve:async()=>intent}});
 const r=await verifiedStripeReceipt(mock(),invoice(),e);assert.equal(r.amount,5000);assert.equal(r.request,stripePaymentRequest('in_synthetic'));
 for(const patch of [{status:'processing'},{amount_received:0},{customer:'cus_other'},{latest_charge:{...payment.latest_charge,disputed:true}},{latest_charge:{...payment.latest_charge,amount_refunded:5000}}])await assert.rejects(verifiedStripeReceipt(mock({...payment,...patch}),invoice(),e));
 await assert.rejects(verifiedStripeReceipt(mock(payment,{payment:{type:'payment_record'}}),invoice(),e));
});
test('Stripe SDK validates raw body signatures, expiry and signing-key mismatch',()=>{
 const stripe=new Stripe('synthetic'),secret='whsec_synthetic',body=JSON.stringify({id:'evt_synthetic',livemode:false,type:'invoice.paid',data:{object:invoice()}});
 const header=stripe.webhooks.generateTestHeaderString({payload:body,secret});assert.equal(stripe.webhooks.constructEvent(body,header,secret).id,'evt_synthetic');
 assert.throws(()=>stripe.webhooks.constructEvent(body+' ',header,secret));assert.throws(()=>stripe.webhooks.constructEvent(body,header,'whsec_wrong'));assert.throws(()=>stripe.webhooks.constructEvent(body,stripe.webhooks.generateTestHeaderString({payload:body,secret,timestamp:1}),secret));
});
test('configuration fails closed without both secrets and enforces strict environment separation',()=>{
 assert.throws(()=>stripeConfiguration({}));const v={DEPLOYMENT_MODE:'staging',STRIPE_ENABLED:'true',STRIPE_SECRET_KEY:'rk_test_synthetic',STRIPE_WEBHOOK_SECRET:'whsec_synthetic',STRIPE_ACCOUNT_ID:'acct_synthetic',STRIPE_PRICE_ID:'price_synthetic',STRIPE_TAX_RATE_ID:'txr_synthetic',APP_ORIGIN:'http://localhost:3000'};
 assert.equal(stripeConfiguration(v).live,false);assert.throws(()=>stripeConfiguration({...v,DEPLOYMENT_MODE:'production'}));assert.throws(()=>stripeConfiguration({...v,STRIPE_SECRET_KEY:'rk_live_synthetic'}));assert.notEqual(stripePaymentRequest('in_one'),stripePaymentRequest('in_two'));
});
