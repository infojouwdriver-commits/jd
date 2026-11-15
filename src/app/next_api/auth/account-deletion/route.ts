import { z } from 'zod';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { authCrudOperations } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/create-response';
import { createPostgrestClient } from '@/lib/postgrest';
import { verifyHashString } from '@/lib/server-utils';
import { consumeRateLimit } from '@/lib/rate-limit';
import { calendarMonthDeadline } from '@/lib/security-policy';
import { deletionReceipt, deletionReceiptDigest, deletionStatusFields } from '@/lib/account-deletion';

const schema = z.object({
  password: z.string().min(1).refine(value => Buffer.byteLength(value, 'utf8') <= 72),
  receipt: deletionReceipt,
  language: z.enum(['ar', 'fr', 'nl', 'en']),
}).strict();

export const GET = requestMiddleware(async (_request, context) => {
  if (context.payload!.isAdmin) return createErrorResponse({ status: 403, errorMessage: 'Account unavailable' });
  const result = await createPostgrestClient(context.token!).from('account_deletion_requests')
    .select(deletionStatusFields).eq('user_id', Number(context.payload!.sub)).maybeSingle();
  if (result.error) return createErrorResponse({ status: 503, errorMessage: 'Request unavailable' });
  return createSuccessResponse(result.data, 200);
});

export const POST = requestMiddleware(async (request, context) => {
  if (context.payload!.isAdmin) return createErrorResponse({ status: 403, errorMessage: 'Account unavailable' });
  const parsed = schema.safeParse(await validateRequestBody(request));
  if (!parsed.success) return createErrorResponse({ status: 400, errorMessage: 'Invalid confirmation' });

  const userId = context.payload!.sub;
  const limited = await consumeRateLimit('account-deletion:' + userId, 5);
  if (limited) return limited;

  const { password, receipt, language } = parsed.data;
  const { usersCrud } = await authCrudOperations();
  const user = await usersCrud.findById(userId);
  if (!user?.password || !await verifyHashString(password, user.password)) {
    return createErrorResponse({ status: 403, errorMessage: 'Incorrect account password' });
  }

  const result = await createPostgrestClient(context.token!).rpc('security_request_account_deletion', {
    p_user: Number(userId), p_password_hash: user.password, p_receipt_digest: deletionReceiptDigest(receipt),
    p_language: language, p_due_at: calendarMonthDeadline(new Date()).toISOString(),
  });
  if (result.error) return createErrorResponse({ status: result.error.code === '42501' ? 403 : 503, errorMessage: 'Account confirmation failed' });
  return createSuccessResponse(result.data, 201);
});
