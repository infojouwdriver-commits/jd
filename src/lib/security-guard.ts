import type { NextRequest } from 'next/server';
import { authCrudOperations, generateAdminUserToken } from './auth';
import CrudOperations from './crud-operations';
import type { JWTPayload } from './api-utils';
import { isPlatformAdmin, memberEndpoint, ownsRecord } from './security-policy';

export async function authorizeEndpoint(request: NextRequest, payload: JWTPayload): Promise<void> {
  const {usersCrud} = await authCrudOperations();
  const user = await usersCrud.findById(payload.sub);
  if (!user || user.is_active === false || user.status === 'disabled') throw new Response(null, {status: 401});
  if (user.security_revoked_before && payload.iat * 1000 <= Date.parse(user.security_revoked_before)) throw new Response(null, {status: 401});
  payload.isAdmin = isPlatformAdmin(String(user.id), process.env.PLATFORM_ADMIN_IDS);
  const path = request.nextUrl.pathname;
  if (payload.isAdmin) return;
  if (!memberEndpoint(path, request.method, user.user_type || 'driver')) throw new Response(null, {status: 403});
  const token = await generateAdminUserToken();
  if (path.startsWith('/next_api/trips/') || (path === '/next_api/trips' && request.method !== 'GET')) {
    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const trip = await new CrudOperations('trips', token).findById(id);
      if (!ownsRecord(trip, payload.sub)) throw new Response(null, {status: 404});
      if (path === '/next_api/trips' && trip.locked_after_completion) throw new Response(null, {status: 409});
    } else if (!['/next_api/trips/start', '/next_api/trips/end', '/next_api/trips/summary', '/next_api/trips/export-pdf'].includes(path)) throw new Response(null, {status: 400});
  }
  if (path.startsWith('/next_api/company-portal')) {
    const links = await new CrudOperations('company_users', token).findMany({user_id: user.id});
    if (!links?.length) throw new Response(null, {status: 403});
  }
}
