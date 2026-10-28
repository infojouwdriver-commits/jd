import {requestMiddleware} from '@/lib/api-utils';
import {createSuccessResponse} from '@/lib/create-response';
import {createPostgrestClient} from '@/lib/postgrest';
import {generateAdminUserToken} from '@/lib/auth';
import {existingReceipt} from '@/lib/issued-receipt';
import {operationFailure} from '@/lib/operations-access';
export const GET=requestMiddleware(async(request,context)=>{
 try {const r=await existingReceipt(createPostgrestClient(await generateAdminUserToken()),Number(request.nextUrl.searchParams.get('id')),Number(context.payload!.sub));return createSuccessResponse(r.receipt);}catch(e){return operationFailure(e);}
},true);
