import { generateAdminUserToken, verifyToken } from './auth';
import { createPostgrestClient } from './postgrest';
import { isPlatformAdmin, accountSessionActive } from './security-policy';

export async function adminPageAccess(token?: string): Promise<'allowed' | 'login' | 'dashboard' | 'unavailable'> {
  const { payload } = await verifyToken(token);
  if (!payload) return 'login';
  if (!isPlatformAdmin(payload.sub, process.env.PLATFORM_ADMIN_IDS)) return 'dashboard';
  if (process.env.NODE_ENV === 'production' && payload.amr !== 'otp') return 'login';

  try {
    const result = await createPostgrestClient(await generateAdminUserToken())
      .from('users')
      // Restored schemas can omit the legacy status column.
      .select('*')
      .eq('id', payload.sub)
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();
    if (result.error) return 'unavailable';
    return accountSessionActive(result.data, payload.iat) ? 'allowed' : 'login';
  } catch {
    return 'unavailable';
  }
}
