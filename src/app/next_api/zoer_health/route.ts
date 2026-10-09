
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import { requestMiddleware, validateEnv } from "@/lib/api-utils";
import { authCrudOperations, generateAdminUserToken, getAuthRoles } from "@/lib/auth";
import CrudOperations from "@/lib/crud-operations";

function normalizeUrlPreview(input: string | undefined): string | null {
  const value = input?.trim();

  if (!value) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return "invalid";
  }
}

export const GET = requestMiddleware(async () => {
  try {
    validateEnv();

    const roles = getAuthRoles();
    const adminToken = await generateAdminUserToken();
    const { usersCrud } = await authCrudOperations();
    const driversCrud = new CrudOperations("drivers", adminToken);
    const companiesCrud = new CrudOperations("companies", adminToken);
    const credentialsCrud = new CrudOperations("driver_credentials", adminToken);

    const [usersSample, driversSample, companiesSample, credentialsSample] =
      await Promise.all([
        usersCrud.findMany({}, { limit: 1, offset: 0 }),
        driversCrud.findMany({}, { limit: 1, offset: 0 }),
        companiesCrud.findMany({}, { limit: 1, offset: 0 }),
        credentialsCrud.findMany({}, { limit: 1, offset: 0 }),
      ]);

    return createSuccessResponse({
      status: "ok",
      server: "running",
      database: "connected",
      auth: "ready",
      roles,
      tables: {
        users: Array.isArray(usersSample),
        drivers: Array.isArray(driversSample),
        companies: Array.isArray(companiesSample),
        driver_credentials: Array.isArray(credentialsSample),
      },
      env: {
        postgrestUrl: Boolean(process.env.POSTGREST_URL),
        postgrestUrlPreview: normalizeUrlPreview(process.env.POSTGREST_URL),
        postgrestSchema: process.env.POSTGREST_SCHEMA || null,
        postgrestApiKey: Boolean(process.env.POSTGREST_API_KEY),
        jwtSecret: Boolean(process.env.JWT_SECRET),
        nextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
        hashSaltKey: Boolean(process.env.HASH_SALT_KEY),
        authEnabled: process.env.NEXT_PUBLIC_ENABLE_AUTH || null,
        zoerHost: normalizeUrlPreview(process.env.NEXT_PUBLIC_ZOER_HOST),
        stripeUrl: normalizeUrlPreview(process.env.NEXT_PUBLIC_STRIPE_URL),
      },
    });
  } catch (error: any) {
    console.error("Operation failed");

    return createErrorResponse({
      errorMessage: error?.message || "Health check failed",
      status: 500,
    });
  }
}, false);
