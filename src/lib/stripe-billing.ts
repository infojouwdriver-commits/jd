import {processInvoiceCheckout} from './invoice-checkout';
import type Stripe from 'stripe';
import {requestMiddleware} from './api-utils';
import {operationsAccess,operationFailure} from './operations-access';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {createSuccessResponse,createErrorResponse} from './create-response';
import {stripeConfiguration,stripeClient,stripeEvents,stripeObjectId,verifiedStripeReceipt,StripePaymentReview,type StripeEnrollment} from './stripe-billing-core';

type Client=ReturnType<typeof createPostgrestClient>;
async function rpc(client:Client,name:string,params:Record<string,unknown>){const result=await client.rpc(name,params).abortSignal(AbortSignal.timeout(10000));if(result.error)throw result.error;return result.data;}
async function bind(client:Client,e:StripeEnrollment,values:{session?:string;schedule?:string;subscription?:string;customer?:string}){
 return await rpc(client,'security_stripe_bind',{p_id:e.id,p_customer:values.customer||e.customer_id,p_session:values.session||e.session_id,p_schedule:values.schedule||e.schedule_id,p_subscription:values.subscription||e.subscription_id}) as StripeEnrollment;
}
async function enrollment(client:Client,column:string,id:string){
 const r=await client.from('stripe_enrollments').select('*').eq(column,id).abortSignal(AbortSignal.timeout(10000)).maybeSingle();if(r.error)throw r.error;return r.data as StripeEnrollment|null;
}
export const stripeBillingGET=requestMiddleware(async(request,context)=>{
 try{
  const {client,companyId,actor,admin}=await operationsAccess(request,context,'billing');
  const r=await client.from('stripe_enrollments').select('id,contract_id,status,created_at,updated_at').eq('company_id',companyId).order('created_at',{ascending:false}).limit(10);if(r.error)throw r.error;
  const receipts=await client.from('stripe_payment_receipts').select('installment,amount_cents,paid_at,allocation,document_id').in('enrollment_id',(r.data||[]).map(e=>e.id)).order('installment',{ascending:false}).limit(120);if(receipts.error)throw receipts.error;
  let enabled=false;try{stripeConfiguration();enabled=true;}catch{}
  const membership=await client.from('company_users').select('role').eq('company_id',companyId).eq('user_id',actor).eq('is_active',true);if(membership.error)throw membership.error;
  const contracts=await client.from('company_contracts').select('id,contract_number,contract_start_date,contract_end_date').eq('company_id',companyId).eq('contract_status','active').not('signed_at','is',null).eq('billing_model','gross_monthly_v1').order('id',{ascending:false}).limit(10);if(contracts.error)throw contracts.error;
  const recovery:Record<string,string>={};
  if(enabled){const stripe=stripeClient(stripeConfiguration());for(const row of r.data.filter(e=>e.status==='past_due')){const owned=await enrollment(client,'id',row.id);if(!owned?.subscription_id)continue;const subscription=await stripe.subscriptions.retrieve(owned.subscription_id,{expand:['latest_invoice']});const invoice=typeof subscription.latest_invoice==='object'?subscription.latest_invoice:null;if(invoice?.hosted_invoice_url){const url=new URL(invoice.hosted_invoice_url);if(url.protocol==='https:'&&url.hostname==='invoice.stripe.com')recovery[row.id]=url.href;}}}
  return createSuccessResponse({enabled,can_authorize:!admin&&membership.data.some(m=>['owner','portal_owner'].includes(m.role)),enrollments:r.data,receipts:receipts.data,contracts:contracts.data,recovery});
 }catch(e){return operationFailure(e);}
},true);
export const stripeBillingPOST=requestMiddleware(async()=>createErrorResponse({status:410,errorMessage:'Pay the issued invoice instead of authorizing automatic collection'}),true);

async function completeSetup(stripe:Stripe,client:Client,id:string){
 const session=await stripe.checkout.sessions.retrieve(id,{expand:['setup_intent']});
 let e=await enrollment(client,'session_id',id);
 // Recovery when Stripe accepted the request and the local session binding response was lost.
 if(!e&&session.client_reference_id){e=await enrollment(client,'id',session.client_reference_id);if(e&&e.customer_id===stripeObjectId(session.customer)&&session.metadata?.enrollment_id===e.id)e=await bind(client,e,{session:id});else e=null;}
 if(!e)return;
 const intent=typeof session.setup_intent==='object'?session.setup_intent:null;
 if(session.mode!=='setup'||session.status!=='complete'||session.livemode!==e.livemode||stripeObjectId(session.customer)!==e.customer_id||!intent||intent.status!=='succeeded'||intent.livemode!==e.livemode||stripeObjectId(intent.customer)!==e.customer_id||!stripeObjectId(intent.payment_method))throw Error('Setup confirmation unavailable');
 if(!e.schedule_id){await client.from('stripe_enrollments').update({status:'review'}).eq('id',e.id).throwOnError();return;}
 if(e.subscription_id){const sub=await stripe.subscriptions.retrieve(e.subscription_id,{expand:['latest_invoice']});const invoice=typeof sub.latest_invoice==='object'?sub.latest_invoice:null;if(invoice?.status==='draft')await stripe.invoices.finalizeInvoice(invoice.id,{auto_advance:true},{idempotencyKey:'jd-first-invoice-'+e.id});}
}
async function mappedSubscription(stripe:Stripe,client:Client,subId:string){
 const sub=await stripe.subscriptions.retrieve(subId),customer=stripeObjectId(sub.customer);
 if(!customer)return null;
 let e=await enrollment(client,'customer_id',customer);if(!e)return null;
 const scheduleId=stripeObjectId(sub.schedule);
 if(!e.subscription_id&&scheduleId){
  const schedule=await stripe.subscriptionSchedules.retrieve(scheduleId);
  if(schedule.metadata?.enrollment_id!==e.id||schedule.end_behavior!=='cancel'||stripeObjectId(schedule.customer)!==customer||schedule.livemode!==e.livemode)throw Error('Schedule binding unavailable');
  e=await bind(client,e,{schedule:scheduleId,subscription:subId});
 }
 if(e.subscription_id!==subId||sub.livemode!==e.livemode)throw Error('Subscription identity conflict');
 return {e,sub};
}
export async function processStripeEvent(stripe:Stripe,client:Client,event:Stripe.Event){
 if(await processInvoiceCheckout(stripe,client,event))return;
 const object=event.data.object as {id:string};
 if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded'){await completeSetup(stripe,client,object.id);return;}
 if(event.type==='checkout.session.async_payment_failed')return;
 let mapped:Awaited<ReturnType<typeof mappedSubscription>>=null;
 let receipt:Awaited<ReturnType<typeof verifiedStripeReceipt>>|null=null;
 let review=false;
 if(event.type.startsWith('invoice.')){
  const invoice=await stripe.invoices.retrieve(object.id),subId=stripeObjectId(invoice.parent?.subscription_details?.subscription);if(!subId)return;
  mapped=await mappedSubscription(stripe,client,subId);if(!mapped)return;
  if(invoice.status==='paid')try{receipt=await verifiedStripeReceipt(stripe,invoice,mapped.e);}catch(error){if(error instanceof StripePaymentReview)review=true;else throw error;}
 }else if(event.type.startsWith('customer.subscription.'))mapped=await mappedSubscription(stripe,client,object.id);
 else if(event.type.startsWith('subscription_schedule.')){
  const schedule=await stripe.subscriptionSchedules.retrieve(object.id),subId=stripeObjectId(schedule.subscription)||stripeObjectId(schedule.released_subscription);if(!subId)return;
  mapped=await mappedSubscription(stripe,client,subId);review=event.type==='subscription_schedule.aborted';
 }else if(event.type==='charge.refunded'||event.type==='charge.dispute.created'){
  const charge=event.type==='charge.refunded'?await stripe.charges.retrieve(object.id):await stripe.charges.retrieve(stripeObjectId((object as Stripe.Dispute).charge)!);
  const intent=stripeObjectId(charge.payment_intent);if(!intent)return;
  const r=await client.from('stripe_payment_receipts').select('enrollment_id').eq('payment_intent_id',intent).maybeSingle();if(r.error)throw r.error;
  const e=r.data?await enrollment(client,'id',r.data.enrollment_id):await enrollment(client,'customer_id',stripeObjectId(charge.customer)||'');if(e?.subscription_id)mapped=await mappedSubscription(stripe,client,e.subscription_id);review=true;
 }else return;
 if(!mapped)return;
 const {e,sub}=mapped;
 const status=review?'review':['canceled','incomplete_expired'].includes(sub.status)?'canceled':['past_due','unpaid','incomplete','paused'].includes(sub.status)?'past_due':'active';
 const values={p_id:e.id,p_event:event.id,p_created:event.created,p_kind:event.type,p_status:status,p_receipt:receipt};
 try{await rpc(client,'security_stripe_event',values);}catch(error){if(receipt&&['23505','PT409','23514'].includes((error as {code:string}).code))await rpc(client,'security_stripe_event',{...values,p_status:'review',p_receipt:null});else throw error;}
}
export async function stripeWebhook(request:Request){
 let config:ReturnType<typeof stripeConfiguration>;try{config=stripeConfiguration();}catch{return Response.json({error:'Payment service unavailable'},{status:503});}
 const stripe=stripeClient(config);let event:Stripe.Event;
 try{
  const reader=request.body?.getReader();if(!reader)throw Error('Missing body');const chunks:Uint8Array[]=[];let size=0;
  for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>262144){await reader.cancel();throw Error('Invalid size');}chunks.push(part.value);}
  const body=Buffer.concat(chunks);
  event=stripe.webhooks.constructEvent(body,request.headers.get('stripe-signature')||'',config.webhook);
  if(event.api_version!=='2026-09-30.endive'||event.livemode!==config.live||event.account&&event.account!==config.account)throw Error('Unexpected account or event version');
 }catch{return Response.json({error:'Invalid payment notification'},{status:400});}
 if(!(stripeEvents as readonly string[]).includes(event.type))return Response.json({received:true});
 try{await processStripeEvent(stripe,createPostgrestClient(await generateAdminUserToken()),event);return Response.json({received:true});}
 catch{return Response.json({error:'Payment reconciliation pending'},{status:503});}
}
