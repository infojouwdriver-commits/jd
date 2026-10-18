import { requestMiddleware } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateAdminUserToken } from '@/lib/auth';
import { createPostgrestClient } from '@/lib/postgrest';
import {companyMembership} from '@/lib/company-membership';

export const GET = requestMiddleware(async (_request, context) => {
  const actorId = Number(context.payload?.sub);
  if (!Number.isSafeInteger(actorId) || actorId < 1) return createErrorResponse({errorMessage:'Unauthorized',status:401});
  const token=await generateAdminUserToken();
  const membership=context.payload?.isAdmin?null:await companyMembership(token,actorId,'fleet',_request.nextUrl.searchParams.has('company_id')?Number(_request.nextUrl.searchParams.get('company_id')):undefined);
  const client = createPostgrestClient(token);
  const {data,error} = await client.rpc('security_fleet_locations', {
    p_actor_id: actorId,
    p_is_admin: context.payload?.isAdmin === true,
  });
  if (error) {
    console.error('Fleet view unavailable');
    return createErrorResponse({errorMessage:'Fleet view unavailable',status:500});
  }
  return createSuccessResponse(membership?(data||[]).filter((row:{company_id:number})=>Number(row.company_id)===Number(membership.company_id)):data||[]);
}, true);
