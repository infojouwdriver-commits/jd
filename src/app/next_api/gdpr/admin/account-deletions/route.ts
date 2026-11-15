import { z } from 'zod';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createErrorResponse, createSuccessResponse } from '@/lib/create-response';
import { createPostgrestClient } from '@/lib/postgrest';

const schema = z.object({
  id: z.string().uuid(),
  records_reviewed: z.literal(true),
  keep_driver_identity: z.boolean(),
  retention_reason: z.string().trim().max(1000),
}).strict().refine(value => !value.keep_driver_identity || value.retention_reason.length >= 10);

export const GET = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({ status: 403, errorMessage: 'Access denied' });
  const client = createPostgrestClient(context.token!);
  const fields = 'id,user_id,requested_at,due_at,completed_at,completed_by,retention_reason';
  const id = request.nextUrl.searchParams.get('id');
  if (id && !z.string().uuid().safeParse(id).success) return createErrorResponse({ status: 400, errorMessage: 'Invalid request' });
  const result = id
    ? await client.from('account_deletion_requests').select(fields).eq('id', id)
    : await client.from('account_deletion_requests').select(fields).is('completed_at', null)
      .order('due_at', { ascending: true }).limit(100);
  if (result.error) return createErrorResponse({ status: 503, errorMessage: 'Request unavailable' });
  return createSuccessResponse(result.data);
});

export const POST = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({ status: 403, errorMessage: 'Access denied' });
  const parsed = schema.safeParse(await validateRequestBody(request));
  if (!parsed.success) return createErrorResponse({ status: 400, errorMessage: 'أكد مراجعة البيانات وسجل سبب الاحتفاظ عند الحاجة.' });
  const result = await createPostgrestClient(context.token!).rpc('security_complete_account_deletion', {
    p_id: parsed.data.id, p_actor: Number(context.payload.sub),
    p_keep_driver_identity: parsed.data.keep_driver_identity, p_retention_reason: parsed.data.retention_reason,
  });
  if (result.error?.code === '55000') return createErrorResponse({ status: 409, errorMessage: 'توجد رحلة أو وردية جارية. أعد التنفيذ بعد إنهائها.' });
  if (result.error?.code === 'P0002') return createErrorResponse({ status: 404, errorMessage: 'الطلب غير موجود.' });
  if (result.error?.code === '42501') return createErrorResponse({ status: 409, errorMessage: 'يتطلب الحساب مراجعة قبل تنفيذ الطلب.' });
  if (result.error) return createErrorResponse({ status: 503, errorMessage: 'Request unavailable' });
  return createSuccessResponse(result.data);
});
