import type Stripe from 'stripe';
import type {createPostgrestClient} from './postgrest';
import {stripeConfiguration,stripeClient,stripeObjectId} from './stripe-billing-core';
import {signInvoiceLink,type InvoiceLink} from './invoice-payment-link';
export type InvoiceSource=InvoiceLink['source'];
type Client=ReturnType<typeof createPostgrestClient>;
interface Checkout{id:string;source:InvoiceSource;document_id:number;company_id:number;actor_id:number;amount_cents:number;livemode:boolean;session_id:string|null;state:string;created_at:string;}
export async function invoiceRpc(client:Client,name:string,params:Record<string,unknown>){const r=await client.rpc(name,params).abortSignal(AbortSignal.timeout(10000));if(r.error)throw r.error;return r.data;}
export async function invoiceCheckout(client:Client,source:InvoiceSource,documentId:number,actor:number){
 const config=stripeConfiguration(),stripe=stripeClient(config);
 const d=await invoiceRpc(client,'security_invoice_document',{p_source:source,p_document:documentId});
 const q=await invoiceRpc(client,'security_invoice_checkout_begin',{p_source:source,p_document:documentId,p_actor:actor,p_live:config.live}) as Checkout;
 const returnUrl=config.origin+'/pay/invoice#'+signInvoiceLink({v:1,source,id:documentId,company:q.company_id,expires:Date.parse(q.created_at)+180*86400000},process.env.JWT_SECRET||'');
 if(['processing','review'].includes(q.state))throw Error('Payment requires reconciliation');
 let session:Stripe.Checkout.Session;
 if(q.session_id)session=await stripe.checkout.sessions.retrieve(q.session_id);
 else {
  if(Date.now()-Date.parse(q.created_at)>23*3600000)throw Error('Payment creation requires review');
  session=await stripe.checkout.sessions.create({mode:'payment',currency:'eur',customer_email:d.recipient.email,client_reference_id:q.id,
   metadata:{invoice_checkout:q.id},payment_intent_data:{metadata:{invoice_checkout:q.id}},integration_identifier:'jd_invoice_'+q.id.replace(/[^a-f]/g,'').padEnd(8,'a').slice(0,8),
   line_items:[{quantity:1,price_data:{currency:'eur',unit_amount:Number(q.amount_cents),product_data:{name:d.document_number,description:'Invoice payment / Paiement de facture / Factuurbetaling - TVA incluse'}}}],
   adaptive_pricing:{enabled:false},invoice_creation:{enabled:false},success_url:returnUrl,cancel_url:returnUrl,expires_at:Math.floor(Date.parse(q.created_at)/1000)+23*3600,
   custom_text:{submit:{message:'Paiement unique de cette facture. Aucun prélèvement automatique. / Eenmalige factuurbetaling. Geen automatische afschrijving.'}}
  },{idempotencyKey:'jd-invoice-checkout-'+q.id});
  await invoiceRpc(client,'security_invoice_checkout_state',{p_id:q.id,p_session:session.id,p_state:'open'});
 }
 if(session.livemode!==config.live||session.mode!=='payment'||session.client_reference_id!==q.id)throw Error('Checkout identity mismatch');
 if(session.status==='expired'){await invoiceRpc(client,'security_invoice_checkout_state',{p_id:q.id,p_session:session.id,p_state:'expired'});throw Error('Payment link refreshed; retry');}
 if(session.status!=='open'||!session.url||new URL(session.url).hostname!=='checkout.stripe.com')throw Error('Payment is pending reconciliation');
 return session.url;
}
/** Close provider collection before recording a bank/cash receipt. Never guess about a completed/pending session. */
export async function closeInvoiceCheckout(client:Client,source:InvoiceSource,documentId:number){
 const r=await client.from('invoice_checkouts').select('*').eq('source',source).eq('document_id',documentId).in('state',['creating','open','processing','review']);if(r.error)throw r.error;
 for(const q of r.data as Checkout[]){
  if(q.state!=='open'||!q.session_id)throw Error('Online payment must be reconciled first');
  const stripe=stripeClient(stripeConfiguration());let session=await stripe.checkout.sessions.retrieve(q.session_id);
  if(session.status==='open')session=await stripe.checkout.sessions.expire(session.id,{},{idempotencyKey:'jd-expire-'+q.id});
  if(session.status!=='expired')throw Error('Payment may already be processing');
  await invoiceRpc(client,'security_invoice_checkout_state',{p_id:q.id,p_session:session.id,p_state:'expired'});
 }
}
export async function processInvoiceCheckout(stripe:Stripe,client:Client,event:Stripe.Event):Promise<boolean>{
 if(!event.type.startsWith('checkout.session.')&&!['charge.refunded','charge.dispute.created'].includes(event.type))return false;
 const object=event.data.object as {id:string};
 if(event.type==='charge.refunded'||event.type==='charge.dispute.created'){
  const charge=event.type==='charge.refunded'?await stripe.charges.retrieve(object.id):await stripe.charges.retrieve(stripeObjectId((event.data.object as Stripe.Dispute).charge)!);
  const r=await client.from('invoice_checkout_receipts').select('checkout_id,session_id').eq('charge_id',charge.id).maybeSingle();if(r.error)throw r.error;if(!r.data)return false;
  // Keep the original receipt immutable and flag the collection for administration.
  await client.from('invoice_checkouts').update({state:'review',updated_at:new Date().toISOString()}).eq('id',r.data.checkout_id).throwOnError();return true;
 }
 const session=await stripe.checkout.sessions.retrieve(object.id,{expand:['payment_intent.latest_charge']});
 if(session.mode!=='payment')return false;
 const r=await client.from('invoice_checkouts').select('*').eq('session_id',session.id).maybeSingle();if(r.error)throw r.error;
 let q=r.data as Checkout|null;
 // Recover only through the persisted reservation plus provider ownership fields, never metadata alone.
 if(!q&&session.client_reference_id&&/^[a-f0-9-]{36}$/.test(session.client_reference_id)){const recovered=await client.from('invoice_checkouts').select('*').eq('id',session.client_reference_id).maybeSingle();if(recovered.error)throw recovered.error;q=recovered.data as Checkout|null;if(q&&session.metadata?.invoice_checkout===q.id)await invoiceRpc(client,'security_invoice_checkout_state',{p_id:q.id,p_session:session.id,p_state:'open'});else q=null;}
 if(!q)return false;
 if(session.livemode!==q.livemode||session.client_reference_id!==q.id||session.currency!=='eur'||session.amount_total!==Number(q.amount_cents))throw Error('Invoice checkout mismatch');
 if(session.status==='expired'){await invoiceRpc(client,'security_invoice_checkout_state',{p_id:q.id,p_session:session.id,p_state:'expired'});return true;}
 if(event.type==='checkout.session.async_payment_failed'){await invoiceRpc(client,'security_invoice_checkout_state',{p_id:q.id,p_session:session.id,p_state:'expired'});return true;}
 if(session.status!=='complete')throw Error('Checkout completion unavailable');
 if(session.payment_status!=='paid'){await invoiceRpc(client,'security_invoice_checkout_state',{p_id:q.id,p_session:session.id,p_state:'processing'});return true;}
 const intent=typeof session.payment_intent==='object'?session.payment_intent:null,charge=intent&&typeof intent.latest_charge==='object'?intent.latest_charge:null;
 if(!intent||!charge||intent.status!=='succeeded'||intent.livemode!==q.livemode||intent.currency!=='eur'||intent.amount!==Number(q.amount_cents)||intent.amount_received!==Number(q.amount_cents)||stripeObjectId(charge.payment_intent)!==intent.id||charge.livemode!==q.livemode||!charge.paid||!charge.captured||charge.currency!=='eur'||charge.amount!==Number(q.amount_cents)||charge.amount_captured!==Number(q.amount_cents)||charge.amount_refunded!==0||charge.disputed)throw Error('Invoice settlement unavailable');
 const receipt=await invoiceRpc(client,'security_invoice_checkout_paid',{p_id:q.id,p_session:session.id,p_intent:intent.id,p_charge:charge.id,p_amount:Number(q.amount_cents),p_paid:new Date(charge.created*1000).toISOString()});
 if(receipt.allocation==='review'){
  const others=await client.from('invoice_checkouts').select('session_id').eq('source',q.source).eq('document_id',q.document_id).eq('state','review').neq('id',q.id);if(others.error)throw others.error;
  for(const other of others.data){if(!other.session_id)continue;const pending=await stripe.checkout.sessions.retrieve(other.session_id);if(pending.status==='open')await stripe.checkout.sessions.expire(pending.id,{},{idempotencyKey:'jd-review-expire-'+pending.id});}
 }
 return true;
}
