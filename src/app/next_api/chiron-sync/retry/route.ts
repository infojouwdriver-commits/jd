import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { retryChironTrip } from '@/lib/chiron-retry';

export const POST = requestMiddleware(async request => {
  const {id} = parseQueryParams(request);
  if (!id) return createErrorResponse({errorMessage:'Trip ID required',status:400});
  const token = await generateAdminUserToken();
  const trip = await new CrudOperations('trips',token).findById(id);
  if (!trip) return createErrorResponse({errorMessage:'Trip not found',status:404});
  return createSuccessResponse(await retryChironTrip(trip,token));
});
export const GET = requestMiddleware(async request => {
  const {company_id,limit,offset} = parseQueryParams(request);
  const token = await generateAdminUserToken();
  const filters:Record<string,unknown>={chiron_sync_state:'ERROR'};
  if(company_id) filters.company_id=company_id;
  return createSuccessResponse(await new CrudOperations('trips',token).findMany(filters,{limit,offset,orderBy:{column:'created_at',direction:'desc'}}));
});
