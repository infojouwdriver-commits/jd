import {claimOnce} from "@/lib/security-session";

import { NextRequest } from "next/server";
import { requestMiddleware, getCookies } from "@/lib/api-utils";
import { createErrorResponse, createAuthResponse } from "@/lib/create-response";
import { generateToken, authCrudOperations } from "@/lib/auth";
import { generateRandomString, pbkdf2Hash } from "@/lib/server-utils";
import { REFRESH_TOKEN_EXPIRE_TIME } from "@/constants/auth";
import { AUTH_CODE } from "@/constants/auth";
import { authConfig } from "@/config/auth-config";

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const [refreshToken] = getCookies(request, [authConfig.refreshCookieName]);

    if (!refreshToken) {
      return createErrorResponse({
        errorCode: AUTH_CODE.REFRESH_TOKEN_MISSING,
        errorMessage: "Refresh token is missing",
        status: 401,
      });
    }

    const hashedRefreshToken = await pbkdf2Hash(refreshToken);
    const { usersCrud, sessionsCrud, refreshTokensCrud } = await authCrudOperations();

    const refreshTokenRecords = await refreshTokensCrud.findMany({
      token: hashedRefreshToken,
      revoked: false,
    });

    const refreshTokenRecord = refreshTokenRecords?.[0];

    if (
      !refreshTokenRecord ||
      new Date(refreshTokenRecord.expires_at).getTime() < new Date().getTime()
    ) {
      return createErrorResponse({
        errorCode: AUTH_CODE.REFRESH_TOKEN_EXPIRED,
        errorMessage: "Refresh token is expired or invalid",
        status: 401,
      });
    }

    const user = await usersCrud.findById(refreshTokenRecord.user_id);
    if (!user || user.is_active === false || user.status === 'disabled' || (user.security_revoked_before && Date.parse(refreshTokenRecord.created_at) <= Date.parse(user.security_revoked_before))) return createErrorResponse({errorMessage:'Session revoked', status:401});
    if (!await claimOnce('refresh', refreshTokenRecord.id)) return createErrorResponse({errorMessage:'Refresh token already used', status:401});

    const newRefreshToken = await generateRandomString();
    const hashedNewRefreshToken = await pbkdf2Hash(newRefreshToken);

    await refreshTokensCrud.create({
      token: hashedNewRefreshToken,
      user_id: refreshTokenRecord.user_id,
      session_id: refreshTokenRecord.session_id,
      expires_at: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRE_TIME * 1000
      ).toISOString(),
    });

    await sessionsCrud.update(refreshTokenRecord.session_id, {
      refresh_at: new Date().toISOString(),
    });

    if (!user) {
      return createErrorResponse({
        errorMessage: "The user does not exist.",
        status: 401,
      });
    }

    const accessToken = await generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return createAuthResponse({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error: any) {
    console.error("Operation failed");

    return createErrorResponse({
      errorMessage: error?.message || "Failed to refresh the token",
      status: 500,
    });
  }
}, false);
