import { z } from 'zod';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/create-response';
import { createPostgrestClient } from '@/lib/postgrest';
import { deletionReceipt, deletionReceiptDigest, deletionStatusFields } from '@/lib/account-deletion';

const schema = z.object({ receipt: deletionReceipt }).strict();

export const POST = requestMiddleware(async request => {
  const parsed = schema.safeParse(await validateRequestBody(request));
  if (!parsed.success) return createErrorResponse({ status: 400, errorMessage: 'Invalid receipt' });
  const result = await createPostgrestClient(await generateAdminUserToken()).from('account_deletion_requests')
    .select(deletionStatusFields).eq('receipt_digest', deletionReceiptDigest(parsed.data.receipt)).maybeSingle();
  if (result.error) return createErrorResponse({ status: 503, errorMessage: 'Request unavailable' });
  const response = createSuccessResponse(result.data);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}, false);
