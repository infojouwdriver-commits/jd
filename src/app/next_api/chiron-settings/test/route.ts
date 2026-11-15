import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createErrorResponse,createSuccessResponse} from '@/lib/create-response';
import {ChironService} from '@/lib/chiron-service';
import {ChironError} from '@/lib/chiron-protocol';

const connection=z.object({
  companyId:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  mode:z.enum(['TEST','PRODUCTION']),
  clientId:z.string().trim().max(512).optional(),
  clientSecret:z.string().max(4096).optional(),
  authUrl:z.string().trim().max(250).optional(),
  apiUrl:z.string().trim().max(250).optional(),
}).strict();

export const POST=requestMiddleware(async(request,context)=>{
  if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Admin access required'});
  const parsed=connection.safeParse(await validateRequestBody(request));
  if(!parsed.success)return createErrorResponse({status:400,errorMessage:'تحقق من بيانات اتصال Chiron'});
  const {companyId,mode,...credentials}=parsed.data;
  try{return createSuccessResponse(await ChironService.testConnection(companyId,mode,credentials));}
  catch(error){
    if(error instanceof ChironError)return createErrorResponse({status:error.status,errorCode:error.code,errorMessage:error.message});
    throw error;
  }
},true);
