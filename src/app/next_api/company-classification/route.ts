import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
const command=z.object({company_id:z.number().int().positive(),is_test:z.boolean(),reason:z.string().trim().min(1).max(1000),request_id:z.string().uuid()}).strict();
export const POST=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 const parsed=command.safeParse(await validateRequestBody(request));if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Classification, company and reason required'});
 const p=parsed.data;try{const r=await createPostgrestClient(await generateAdminUserToken()).rpc('security_classify_company',{p_company:p.company_id,p_actor:Number(context.payload.sub),p_test:p.is_test,p_reason:p.reason,p_request:p.request_id});if(r.error)return createErrorResponse({status:r.error.code==='P0002'?404:r.error.code==='40001'?409:503,errorMessage:'Classification unavailable; finish any active trip and refresh'});return createSuccessResponse(r.data);}catch{return createErrorResponse({status:503,errorMessage:'Classification unavailable'});}
},true);
