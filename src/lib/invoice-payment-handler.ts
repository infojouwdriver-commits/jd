import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from './api-utils';
import {createErrorResponse,createSuccessResponse} from './create-response';
import {createPostgrestClient} from './postgrest';
import {generateAdminUserToken} from './auth';
import {readInvoiceLink} from './invoice-payment-link';
import {invoiceCheckout,invoiceRpc} from './invoice-checkout';
import {invoicePaymentState} from './invoice-payment-state';
import {consumeRateLimit} from './rate-limit';
const command=z.object({token:z.string().max(1024),action:z.enum(['review','checkout'])}).strict();
export const invoicePaymentPOST=requestMiddleware(async(request)=>{
 const parsed=command.safeParse(await validateRequestBody(request));if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Invalid invoice link'});
 let link;try{link=readInvoiceLink(parsed.data.token,process.env.JWT_SECRET||'');}catch{return createErrorResponse({status:410,errorMessage:'Invoice link expired. Request a new email.'});}
 const limited=await consumeRateLimit('invoice-payment:'+link.source+':'+link.id,30);if(limited)return limited;
 const client=createPostgrestClient(await generateAdminUserToken());
 try{
  const d=await invoiceRpc(client,'security_invoice_document',{p_source:link.source,p_document:link.id});
  if(Number(d.company_id)!==link.company||d.state!=='issued'||d.is_test||d.kind!=='invoice')return createErrorResponse({status:404,errorMessage:'Invoice unavailable'});
  const state=await invoicePaymentState(client,d,link.source);
  if(parsed.data.action==='review')return createSuccessResponse({number:d.document_number,balance_cents:state.balance_cents,collection:state.collection,language:d.recipient.language||'fr'});
  if(state.balance_cents<=0||state.collection==='stripe')return createErrorResponse({status:409,errorMessage:'No separate payment is due'});
  const actor=Number(d.created_by)||Number((await client.from('subscription_billing_profiles').select('updated_by').eq('company_id',link.company).single()).data?.updated_by);
  const url=await invoiceCheckout(client,link.source,link.id,actor);
  return createSuccessResponse({url});
 }catch{return createErrorResponse({status:409,errorMessage:'Payment unavailable or being confirmed. Refresh before retrying.'});}
},false);
