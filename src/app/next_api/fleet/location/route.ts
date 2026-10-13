import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateAdminUserToken } from '@/lib/auth';
import { createPostgrestClient } from '@/lib/postgrest';

function actorId(context: {payload?: {sub?: string} | null}): number {
  const value = Number(context.payload?.sub);
  return Number.isSafeInteger(value) && value > 0 ? value : 0;
}

export const GET = requestMiddleware(async (_request, context) => {
  const userId = actorId(context);
  if (!userId) return createErrorResponse({errorMessage:'Unauthorized',status:401});
  const client = createPostgrestClient(await generateAdminUserToken());
  const {data,error} = await client.rpc('security_driver_fleet_location',{p_user_id:userId});
  if (error) return createErrorResponse({errorMessage:'Fleet state unavailable',status:500});
  return createSuccessResponse(data);
}, true);

export const POST = requestMiddleware(async (request, context) => {
  const userId = actorId(context);
  if (!userId) return createErrorResponse({errorMessage:'Unauthorized',status:401});
  const body = await validateRequestBody(request);
  const keys = Object.keys(body);
  if (keys.some(key => !['shift_active','sharing_enabled','latitude','longitude','accuracy_m','recorded_at'].includes(key)) ||
      typeof body.shift_active !== 'boolean' || typeof body.sharing_enabled !== 'boolean') {
    return createErrorResponse({errorMessage:'Invalid fleet state',status:400});
  }
  const sharing = body.shift_active && body.sharing_enabled;
  if (sharing && (!Number.isFinite(body.latitude) || !Number.isFinite(body.longitude) || !Number.isFinite(body.accuracy_m) ||
      typeof body.recorded_at !== 'string' || !Number.isFinite(Date.parse(body.recorded_at)))) {
    return createErrorResponse({errorMessage:'Valid position required while sharing',status:400});
  }
  const client = createPostgrestClient(await generateAdminUserToken());
  const {data,error} = await client.rpc('security_update_driver_fleet_location', {
    p_user_id:userId,p_shift_active:body.shift_active,p_sharing_enabled:body.sharing_enabled,
    p_latitude:sharing?body.latitude:null,p_longitude:sharing?body.longitude:null,
    p_accuracy_m:sharing?body.accuracy_m:null,p_recorded_at:sharing?body.recorded_at:null,
  });
  if (error) {
    const badInput = ['22023','23514'].includes(error.code || '');
    return createErrorResponse({errorMessage:badInput?'Invalid or stale fleet position':'Fleet update unavailable',status:badInput?400:500});
  }
  return createSuccessResponse(data);
}, true);
