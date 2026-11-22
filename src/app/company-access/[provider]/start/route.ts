import { NextRequest, NextResponse } from 'next/server';
import { companySocialConfig, companySocialFlowCookie, createCompanySocialFlow } from '@/lib/company-social';
import { consumeRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest, context: { params: Promise<{provider:string}> }) {
  const { provider } = await context.params;
  if (provider !== 'google' && provider !== 'apple') return new Response(null, {status:404});
  const config = companySocialConfig(provider);
  if (!config || request.headers.get('host') !== new URL(config.origin).host) return new Response(null, {status:404});
  const limited = await consumeRateLimit('company-social-start:'+(process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') || 'unknown' : 'unknown'), 20);
  if (limited) return limited;
  const lang = request.nextUrl.searchParams.get('lang');
  const result = await createCompanySocialFlow(provider, lang === 'ar' || lang === 'nl' ? lang : 'fr',
    request.nextUrl.searchParams.get('intent') === 'login' ? 'login' : 'register');
  if (!result) return new Response(null, {status:404});
  const response = NextResponse.redirect(result.url, 303);
  response.headers.set('Cache-Control','no-store');
  response.cookies.set(companySocialFlowCookie, result.cookie, {
    httpOnly:true, secure:true, sameSite:provider === 'apple' ? 'none' : 'lax', maxAge:600, path:'/',
  });
  return response;
}
