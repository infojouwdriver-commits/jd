import {requestMiddleware} from '@/lib/api-utils';
import {authCrudOperations, generateAdminUserToken} from '@/lib/auth';
import CrudOperations from '@/lib/crud-operations';
import {stripSecrets} from '@/lib/security-policy';
export const GET = requestMiddleware(async (_request, context) => {
  const userId = context.payload!.sub;
  const token = await generateAdminUserToken();
  const {usersCrud} = await authCrudOperations();
  const user = await usersCrud.findById(userId);
  const ownData: Record<string, unknown> = {account: {id:user.id, email:user.email, user_type:user.user_type}, exported_at:new Date().toISOString()};
  for (const table of ['drivers', 'trips', 'expenses', 'user_consents', 'data_subject_requests']) {
    const rows = await new CrudOperations(table, token).findMany({user_id:userId});
    // No blanket dump of messages/passengers/company settings. Access requests handle third-party balancing.
    const fields = table === 'trips' ? ['id','trip_uuid','start_time','end_time','distance_km','duration_minutes','price','currency','status','payment_method'] :
      table === 'drivers' ? ['id','full_name','phone','preferred_language','status'] :
      table === 'expenses' ? ['id','type','amount','expense_date','description'] :
      table === 'user_consents' ? ['id','consent_scope','consent_key','consent_version','granted','consent_time'] :
      ['id','request_type','status','request_details','requested_at','due_at'];
    ownData[table] = (rows || []).map((row: Record<string, unknown>) => Object.fromEntries(fields.filter(key => key in row).map(key => [key,row[key]])));
  }
  return new Response(JSON.stringify(stripSecrets(ownData), null, 2), {headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="personal-data.json"','Cache-Control':'private, no-store'}});
});
