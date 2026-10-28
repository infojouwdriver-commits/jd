import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {receiptAdSchema} from '@/lib/receipt-email-model';
import {operationFailure} from '@/lib/operations-access';
export const GET=requestMiddleware(async(_request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Admin required'});
 const r=await createPostgrestClient(await generateAdminUserToken()).from('receipt_email_settings').select('version,enabled,text,url').eq('id',1).single();
 return r.error?operationFailure(r.error):createSuccessResponse(r.data);
},true);
export const PUT=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Admin required'});
 try{const v=receiptAdSchema.safeParse(await validateRequestBody(request));if(!v.success)return createErrorResponse({status:400,errorMessage:'Invalid advertisement'});
 const {version,...data}=v.data;const r=await createPostgrestClient(await generateAdminUserToken()).rpc('security_save_receipt_email_settings',{p_actor:Number(context.payload.sub),p_expected:version,p_data:data});
 return r.error?operationFailure(r.error):createSuccessResponse(r.data);
 }catch(e){return operationFailure(e);}
},true);
