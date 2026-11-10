import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {requestMiddleware,parseQueryParams} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {tripDelivery} from '@/lib/chiron-retry';

export {POST} from '../../trips/retry-sync/route';
export const GET = requestMiddleware(async (request,context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({status:403,errorMessage:'Admin access required'});
  const {company_id,limit,offset} = parseQueryParams(request);
  const size=Number(limit ?? 50), start=Number(offset ?? 0);
  if (!Number.isSafeInteger(size)||size<1||size>100||!Number.isSafeInteger(start)||start<0 ||
    (company_id && (!Number.isSafeInteger(Number(company_id))||Number(company_id)<1))) {
    return createErrorResponse({status:400,errorMessage:'Invalid Chiron review filters'});
  }
  let query=createPostgrestClient(await generateAdminUserToken()).from('trips')
    .select('id,company_id,ritnummer,start_time,end_time,start_address,end_address,price,chiron_environment,chiron_realtime,chiron_sync_state,chiron_sync_attempts,last_sync_attempt,sync_error_message,start_sync_response,arrival_sync_response')
    .or('and(chiron_realtime.eq.true,chiron_sync_state.in.(CREATED,START_SENT,ARRIVAL_SENT)),and(end_time.not.is.null,or(chiron_sync_state.is.null,chiron_sync_state.neq.COMPLETED))');
  if (company_id) query=query.eq('company_id',company_id);
  const {data,error}=await query.order('start_time',{ascending:false}).range(start,start+size-1);
  if(error)throw new Error('Chiron review records unavailable');
  return createSuccessResponse((data??[]).map(trip=>{
    const {sync_error_message,start_sync_response,arrival_sync_response,...record}=trip;
    const errors=arrival_sync_response?.errors??start_sync_response?.errors;
    return {...record,chiron_delivery:trip.chiron_realtime?tripDelivery(trip):'review',
      review_code:typeof sync_error_message==='string'&&/^CHIRON_[A-Z_]+$/.test(sync_error_message)
        ? sync_error_message : sync_error_message ? 'CHIRON_LEGACY_REVIEW' : null,
      chiron_error_codes:Array.isArray(errors)?errors.filter(code=>typeof code==='string'&&/^CH[0-9]{4}$/.test(code)).slice(0,25):[],
    };
  }));
});
