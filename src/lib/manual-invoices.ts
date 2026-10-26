import {z} from 'zod';
import {invoicePaymentState} from './invoice-payment-state';
import {requestMiddleware,validateRequestBody} from './api-utils';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {createErrorResponse,createSuccessResponse} from './create-response';
import {operationFailure,pageRange} from './operations-access';
import {subscriptionPdf,type SubscriptionDocument} from './subscription-document';
const positive=z.number().int().positive();
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('create'),request_id:z.string().uuid(),data:z.object({company_id:positive,issuer_company_id:positive,description:z.string().trim().min(1).max(2000),gross_cents:positive.max(100000000),vat_bps:z.number().int().min(0).max(10000),tax_reason:z.string().trim().max(1000).nullable(),due_date:z.iso.date()}).strict()}).strict(),
 z.object({action:z.enum(['issue','void']),request_id:z.string().uuid(),data:z.object({document_id:positive,reference:z.string().trim().max(256).optional()}).strict()}).strict(),
 z.object({action:z.literal('payment'),request_id:z.string().uuid(),data:z.object({document_id:positive,amount_cents:positive.max(100000000),reference:z.string().trim().min(1).max(140),payment_method:z.enum(['cash','bank_transfer'])}).strict()}).strict()
]);
export const manualInvoicesGET=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 try{
  const client=createPostgrestClient(await generateAdminUserToken());const {offset,limit}=pageRange(request);const documentId=request.nextUrl.searchParams.get('document_id');
  if(documentId){const n=Number(documentId);if(!Number.isSafeInteger(n)||n<1)return createErrorResponse({status:400,errorMessage:'Document required'});const r=await client.from('manual_invoices').select('*').eq('id',n).maybeSingle();if(r.error)throw r.error;if(!r.data)return createErrorResponse({status:404,errorMessage:'Document missing'});const d=r.data;const bytes=subscriptionPdf({...d,period_start:d.prepared_date,period_end:d.prepared_date,original_id:null,reason:null,tax_category:d.vat_bps?'S':'E'} as SubscriptionDocument,await invoicePaymentState(client,d,'manual'));return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${d.document_number}.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
  let query=client.from('manual_invoice_summary').select('*',{count:'exact'}).order('id',{ascending:false}).range(offset,offset+limit-1);
  const company=request.nextUrl.searchParams.get('company_id'),state=request.nextUrl.searchParams.get('state');if(company){if(!/^\d+$/.test(company))return createErrorResponse({status:400,errorMessage:'Company required'});query=query.eq('company_id',Number(company));}if(state){if(!['prepared','issued','void'].includes(state))return createErrorResponse({status:400,errorMessage:'Invalid state'});query=query.eq('state',state);}
  const docs=await query;if(docs.error)throw docs.error;
  const [companies,settings]=await Promise.all([client.from('companies').select('id,name,is_test').is('archived_at',null).order('name').limit(1000),client.from('subscription_billing_settings').select('issuer_company_id,default_vat_bps,exchange_mode,exchange_provider').eq('id',1).single()]);for(const r of [companies,settings])if(r.error)throw r.error;
  return createSuccessResponse({documents:docs.data||[],total:docs.count,companies:companies.data,settings:settings.data});
 }catch(error){return operationFailure(error);}
},true);
export const manualInvoicesPOST=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 try{const parsed=command.safeParse(await validateRequestBody(request));if(!parsed.success)return createErrorResponse({status:400,errorMessage:'راجع الحقول والمبلغ والتاريخ'});const v=parsed.data;const client=createPostgrestClient(await generateAdminUserToken());const r=await client.rpc('security_manual_invoice',{p_action:v.action,p_actor:Number(context.payload.sub),p_request:v.request_id,p_data:v.data});if(r.error)throw r.error;return createSuccessResponse(r.data);}catch(error){return operationFailure(error);}
},true);
