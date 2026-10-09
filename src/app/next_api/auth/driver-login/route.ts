
import { NextRequest } from "next/server";
import { requestMiddleware, validateRequestBody, getRequestIp } from "@/lib/api-utils";
import { createErrorResponse, createAuthResponse } from "@/lib/create-response";
import {
  generateToken,
  generateAdminUserToken,
  authCrudOperations,
  getAuthRoles,
} from "@/lib/auth";
import {
  generateRandomString,
  pbkdf2Hash,
  pbkdf2Verify,
  verifyHashString,
} from "@/lib/server-utils";
import { REFRESH_TOKEN_EXPIRE_TIME } from "@/constants/auth";
import CrudOperations from "@/lib/crud-operations";
import { z } from "zod";

const driverLoginSchema = z.object({
  phone: z.string().min(3, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

function normalizePhone(input: string): string {
  const compact = input?.trim()?.replace(/\s+/g, "")?.replace(/[^\d+]/g, "") || "";
  if (compact.startsWith("00")) {
    return `+${compact.slice(2)}`;
  }
  return compact;
}

function normalizePhoneCandidates(input: string): string[] {
  const raw = input?.trim() || "";
  const normalized = normalizePhone(raw);
  const digitsOnly = raw.replace(/\D/g, "");

  const candidates = new Set<string>();
  if (raw) candidates.add(raw);
  if (normalized) candidates.add(normalized);
  if (digitsOnly) candidates.add(digitsOnly);

  if (digitsOnly.startsWith("32")) {
    candidates.add(`0${digitsOnly.slice(2)}`);
    candidates.add(`+${digitsOnly}`);
  }

  if (digitsOnly.startsWith("00")) {
    candidates.add(`+${digitsOnly.slice(2)}`);
  }

  return Array.from(candidates).filter((value) => value.length > 0);
}

function getDriverEmailCandidates(phoneCandidates: string[]): string[] {
  const emails = new Set<string>();

  phoneCandidates.forEach((phone) => {
    const compact = phone.replace(/\s+/g, "");
    const digits = compact.replace(/\D/g, "");
    const withoutPlus = compact.replace(/^\+/, "");

    if (compact) emails.add(`${compact}@driver.local`);
    if (withoutPlus) emails.add(`${withoutPlus}@driver.local`);
    if (digits) emails.add(`${digits}@driver.local`);
  });

  return Array.from(emails);
}

async function verifyPasswordAgainstHash(
  plainPassword: string,
  storedHash?: string
): Promise<boolean> {
  if (!storedHash) return false;

  if (storedHash.startsWith("$2")) {
    return verifyHashString(plainPassword, storedHash);
  }

  if (/^[a-f0-9]{128}$/i.test(storedHash)) {
    return pbkdf2Verify(plainPassword, storedHash);
  }

  return false;
}

async function findFirstByField(
  crud: CrudOperations,
  field: string,
  values: string[]
): Promise<any | null> {
  for (const value of values) {
    const list = await crud.findMany({ [field]: value });
    if (list?.[0]) {
      return list[0];
    }
  }

  return null;
}

async function findDriverByPhone(
  driversCrud: CrudOperations,
  phoneCandidates: string[]
): Promise<any | null> {
  return findFirstByField(driversCrud, "phone", phoneCandidates);
}

async function findCredentialByPhoneSafely(
  credentialsCrud: CrudOperations,
  phoneCandidates: string[]
): Promise<any | null> {
  try {
    return await findFirstByField(credentialsCrud, "phone", phoneCandidates);
  } catch (error) {
    console.error("Operation failed");
    return null;
  }
}

async function syncDriverCredentialsBestEffort(params: {
  credentialsCrud: CrudOperations;
  credential: any | null;
  driver: any;
  user: any;
  canonicalPhone: string;
  fallbackPhone: string;
}) {
  const { credentialsCrud, credential, driver, user, canonicalPhone, fallbackPhone } = params;
  const phone = canonicalPhone || fallbackPhone || driver?.phone || "";

  try {
    if (credential?.id) {
      await credentialsCrud.update(credential.id, {
        driver_id: driver.id,
        phone: phone || credential?.phone,
        password_hash: user?.password || credential?.password_hash,
        is_active: true,
        company_id: driver?.company_id || credential?.company_id || null,
        vehicle_id: driver?.current_vehicle_id || driver?.assigned_vehicle_id || null,
        preferred_language: driver?.preferred_language || credential?.preferred_language || "fr",
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return;
    }

    if (!phone || !user?.password) {
      return;
    }

    await credentialsCrud.create({
      driver_id: driver.id,
      phone,
      password_hash: user.password,
      is_active: true,
      company_id: driver?.company_id || null,
      vehicle_id: driver?.current_vehicle_id || driver?.assigned_vehicle_id || null,
      preferred_language: driver?.preferred_language || "fr",
      last_login_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Operation failed");
  }
}

export const POST = requestMiddleware(async (request: NextRequest) => {
  try {
    const ip = getRequestIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const body = await validateRequestBody(request);
    const validated = driverLoginSchema.parse(body);
    const { userRole } = getAuthRoles();

    const adminToken = await generateAdminUserToken();
    const credentialsCrud = new CrudOperations("driver_credentials", adminToken);
    const driversCrud = new CrudOperations("drivers", adminToken);
    const usersCrud = new CrudOperations("users", adminToken);

    const phoneCandidates = normalizePhoneCandidates(validated.phone);
    const canonicalPhone = normalizePhone(validated.phone);

    let credential: any = null;
    let driver: any = await findDriverByPhone(driversCrud, phoneCandidates);
    let user: any = null;

    if (driver?.user_id) {
      user = await usersCrud.findById(driver.user_id);
    }

    if (!driver) {
      credential = await findCredentialByPhoneSafely(credentialsCrud, phoneCandidates);

      if (credential?.is_active === false) {
        return createErrorResponse({
          errorMessage: "Your account is disabled. Please contact support.",
          status: 403,
        });
      }

      if (credential?.driver_id) {
        driver = await driversCrud.findById(credential.driver_id);
      }

      if (driver?.user_id) {
        user = await usersCrud.findById(driver.user_id);
      }
    }

    if (!user?.id) {
      const emailCandidates = getDriverEmailCandidates(phoneCandidates);
      user = await findFirstByField(usersCrud, "email", emailCandidates);

      if (user?.id && !driver) {
        const possibleDrivers = await driversCrud.findMany({ user_id: user.id });
        driver = possibleDrivers?.[0] || null;
      }
    }

    if (!driver?.id || !user?.id) {
      return createErrorResponse({
        errorMessage: "Invalid phone number or password",
        status: 401,
      });
    }

    if (driver?.status && driver.status !== "active") {
      return createErrorResponse({
        errorMessage: "Your account is disabled. Please contact support.",
        status: 403,
      });
    }

    const isValidUserPassword = await verifyPasswordAgainstHash(
      validated.password,
      user?.password || ""
    );

    let isValidCredentialPassword = false;
    if (credential?.password_hash) {
      isValidCredentialPassword = await verifyPasswordAgainstHash(
        validated.password,
        credential.password_hash
      );
    }

    if (!isValidUserPassword && !isValidCredentialPassword) {
      return createErrorResponse({
        errorMessage: "Invalid phone number or password",
        status: 401,
      });
    }

    if (!user?.email) {
      return createErrorResponse({
        errorMessage: "Driver record not found",
        status: 404,
      });
    }

    await syncDriverCredentialsBestEffort({
      credentialsCrud,
      credential,
      driver,
      user,
      canonicalPhone,
      fallbackPhone: phoneCandidates?.[0] || "",
    });

    const accessToken = await generateToken({
      sub: driver.user_id,
      role: user?.role || userRole,
      email: user.email,
    });

    const refreshToken = generateRandomString();
    const hashedRefreshToken = pbkdf2Hash(refreshToken);
    const { sessionsCrud, refreshTokensCrud } = await authCrudOperations();

    const session = await sessionsCrud.create({
      user_id: driver.user_id,
      ip,
      user_agent: userAgent,
    });

    await refreshTokensCrud.create({
      user_id: driver.user_id,
      session_id: session.id,
      token: hashedRefreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_TIME * 1000).toISOString(),
    });

    return createAuthResponse({ accessToken, refreshToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        errorMessage: error.errors?.[0]?.message || "Invalid request",
        status: 400,
      });
    }

    console.error("Operation failed");

    return createErrorResponse({
      errorMessage: error instanceof Error ? error.message : "Login failed. Please try again.",
      status: 500,
    });
  }
}, false);
