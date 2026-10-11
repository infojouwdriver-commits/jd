import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { retryChironTrip } from '@/lib/chiron-retry';

export {POST} from '../../trips/retry-sync/route';
export const GET = requestMiddleware(async (request,context) => {
  if(!context.payload?.isAdmin)return createErrorResponse({errorMessage:'Admin access required',status:403});
  const {company_id,limit,offset} = parseQueryParams(request);
  const token = await generateAdminUserToken();
  const filters:Record<string,unknown>={chiron_sync_state:'ERROR'};
  if(company_id) filters.company_id=company_id;
  return createSuccessResponse(await new CrudOperations('trips',token).findMany(filters,{limit,offset,orderBy:{column:'created_at',direction:'desc'}}));
});
