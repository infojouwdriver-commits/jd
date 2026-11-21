import { z } from 'zod';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { CbeSearchError, configuredCbeSearch, normalizeCbeNumber, readCbeCompany } from '@/lib/cbe-public-search';
import { createErrorResponse } from '@/lib/create-response';
import { consumeRateLimit } from '@/lib/rate-limit';

const query = z.object({ number: z.string().max(50), language: z.enum(['fr', 'nl']).default('fr') }).strict();
const errors = {
  invalid_number: [400, 'أدخل رقم مؤسسة بلجيكيًا صالحًا.'],
  not_configured: [503, 'تحتاج خدمة BCE/KBO إلى إعداد على الخادم.'],
  not_found: [404, 'لم يجد سجل BCE/KBO مؤسسة بهذا الرقم.'],
  cancelled: [409, 'رقم المؤسسة ملغى في سجل BCE/KBO.'],
  not_yet_active: [409, 'رقم المؤسسة مسجّل ولم يدخل حيز النشاط بعد.'],
  quota: [429, 'بلغ حساب BCE/KBO حد البحث المتاح.'],
  credentials: [503, 'تعذر تسجيل الدخول إلى BCE/KBO. راجع إعداد الخدمة.'],
  unavailable: [502, 'تعذر الاتصال بسجل BCE/KBO. حاول لاحقًا أو أدخل البيانات يدويًا.'],
} as const;

export const POST = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({ status: 403, errorMessage: 'صلاحية الإدارة مطلوبة' });
  const input = query.safeParse(await validateRequestBody(request));
  try {
    if (!input.success || !normalizeCbeNumber(input.data.number)) throw new CbeSearchError('invalid_number');
    const config = configuredCbeSearch();
    if (!config) throw new CbeSearchError('not_configured');
    const limited = await consumeRateLimit(`cbe-search:${context.payload.sub}`, 10);
    if (limited) return limited;
    const company = await readCbeCompany(config, input.data.number, input.data.language);
    return Response.json({ success: true, data: company }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (!(error instanceof CbeSearchError)) throw error;
    const [status, errorMessage] = errors[error.code];
    return Response.json({ success: false, errorCode: error.code, errorMessage }, {
      status, headers: { 'Cache-Control': 'no-store' },
    });
  }
});
