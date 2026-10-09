import {requestMiddleware, parseQueryParams, validateRequestBody} from '@/lib/api-utils';
import {authCrudOperations, getAuthRoles} from '@/lib/auth';
import {createSuccessResponse, createErrorResponse} from '@/lib/create-response';
import {revokeAllSessions} from '@/lib/security-session';
export const GET = requestMiddleware(async request => {
  const {limit,offset} = parseQueryParams(request);
  const {usersCrud} = await authCrudOperations();
  const users = await usersCrud.findMany({}, {limit,offset});
  return createSuccessResponse((users || []).map((u: any) => ({id:u.id,email:u.email,role:u.role,user_type:u.user_type})));
});
export const PUT = requestMiddleware(async request => {
  const {id} = parseQueryParams(request);
  const body = await validateRequestBody(request);
  if (!id || !['driver','manager','company','owner','distributor'].includes(body.user_type)) return createErrorResponse({errorMessage:'id and valid user_type required; platform admins are configured outside the API',status:400});
  const {usersCrud} = await authCrudOperations();
  const updated = await usersCrud.update(id, {user_type:body.user_type, role:getAuthRoles().userRole});
  await revokeAllSessions(id);
  return createSuccessResponse({id:updated.id,user_type:updated.user_type});
});
