import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from './api-utils';
import {operationsAccess,operationFailure,pageRange} from './operations-access';
import {createSuccessResponse,createErrorResponse} from './create-response';
import {subscriptionPdf,type SubscriptionDocument} from './subscription-document';
import {mailConfiguration} from './mail-policy';
const id=z.number().int().positive(),date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/),expected=z.string().datetime({offset:true}).nullable();
const profile=z.object({enabled:z.boolean(),net_cents:z.number().int().min(1).max(100000000),vat_bps:z.number().int().min(0).max(10000),tax_category:z.enum(['S','Z','E','O']),tax_reason:z.string().trim().max(1000).nullable(),billing_day:z.number().int().min(1).max(31),next_invoice_date:date,due_days:z.number().int().min(0).max(90),reminder_days:z.number().int().min(1).max(90),billing_email:z.string().trim().email().max(254),language:z.enum(['ar','fr','nl'])}).strict();
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile'),expected,data:profile}).strict(),
 z.object({action:z.literal('settings'),expected,data:z.object({issuer_company_id:id,invoice_prefix:z.string().regex(/^[A-Z][A-Z0-9-]{1,9}$/),exchange_mode:z.enum(['unconfigured','external_structured']),exchange_provider:z.string().trim().max(120).nullable()}).strict()}).strict(),
 z.object({action:z.literal('prepare'),request_id:z.string().uuid()}).strict(),
 z.object({action:z.literal('issue'),document_id:id,exchange_reference:z.string().trim().min(1).max(256)}).strict(),
 z.object({action:z.literal('payment'),request_id:z.string().uuid(),document_id:id,amount_cents:z.number().int().min(1).max(100000000),payment_date:date,reference:z.string().trim().min(1).max(140)}).strict(),
 z.object({action:z.literal('credit'),request_id:z.string().uuid(),document_id:id,net_cents:z.number().int().min(1).max(100000000),reason:z.string().trim().min(1).max(1000)}).strict(),
]);
export const billingGET=requestMiddleware(async(request,context)=>{try{
 const {client,companyId,admin}=await operationsAccess(request,context,'billing');
 const documentId=request.nextUrl.searchParams.get('document_id');
 if(documentId){
  const n=Number(documentId);if(!Number.isSafeInteger(n)||n<1)return createErrorResponse({status:400,errorMessage:'Document required'});
  const doc=await client.from('subscription_documents').select('*').eq('company_id',companyId).eq('id',n).maybeSingle();if(doc.error)throw doc.error;if(!doc.data)return createErrorResponse({status:404,errorMessage:'Document missing'});
  const bytes=subscriptionPdf(doc.data as SubscriptionDocument);
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${doc.data.document_number}.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }
 const {offset,limit}=pageRange(request),scope=request.nextUrl.searchParams.get('scope')||'live';
 const [statement,profile,settings,scheduler,queue]=await Promise.all([
  client.rpc('security_subscription_statement',{p_company:companyId,p_scope:scope,p_limit:limit,p_offset:offset}),
  client.from('subscription_billing_profiles').select('*').eq('company_id',companyId).maybeSingle(),
  admin?client.from('subscription_billing_settings').select('*').eq('id',1).single():Promise.resolve({data:null,error:null}),
  admin?client.from('subscription_scheduler_state').select('*').eq('id',1).single():Promise.resolve({data:null,error:null}),
  admin?client.from('subscription_mail_queue').select('id,document_id,purpose,status,last_result,scheduled_date,completed_at').in('document_id',(await client.from('subscription_documents').select('id').eq('company_id',companyId).order('id',{ascending:false}).range(offset,offset+limit-1)).data?.map(x=>x.id)||[]).order('id',{ascending:false}).limit(100):Promise.resolve({data:[],error:null})
 ]);
 for(const r of [statement,profile,settings,scheduler,queue])if(r.error)throw r.error;
 return createSuccessResponse({...statement.data,profile:profile.data,settings:settings.data,scheduler:scheduler.data,mail:queue.data,mail_ready:admin?mailConfiguration(process.env).ready:undefined,admin});
}catch(error){return operationFailure(error);}},true);
export const billingPOST=requestMiddleware(async(request,context)=>{try{
 const {client,companyId,actor,admin}=await operationsAccess(request,context,'billing');if(!admin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 const parsed=command.safeParse(await validateRequestBody(request));if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Invalid billing details'});const v=parsed.data;
 if('document_id'in v){const doc=await client.from('subscription_documents').select('id').eq('id',v.document_id).eq('company_id',companyId).maybeSingle();if(doc.error)throw doc.error;if(!doc.data)return createErrorResponse({status:404,errorMessage:'Document missing'});}
 const rpc=v.action==='profile'?['security_save_subscription_profile',{p_company:companyId,p_actor:actor,p_expected:v.expected,p_data:v.data}]:v.action==='settings'?['security_save_subscription_settings',{p_actor:actor,p_expected:v.expected,p_data:v.data}]:v.action==='prepare'?['security_prepare_subscription_invoice',{p_company:companyId,p_actor:actor,p_request:v.request_id}]:v.action==='issue'?['security_issue_subscription_document',{p_document:v.document_id,p_actor:actor,p_exchange_reference:v.exchange_reference}]:v.action==='payment'?['security_record_subscription_payment',{p_request:v.request_id,p_invoice:v.document_id,p_actor:actor,p_amount:v.amount_cents,p_date:v.payment_date,p_reference:v.reference}]:['security_prepare_subscription_credit',{p_original:v.document_id,p_actor:actor,p_request:v.request_id,p_net:v.net_cents,p_reason:v.reason}];
 const result=await client.rpc(rpc[0] as string,rpc[1] as Record<string,unknown>);if(result.error)throw result.error;return createSuccessResponse(result.data);
}catch(error){return operationFailure(error);}},true);
