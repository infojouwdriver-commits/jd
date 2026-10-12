import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { createPostgrestClient } from '@/lib/postgrest';
import { messageId } from '@/lib/message-access';

export const GET = requestMiddleware(async (_request, context) => {
 const userId = messageId(context.payload!.sub);
 const client = createPostgrestClient(await generateAdminUserToken());
 const result = await client.rpc('security_driver_messages', {p_user_id:userId,p_limit:100,p_offset:0});
 if (result.error) throw new Error('Messages unavailable');
 return createSuccessResponse(result.data || []);
}, true);
