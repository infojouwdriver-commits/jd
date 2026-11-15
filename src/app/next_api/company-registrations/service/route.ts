import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';

const check=z.object({registrationId:z.string().uuid(),requestId:z.string().uuid()}).strict();
export const POST=requestMiddleware(async(request,context)=>{
  if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
  const parsed=check.safeParse(await validateRequestBody(request));
  if(!parsed.success)return createErrorResponse({status:400,errorMessage:'اختر تسجيل شركة صالحًا'});
  const result=await createPostgrestClient(await generateAdminUserToken()).rpc('security_recover_registration_service',{
    p_registration:parsed.data.registrationId,p_actor:Number(context.payload.sub),p_request:parsed.data.requestId,
  });
  if(result.error)return createErrorResponse({status:result.error.code==='P0002'?404:503,errorMessage:'تعذّر التحقق من جاهزية الخدمة'});
  return createSuccessResponse(result.data);
},true);
