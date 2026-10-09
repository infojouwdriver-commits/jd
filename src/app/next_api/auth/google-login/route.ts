
import { NextRequest } from "next/server";
import { requestMiddleware, validateRequestBody, getRequestIp } from "@/lib/api-utils";
import { createErrorResponse, createAuthResponse } from "@/lib/create-response";
import {
  generateAdminUserToken,
  generateToken,
  authCrudOperations,
  getAuthRoles,
} from "@/lib/auth";
import { generateRandomString, pbkdf2Hash } from "@/lib/server-utils";
import { REFRESH_TOKEN_EXPIRE_TIME } from "@/constants/auth";
import { userRegisterCallback } from "@/lib/user-register";
import CrudOperations from "@/lib/crud-operations";

interface GoogleUserProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

function isValidGoogleToken(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 20;
}

async function fetchGoogleUserProfile(
  accessToken: string
): Promise<GoogleUserProfile | null> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const profile = (await response.json()) as GoogleUserProfile;

  if (!profile?.sub || !profile?.email || profile?.email_verified !== true) {
    return null;
  }

  return profile;
}

async function findGoogleUser(
  profile: GoogleUserProfile,
  usersCrud: CrudOperations,
  oauthCrud: CrudOperations
) {
  const oauthRecords = await oauthCrud.findMany({
    provider: "google",
    provider_user_id: profile.sub,
  });

  const oauthRecord = oauthRecords?.[0] || null;

  if (oauthRecord?.user_id) {
    const user = await usersCrud.findById(oauthRecord.user_id);
    if (user?.id) {
      return { user, oauthRecord };
    }
  }

  const usersByEmail = await usersCrud.findMany({ email: profile.email });
  return { user: usersByEmail?.[0] || null, oauthRecord };
}

async function syncGoogleProvider(
  oauthCrud: CrudOperations,
  oauthRecord: any,
  userId: number,
  profile: GoogleUserProfile
) {
  const providerData = {
    user_id: userId,
    provider: "google",
    provider_user_id: profile.sub,
    provider_email: profile.email,
    provider_name: profile.name || null,
    provider_avatar_url: profile.picture || null,
    raw_profile: profile,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  if (oauthRecord?.id) {
    await oauthCrud.update(oauthRecord.id, providerData);
    return;
  }

  await oauthCrud.create(providerData);
}

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const body = await validateRequestBody(request);
    const googleAccessToken = body?.access_token;

    if (!isValidGoogleToken(googleAccessToken)) {
      return createErrorResponse({
        errorMessage: "رمز المصادقة من Google غير صالح أو مفقود.",
        status: 400,
      });
    }

    const profile = await fetchGoogleUserProfile(googleAccessToken);

    if (!profile) {
      return createErrorResponse({
        errorMessage: "تعذر التحقق من حساب Google. يرجى اختيار حساب Google موثّق ثم المحاولة مجددًا.",
        status: 401,
      });
    }

    const { usersCrud, sessionsCrud, refreshTokensCrud } =
      await authCrudOperations();
    const adminToken = await generateAdminUserToken();
    const oauthCrud = new CrudOperations("user_oauth_providers", adminToken);
    const { userRole } = getAuthRoles();
    const { user: existingUser, oauthRecord } = await findGoogleUser(
      profile,
      usersCrud,
      oauthCrud
    );

    let user = existingUser;

    if (!user) {
      user = await usersCrud.create({
        email: profile.email,
        password: "NOT-SET",
        role: userRole,
        user_type: "admin",
        auth_provider: "google",
        google_id: profile.sub,
        avatar_url: profile.picture || null,
        display_name: profile.name || null,
      });

      await userRegisterCallback({
        id: String(user.id),
        email: user.email,
        role: user.role,
        user_type: user.user_type,
      });
    } else {
      user = await usersCrud.update(user.id, {
        google_id: user?.google_id || profile.sub,
        avatar_url: profile.picture || user?.avatar_url || null,
        display_name: profile.name || user?.display_name || null,
        updated_at: new Date().toISOString(),
      });
    }

    await syncGoogleProvider(oauthCrud, oauthRecord, user.id, profile);

    const accessToken = await generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = generateRandomString();
    const session = await sessionsCrud.create({
      user_id: user.id,
      ip: getRequestIp(request),
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    await refreshTokensCrud.create({
      user_id: user.id,
      session_id: session.id,
      token: pbkdf2Hash(refreshToken),
      expires_at: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRE_TIME * 1000
      ).toISOString(),
    });

    return createAuthResponse({ accessToken, refreshToken });
  } catch (error) {
    console.error("Operation failed");

    return createErrorResponse({
      errorMessage: "تعذر إكمال تسجيل الدخول عبر Google. يرجى المحاولة لاحقًا.",
      status: 500,
    });
  }
}, false);
