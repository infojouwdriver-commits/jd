import {createHash} from 'node:crypto';
import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {createPostgrestClient} from '@/lib/postgrest';
import {encryptSecret} from '@/lib/secret-vault';
const registration=z.object({installation_id:z.string().uuid(),enabled:z.boolean(),token:z.string().min(20).max(4096).regex(/^[A-Za-z0-9_:\-]+$/).optional(),language:z.enum(['ar','fr','nl','en']).default('ar')}).strict();
export const POST=requestMiddleware(async(request,context)=>{
 const value=registration.safeParse(await validateRequestBody(request));
 if(!value.success||value.data.enabled&&!value.data.token)return createErrorResponse({errorMessage:'Invalid registration',status:400});
 const body=value.data;
 if(body.enabled&&!process.env.FCM_SERVICE_ACCOUNT_B64)return createErrorResponse({errorMessage:'Push service unavailable',status:503});
 const {data,error}=await createPostgrestClient(context.token).rpc('security_push_device',{p_user_id:Number(context.payload!.sub),p_installation:body.installation_id,
 p_hash:body.token?createHash('sha256').update(body.token).digest('hex'):'',p_encrypted:body.token?encryptSecret(body.token,`native_push:${body.installation_id}`):'',p_language:body.language,p_enabled:body.enabled,p_issued_at:context.payload!.iat});
 if(error)return createErrorResponse({errorMessage:'Push registration unavailable',status:error.code==='42501'?403:503});
 return createSuccessResponse(data);
});
