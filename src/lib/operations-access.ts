import type { NextRequest } from "next/server";
import type { ApiParams } from "./api-utils";
import { generateAdminUserToken } from "./auth";
import { createPostgrestClient } from "./postgrest";
import {
  companyMembership,
  type CompanyCapability,
} from "./company-membership";
import { createErrorResponse } from "./create-response";
export async function operationsAccess(
  request: NextRequest,
  context: ApiParams,
  capability: CompanyCapability,
) {
  const companyId = Number(request.nextUrl.searchParams.get("company_id"));
  if (!Number.isSafeInteger(companyId) || companyId < 1)
    throw createErrorResponse({
      status: 400,
      errorMessage: "Company required",
    });
  const actor = Number(context.payload?.sub),
    admin = context.payload?.isAdmin === true;
  const token = await generateAdminUserToken();
  if (!admin) await companyMembership(token, actor, capability, companyId);
  return { companyId, actor, admin, client: createPostgrestClient(token) };
}
export function operationFailure(error: unknown) {
  if (error instanceof Response) return error;
  const code = (error as { code?: string })?.code;
  const status =
    code === "P0002"
      ? 404
      : code === "40001" || code === "PT409" || code === "23505"
        ? 409
        : code === "42501"
          ? 403
          : ["22023", "23514", "23502", "22P02", "22007"].includes(code || "")
            ? 400
            : 503;
  return createErrorResponse({
    status,
    errorMessage:
      status === 409
        ? "Data changed or request conflict. Refresh before trying again."
        : status === 400
          ? "Check configuration, document state and required fields."
          : status === 403
            ? "Permission denied"
            : "Record unavailable",
  });
}
export function pageRange(request: NextRequest) {
  const offset = Number(request.nextUrl.searchParams.get("offset") || 0),
    limit = Number(request.nextUrl.searchParams.get("limit") || 25);
  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 100000 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  )
    throw createErrorResponse({ status: 400, errorMessage: "Invalid page" });
  return { offset, limit };
}
