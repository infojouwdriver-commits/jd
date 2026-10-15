import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {createPostgrestClient} from '@/lib/postgrest';
export const POST=requestMiddleware(async(request,context)=>{
 const value=z.object({installation_id:z.string().uuid()}).strict().safeParse(await validateRequestBody(request));
 if(!value.success)return createErrorResponse({errorMessage:'Invalid installation',status:400});
 if(!process.env.FCM_SERVICE_ACCOUNT_B64)return createErrorResponse({errorMessage:'Push service unavailable',status:503});
 const {data,error}=await createPostgrestClient(context.token).rpc('security_test_native_push',{p_user_id:Number(context.payload!.sub),p_installation:value.data.installation_id});
 if(error)return createErrorResponse({errorMessage:'Push test unavailable',status:error.code==='42501'?403:error.code==='22023'?429:503});
 return createSuccessResponse(data,202);
});
