import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {existingReceipt} from '@/lib/issued-receipt';
import {receiptAdSchema,receiptSendSchema,receiptMessage,receiptEmailHtml,type ReceiptLanguage} from '@/lib/receipt-email-model';
import {sendTransactionalMail} from '@/lib/mail-service';
import {mailConfiguration,mailEventKey} from '@/lib/mail-policy';
import {consumeRateLimit} from '@/lib/rate-limit';
import {operationFailure} from '@/lib/operations-access';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const GET=requestMiddleware(async(request,context)=>{
 try {const client=createPostgrestClient(await generateAdminUserToken());const r=await existingReceipt(client,Number(request.nextUrl.searchParams.get('id')),Number(context.payload!.sub));
 const settings=await client.from('receipt_email_settings').select('version,enabled,text,url').eq('id',1).single();if(settings.error)throw settings.error;
 const ad=receiptAdSchema.parse(settings.data);const raw=request.nextUrl.searchParams.get('language')||r.invoice.invoice_language;const language:ReceiptLanguage=raw==='ar'||raw==='nl'?raw:'fr';
 return createSuccessResponse({...receiptMessage(language,r.receipt.reference,r.receipt.company,ad),language,settings_version:ad.version,reference:r.receipt.reference});
 }catch(e){return operationFailure(e);}
},true);
export const POST=requestMiddleware(async(request,context)=>{
 try {const v=receiptSendSchema.safeParse(await validateRequestBody(request));if(!v.success)return createErrorResponse({status:400,errorMessage:'Check recipient and message'});
 const actor=Number(context.payload!.sub),client=createPostgrestClient(await generateAdminUserToken());const r=await existingReceipt(client,Number(request.nextUrl.searchParams.get('id')),actor);
 if(r.isTest)return createErrorResponse({status:409,errorMessage:'Test trips cannot send real customer email'});
 const limited=await consumeRateLimit('receipt-email:'+actor,10);if(limited)return limited;
 const data=v.data,config=mailConfiguration(process.env);if(!config.ready)return createSuccessResponse({accepted:false,status:'not_configured'});
 const digest=mailEventKey(JSON.stringify({invoice:r.receipt.invoice_id,to:data.to.toLowerCase(),subject:data.subject,message:data.message,language:data.language,settings_version:data.settings_version}),config.metadataKey);
 const claimed=await client.rpc('security_claim_receipt_mail',{p_actor:actor,p_invoice:r.receipt.invoice_id,p_request:data.request_id,p_digest:digest,p_version:data.settings_version});if(claimed.error)throw claimed.error;
 const result=await sendTransactionalMail({to:data.to,subject:data.subject,text:data.message,html:`<!doctype html><html lang="${data.language}" dir="${data.language==='ar'?'rtl':'ltr'}"><head><title>${esc(data.subject)}</title></head><body style="font-family:Arial,sans-serif;line-height:1.7;white-space:pre-wrap">${receiptEmailHtml(data.message)}</body></html>`,purpose:'driver_receipt',event:`driver-receipt:${actor}:${r.receipt.invoice_id}:${data.request_id}:${digest}`,attachments:[{filename:r.receipt.reference+'.pdf',content:r.pdf()}]});
 return createSuccessResponse(result);
 }catch(e){return operationFailure(e);}
},true);
