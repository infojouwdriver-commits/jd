import { requestMiddleware } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateAdminUserToken } from '@/lib/auth';
import { createPostgrestClient } from '@/lib/postgrest';

export const GET = requestMiddleware(async (_request, context) => {
  const actorId = Number(context.payload?.sub);
  if (!Number.isSafeInteger(actorId) || actorId < 1) return createErrorResponse({errorMessage:'Unauthorized',status:401});
  const client = createPostgrestClient(await generateAdminUserToken());
  const {data,error} = await client.rpc('security_fleet_locations', {
    p_actor_id: actorId,
    p_is_admin: context.payload?.isAdmin === true,
  });
  if (error) {
    console.error('Fleet view unavailable');
    return createErrorResponse({errorMessage:'Fleet view unavailable',status:500});
  }
  return createSuccessResponse(data || []);
}, true);
