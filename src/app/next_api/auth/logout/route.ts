import {requestMiddleware, getCookies} from '@/lib/api-utils';
import {authCrudOperations, verifyToken} from '@/lib/auth';
import {pbkdf2Hash} from '@/lib/server-utils';
import {revokeAllSessions} from '@/lib/security-session';
import {createLogoutResponse, createErrorResponse} from '@/lib/create-response';
import {authConfig} from '@/config/auth-config';
export const POST = requestMiddleware(async request => {
  try {
    const [refresh] = getCookies(request, [authConfig.refreshCookieName]);
    const [access] = getCookies(request, [authConfig.tokenCookieName]);
    const verified = await verifyToken(access);
    let userId = verified.payload?.sub;
    if (!userId && refresh) {
      const {refreshTokensCrud} = await authCrudOperations();
      const records = await refreshTokensCrud.findMany({token:pbkdf2Hash(refresh), revoked:false});
      if (records?.[0] && Date.parse(records[0].expires_at) > Date.now()) userId = String(records[0].user_id);
    }
    if (userId) await revokeAllSessions(userId);
    return createLogoutResponse();
  } catch { return createErrorResponse({errorMessage:'Logout revocation failed',status:503}); }
}, false);
