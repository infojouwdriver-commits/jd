import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {createPostgrestClient} from '@/lib/postgrest';
export const POST=requestMiddleware(async(request,context)=>{
 const value=z.object({job_id:z.string().uuid()}).strict().safeParse(await validateRequestBody(request));
 if(!value.success)return createErrorResponse({errorMessage:'Invalid receipt',status:400});
 const {data,error}=await createPostgrestClient(context.token).from('native_push_jobs').update({received_at:new Date().toISOString()}).eq('id',value.data.job_id).eq('user_id',Number(context.payload!.sub)).select('id');
 if(error)return createErrorResponse({errorMessage:'Receipt unavailable',status:503});
 return createSuccessResponse({recorded:Array.isArray(data)&&data.length===1});
});
