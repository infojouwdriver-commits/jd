import {authCrudOperations, generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
export async function revokeAllSessions(userId: string | number): Promise<void> {
  const {usersCrud, refreshTokensCrud} = await authCrudOperations();
  await usersCrud.update(userId, {security_revoked_before:new Date().toISOString()});
  const tokens = await refreshTokensCrud.findMany({user_id:userId, revoked:false});
  for (const token of tokens || []) await refreshTokensCrud.update(token.id, {revoked:true});
}
export async function claimOnce(kind: 'refresh' | 'passcode', id: number): Promise<boolean> {
  const token = await generateAdminUserToken();
  const result = await createPostgrestClient(token).rpc(`security_claim_${kind}`, {p_id:id});
  if (result.error) throw new Error('Security claim unavailable');
  return result.data === true;
}
