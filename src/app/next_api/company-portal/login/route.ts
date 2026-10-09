

import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody, getRequestIp } from '@/lib/api-utils';
import { createErrorResponse, createAuthResponse } from '@/lib/create-response';
import { verifyHashString, generateRandomString, pbkdf2Hash } from '@/lib/server-utils';
import { generateToken, authCrudOperations, generateAdminUserToken } from '@/lib/auth';
import { REFRESH_TOKEN_EXPIRE_TIME } from '@/constants/auth';
import CrudOperations from '@/lib/crud-operations';

// POST - Company manager login (issues JWT cookies for proper authentication)
export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const ip = getRequestIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const body = await validateRequestBody(request);
    const { email, password } = body;

    if (!email || !password) {
      return createErrorResponse({
        errorMessage: 'Email and password are required',
        status: 400,
      });
    }

    const { usersCrud, sessionsCrud, refreshTokensCrud } = await authCrudOperations();

    // 1. Look up the user by email in the users table
    const users = await usersCrud.findMany({ email });
    const user = users?.[0];

    if (!user) {
      return createErrorResponse({
        errorMessage: 'Invalid email or password',
        status: 401,
      });
    }

    // 2. Reject Google-only accounts
    if (user.auth_provider === 'google' || !user.password || user.password === 'NOT-SET') {
      return createErrorResponse({
        errorMessage: 'This account uses Google Sign-In or has no password set. Please contact admin.',
        status: 401,
      });
    }

    // 3. Verify password
    const isValidPassword = await verifyHashString(password, user.password);
    if (!isValidPassword) {
      return createErrorResponse({
        errorMessage: 'Invalid email or password',
        status: 401,
      });
    }

    // 4. Ensure account is a company manager (must be linked through company_users)
    const adminToken = await generateAdminUserToken();
    const companyUsersCrud = new CrudOperations('company_users', adminToken);
    const links = await companyUsersCrud.findMany({ user_id: user.id });

    if (!links || links.length === 0) {
      return createErrorResponse({
        errorMessage: 'No company is linked to this account. Please contact your administrator.',
        status: 403,
      });
    }

    // Validate that the company actually exists
    const companyLink = links[0];
    const companiesCrud = new CrudOperations('companies', adminToken);
    const company = await companiesCrud.findById(companyLink.company_id);

    if (!company) {
      return createErrorResponse({
        errorMessage: 'Linked company not found. Please contact your administrator.',
        status: 403,
      });
    }

    // Optional: prefer accounts whose user_type is manager, but allow legacy records
    if (user.user_type && !['manager', 'company', 'owner'].includes(user.user_type)) {
      return createErrorResponse({
        errorMessage: 'This account is not a company portal account.',
        status: 403,
      });
    }

    // 5. Issue JWT access + refresh tokens (same flow as the regular auth login)
    const accessToken = await generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = generateRandomString();
    const hashedRefreshToken = pbkdf2Hash(refreshToken);

    const session = await sessionsCrud.create({
      user_id: user.id,
      ip,
      user_agent: userAgent,
    });

    await refreshTokensCrud.create({
      user_id: user.id,
      session_id: session.id,
      token: hashedRefreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_TIME * 1000).toISOString(),
    });

    return createAuthResponse({ accessToken, refreshToken });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || 'Login failed',
      status: 500,
    });
  }
}, false);

