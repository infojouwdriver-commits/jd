import CrudOperations from '@/lib/crud-operations';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {requestMiddleware,parseQueryParams,validateRequestBody} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {retryChironTrip} from '@/lib/chiron-retry';
import {ChironError} from '@/lib/chiron-protocol';
export const POST=requestMiddleware(async(request,context)=>{
 const body=await validateRequestBody(request);const query=parseQueryParams(request);const id=Number(body.trip_id||query.id||query.trip_id);
 if(!Number.isSafeInteger(id)||id<=0)return createErrorResponse({errorMessage:'معرّف الرحلة مطلوب',status:400});
 const token=await generateAdminUserToken();const trip=await new CrudOperations('trips',token).findById(id);
 if(!trip||(!context.payload?.isAdmin&&String(trip.user_id)!==String(context.payload?.sub)))return createErrorResponse({errorMessage:'الرحلة غير موجودة',status:404});
 try{return createSuccessResponse(await retryChironTrip(trip,token));}
 catch(error){if(error instanceof ChironError)return createErrorResponse({errorMessage:error.message,errorCode:error.code,status:error.status});throw error;}
});
