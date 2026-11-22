import { NextRequest, NextResponse } from 'next/server';
import { authCrudOperations, generateAdminUserToken, generateToken } from '@/lib/auth';
import { companyMembership } from '@/lib/company-membership';
import {
  companySocialConfig, companySocialFlowCookie, companySocialProofCookie, exchangeCompanySocialCode, makeCompanyProof,
} from '@/lib/company-social';
import { createAuthResponse } from '@/lib/create-response';
import { createPostgrestClient } from '@/lib/postgrest';
import { generateRandomString, pbkdf2Hash } from '@/lib/server-utils';
import { getRequestIp } from '@/lib/api-utils';
import { isPlatformAdmin } from '@/lib/security-policy';
import { REFRESH_TOKEN_EXPIRE_TIME } from '@/constants/auth';

async function callback(request: NextRequest, context: {params:Promise<{provider:string}>}) {
  const { provider } = await context.params;
  if (provider !== 'google' && provider !== 'apple') return new Response(null,{status:404});
  const config = companySocialConfig(provider);
  if (!config || request.headers.get('host') !== new URL(config.origin).host) return new Response(null,{status:404});
  if (request.method !== (provider === 'apple' ? 'POST' : 'GET')) return new Response(null,{status:405});
  const redirect = (path:string) => {
    const response = NextResponse.redirect(new URL(path, config.origin),303);
    response.cookies.set(companySocialFlowCookie,'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});
    response.headers.set('Cache-Control','no-store');
    return response;
  };
  const fail = '/register-company?identity=failed';
  try {
    // Caddy caps request bodies. Apple returns form_post on this dedicated route.
    if (request.method === 'POST' && (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded') ||
      Number(request.headers.get('content-length') || 0) > 16384)) return redirect(fail);
    const params = request.method === 'POST' ? new URLSearchParams(await request.text()) : request.nextUrl.searchParams;
    const result = await exchangeCompanySocialCode(provider, request.cookies.get(companySocialFlowCookie)?.value,
      params.get('state') || '', params.get('code') || '');
    if (!result) return redirect(fail);
    const token = await generateAdminUserToken();
    const link = await createPostgrestClient(token).from('user_oauth_providers').select('user_id')
      .eq('provider',provider).eq('provider_user_id',result.identity.subject).eq('is_active',true)
      .not('company_registration_request_id','is',null).maybeSingle();
    if (link.error) return redirect(fail);
    if (!link.data) {
      const response = redirect(`/register-company?lang=${result.language}`);
      response.cookies.set(companySocialProofCookie, await makeCompanyProof(result.identity),
        {httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:1800});
      return response;
    }
    const {usersCrud,sessionsCrud,refreshTokensCrud} = await authCrudOperations();
    const user = await usersCrud.findById(link.data.user_id);
    if (!user || !user.is_active || user.status === 'disabled' || !['manager','company','owner'].includes(user.user_type)
      || isPlatformAdmin(String(user.id),process.env.PLATFORM_ADMIN_IDS)) {
      return redirect(`/register-company?lang=${result.language}&identity=pending`);
    }
    await companyMembership(token,Number(user.id),'overview');
    const accessToken = await generateToken({sub:user.id,role:user.role,email:user.email});
    const refreshToken = generateRandomString();
    const session = await sessionsCrud.create({user_id:user.id,ip:getRequestIp(request),user_agent:request.headers.get('user-agent') || 'unknown'});
    await refreshTokensCrud.create({user_id:user.id,session_id:session.id,token:pbkdf2Hash(refreshToken),
      expires_at:new Date(Date.now()+REFRESH_TOKEN_EXPIRE_TIME*1000).toISOString()});
    const response = redirect('/company/dashboard');
    createAuthResponse({accessToken,refreshToken}).headers.getSetCookie().forEach(value=>response.headers.append('Set-Cookie',value));
    response.cookies.set(companySocialProofCookie,'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});
    return response;
  } catch { return redirect(fail); }
}

export { callback as GET, callback as POST };
