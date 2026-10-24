import Stripe from 'stripe';
import {createHash} from 'node:crypto';

export const stripeEvents = ['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','invoice.paid','invoice.payment_failed','invoice.payment_action_required','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','subscription_schedule.canceled','subscription_schedule.completed','subscription_schedule.aborted','charge.refunded','charge.dispute.created'] as const;
export interface StripeEnrollment {
 id:string;company_id:number;contract_id:number;actor_id:number;livemode:boolean;
 price_id:string;tax_rate_id:string;customer_id:string|null;session_id:string|null;
 schedule_id:string|null;subscription_id:string|null;status:string;created_at:string;
 end_at?:number;end_date?:string;email?:string;
}
export class StripePaymentReview extends Error {}
export function stripeConfiguration(env:NodeJS.ProcessEnv=process.env){
 const live=env.DEPLOYMENT_MODE==='production';
 if(env.STRIPE_ENABLED!=='true'||!(live?/^rk_live_[A-Za-z0-9]+$/:/^rk_test_[A-Za-z0-9]+$/).test(env.STRIPE_SECRET_KEY||'')||!/^whsec_[A-Za-z0-9]+$/.test(env.STRIPE_WEBHOOK_SECRET||'')||!/^acct_[A-Za-z0-9]+$/.test(env.STRIPE_ACCOUNT_ID||'')||!/^price_[A-Za-z0-9]+$/.test(env.STRIPE_PRICE_ID||'')||!/^txr_[A-Za-z0-9]+$/.test(env.STRIPE_TAX_RATE_ID||''))throw Error('Stripe configuration unavailable');
 const origin=new URL(env.APP_ORIGIN||'');
 if(live&&origin.origin!=='https://app.jouww.com'||origin.pathname!=='/'||origin.username||origin.password||origin.search||origin.hash)throw Error('Stripe origin unavailable');
 return {live,key:env.STRIPE_SECRET_KEY!,webhook:env.STRIPE_WEBHOOK_SECRET!,account:env.STRIPE_ACCOUNT_ID!,price:env.STRIPE_PRICE_ID!,tax:env.STRIPE_TAX_RATE_ID!,origin:origin.origin};
}
export function stripeClient(config:ReturnType<typeof stripeConfiguration>){
 return new Stripe(config.key,{apiVersion:'2026-09-30.endive',maxNetworkRetries:2,timeout:15000});
}
export const stripeObjectId=(v:string|{id:string}|null|undefined)=>typeof v==='string'?v:v?.id||null;
export function stripePaymentRequest(invoice:string){
 const h=createHash('sha256').update('jouw-driver:stripe:'+invoice).digest('hex');
 return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
}
export function finiteSchedule(e:StripeEnrollment,paymentMethod:string,now=Math.floor(Date.now()/1000)):Stripe.SubscriptionScheduleCreateParams{
 if(!e.customer_id||!e.end_at||e.end_at<=now||!e.session_id)throw Error('Incomplete collection authorization');
 return {customer:e.customer_id,start_date:'now',end_behavior:'cancel',billing_mode:{type:'flexible'},
  metadata:{project:'jouw-driver',enrollment_id:e.id},
  default_settings:{collection_method:'charge_automatically',default_payment_method:paymentMethod},
  phases:[{items:[{price:e.price_id,quantity:1}],end_date:e.end_at,proration_behavior:'none',default_tax_rates:[e.tax_rate_id],metadata:{enrollment_id:e.id}}]};
}
export function assertStripeInvoice(invoice:Stripe.Invoice,e:StripeEnrollment){
 const line=invoice.lines.data[0];
 if(invoice.livemode!==e.livemode||stripeObjectId(invoice.customer)!==e.customer_id||stripeObjectId(invoice.parent?.subscription_details?.subscription)!==e.subscription_id||invoice.currency!=='eur'||invoice.status!=='paid'||invoice.total!==5000||invoice.amount_due!==5000||invoice.amount_paid!==5000||invoice.amount_remaining!==0||invoice.lines.has_more||invoice.lines.data.length!==1||!line||line.amount!==5000||line.quantity!==1||line.pricing?.price_details?.price!==e.price_id||line.parent?.subscription_item_details?.proration!==false||invoice.discounts.length>0||!invoice.status_transitions.paid_at)throw new StripePaymentReview('Unexpected Stripe invoice');
 const taxes=line.taxes||[];
 if(taxes.length!==1||taxes[0].amount!==868||taxes[0].tax_behavior!=='inclusive'||taxes[0].tax_rate_details?.tax_rate!==e.tax_rate_id)throw new StripePaymentReview('Unexpected invoice tax');
 return line;
}
export async function verifiedStripeReceipt(stripe:Stripe,invoice:Stripe.Invoice,e:StripeEnrollment){
 const line=assertStripeInvoice(invoice,e);
 const payments=await stripe.invoicePayments.list({invoice:invoice.id,status:'paid',limit:2});
 const paid=payments.data[0],intentId=stripeObjectId(paid?.payment.payment_intent);
 if(payments.has_more||payments.data.length!==1||!paid||paid.amount_paid!==5000||paid.currency!=='eur'||paid.livemode!==e.livemode||paid.payment.type!=='payment_intent'||!intentId)throw new StripePaymentReview('Successful invoice payment required');
 const intent=await stripe.paymentIntents.retrieve(intentId,{expand:['latest_charge']});
 const charge=typeof intent.latest_charge==='object'?intent.latest_charge:null;
 if(intent.status!=='succeeded'||intent.livemode!==e.livemode||intent.amount_received!==5000||intent.amount!==5000||intent.currency!=='eur'||stripeObjectId(intent.customer)!==e.customer_id||!charge||charge.refunded||charge.amount_refunded!==0||charge.disputed)throw new StripePaymentReview('Payment requires review');
 return {invoice:invoice.id,payment_intent:intentId,amount:5000,currency:'eur',period_start:line.period.start,paid_at:invoice.status_transitions.paid_at,request:stripePaymentRequest(invoice.id)};
}
