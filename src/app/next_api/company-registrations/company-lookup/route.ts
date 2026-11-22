import { z } from 'zod';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { CbeSearchError, configuredCbeSearch, normalizeCbeNumber, readCbeCompany } from '@/lib/cbe-public-search';
import { lookupOpenDataCompany } from '@/lib/cbe-open-data';
import { consumeRateLimit } from '@/lib/rate-limit';

const input = z.object({ number: z.string().max(50), language: z.enum(['fr', 'nl']) }).strict();
const headers = { 'Cache-Control': 'no-store' };

function unavailable() {
  return Response.json({ errorCode: 'unavailable' }, { status: 503, headers });
}

export const POST = requestMiddleware(async request => {
  const parsed = input.safeParse(await validateRequestBody(request));
  const number = parsed.success ? normalizeCbeNumber(parsed.data.number) : null;
  if (!parsed.success || !number) {
    return Response.json({ errorCode: 'invalid_number' }, { status: 400, headers });
  }

  const ip = process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') || 'unknown' : 'unknown';
  const limited = await consumeRateLimit('registration-cbe:' + ip, 5)
    || await consumeRateLimit('registration-cbe:shared', 20);
  if (limited) return limited;

  const indexed = lookupOpenDataCompany(number, parsed.data.language);
  if (indexed) return Response.json({ data: indexed }, { headers });
  if (indexed === null) {
    return Response.json({ errorCode: 'no_active_record' }, { status: 404, headers });
  }

  const config = configuredCbeSearch();
  // Keep the acceptance account's weekly allowance reserved for internal testing.
  if (config?.environment !== 'production') return unavailable();

  try {
    const company = await readCbeCompany(config, number, parsed.data.language);
    if (company.status !== 'AC' || (!company.name && !company.address)) {
      return Response.json({ errorCode: 'no_active_record' }, { status: 404, headers });
    }
    const { kbo_number, name, address } = company;
    return Response.json({ data: { kbo_number, name, address } }, { headers });
  } catch (error) {
    if (!(error instanceof CbeSearchError)) throw error;
    if (['not_found', 'cancelled', 'not_yet_active'].includes(error.code)) {
      return Response.json({ errorCode: 'no_active_record' }, { status: 404, headers });
    }
    return unavailable();
  }
});
