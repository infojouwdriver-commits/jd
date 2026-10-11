import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {ChironService} from '@/lib/chiron-service';
import {ChironError} from '@/lib/chiron-protocol';
export const POST=requestMiddleware(async request=>{
 const body=await validateRequestBody(request);
 const ids=[body.company_id,body.driver_id,body.vehicle_id].map(Number);
 if(ids.some(id=>!Number.isSafeInteger(id)||id<=0))return createErrorResponse({errorMessage:'اختر الشركة والسائق والمركبة',status:400});
 try{return createSuccessResponse(await ChironService.runAcceptanceTest(ids[0],ids[1],ids[2]));}
 catch(error){if(error instanceof ChironError)return createErrorResponse({errorMessage:error.message,errorCode:error.code,status:error.status});throw error;}
});
