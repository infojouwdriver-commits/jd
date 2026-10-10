import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { retryChironTrip } from '@/lib/chiron-retry';

export const POST = requestMiddleware(async (request,context) => {
  const {id} = parseQueryParams(request);
  if (!id) return createErrorResponse({errorMessage:'Trip ID required',status:400});
  const token = await generateAdminUserToken();
  const trip = await new CrudOperations('trips',token).findById(id);
  if (!trip || (!context.payload?.isAdmin && String(trip.user_id) !== String(context.payload?.sub))) return createErrorResponse({errorMessage:'Trip not found',status:404});
  return createSuccessResponse(await retryChironTrip(trip,token));
});
