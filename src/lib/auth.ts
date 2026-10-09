
import { SignJWT, jwtVerify } from "jose";
import {
  ACCESS_TOKEN_EXPIRE_TIME,
  AUTH_CODE,
  CACHE_DURATION,
  DURATION_EXPIRE_TIME,
} from "@/constants/auth";
import { User } from "@/types/auth";
import CrudOperations from "@/lib/crud-operations";
import { JWTPayload, normalizeServerEnv } from "./api-utils";

interface CachedAuthCrud {
  usersCrud: CrudOperations;
  sessionsCrud: CrudOperations;
  refreshTokensCrud: CrudOperations;
  userPasscodeCrud: CrudOperations;
  createdAt: number;
}

interface AuthRoles {
  userRole: string;
  adminRole: string;
}

let cachedAuthCrud: CachedAuthCrud | null = null;

function getResolvedJwtSecret(): string {
  normalizeServerEnv();

  const jwtSecret = process.env.JWT_SECRET?.trim() || "";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim() || "";
  const resolvedSecret = jwtSecret || nextAuthSecret;

  if (new TextEncoder().encode(resolvedSecret).length < 32) {
    throw new Error("JWT_SECRET is not configured");
  }

  process.env.JWT_SECRET = resolvedSecret;
  process.env.NEXTAUTH_SECRET = resolvedSecret;

  return resolvedSecret;
}

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getResolvedJwtSecret());
}

export function getAuthRoles(): AuthRoles {
  normalizeServerEnv();

  const schema = process.env.POSTGREST_SCHEMA?.trim() || "";
  const derivedUserRole = schema ? `${schema}_user` : "";
  const derivedAdminRole = schema ? `${schema}_admin_user` : "";
  const userRole = process.env.SCHEMA_USER?.trim() || derivedUserRole;
  const adminRole = process.env.SCHEMA_ADMIN_USER?.trim() || derivedAdminRole;

  if (!userRole || !adminRole) {
    throw new Error(
      "Schema roles are not configured. Check POSTGREST_SCHEMA, SCHEMA_USER, and SCHEMA_ADMIN_USER"
    );
  }

  return { userRole, adminRole };
}

export async function authCrudOperations(): Promise<{
  usersCrud: CrudOperations;
  sessionsCrud: CrudOperations;
  refreshTokensCrud: CrudOperations;
  userPasscodeCrud: CrudOperations;
}> {
  const now = Date.now();

  if (!cachedAuthCrud || now - cachedAuthCrud.createdAt > CACHE_DURATION * 1000) {
    const adminUserToken = await generateAdminUserToken();

    cachedAuthCrud = {
      usersCrud: new CrudOperations("users", adminUserToken),
      sessionsCrud: new CrudOperations("sessions", adminUserToken),
      refreshTokensCrud: new CrudOperations("refresh_tokens", adminUserToken),
      userPasscodeCrud: new CrudOperations("user_passcode", adminUserToken),
      createdAt: now,
    };
  }

  return cachedAuthCrud;
}

export async function generateAdminUserToken(): Promise<string> {
  const { adminRole } = getAuthRoles();

  return generateToken(
    {
      sub: "0",
      email: "system@local",
      role: adminRole,
    },
    DURATION_EXPIRE_TIME
  );
}

export async function generateToken(
  user: Omit<User, "isAdmin">,
  expiresIn: number = ACCESS_TOKEN_EXPIRE_TIME
): Promise<string> {
  const { adminRole, userRole } = getAuthRoles();
  const system = String(user.sub) === "0";
  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    sub: String(user.sub),
    email: user.email,
    role: system ? adminRole : userRole,
    isAdmin: false,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("jouw-driver")
    .setAudience("jouw-driver")
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getJwtSecret());
}

export async function verifyToken(
  token?: string | null
): Promise<{ valid: boolean; code: string; payload: JWTPayload | null }> {
  if (!token) {
    return {
      valid: false,
      code: AUTH_CODE.TOKEN_MISSING,
      payload: null,
    };
  }

  try {
    const verified = await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"], issuer: "jouw-driver", audience: "jouw-driver" });

    return {
      valid: true,
      code: AUTH_CODE.SUCCESS,
      payload: verified.payload as unknown as JWTPayload,
    };
  } catch (error: any) {
    if (error?.code === "ERR_JWT_EXPIRED") {
      return {
        valid: false,
        code: AUTH_CODE.TOKEN_EXPIRED,
        payload: null,
      };
    }

    return {
      valid: false,
      code: AUTH_CODE.TOKEN_MISSING,
      payload: null,
    };
  }
}
