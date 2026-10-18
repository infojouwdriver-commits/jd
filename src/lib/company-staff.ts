import { z } from "zod";
import { requestMiddleware, validateRequestBody } from "./api-utils";
import {
  operationsAccess,
  operationFailure,
  pageRange,
} from "./operations-access";
import { createSuccessResponse, createErrorResponse } from "./create-response";
import { hashString } from "./server-utils";
import { getAuthRoles } from "./auth";
const command = z
  .object({
    membership_id: z.number().int().positive().nullable(),
    role: z.enum(["owner", "fleet_manager", "accountant"]),
    is_active: z.boolean(),
    reason: z.string().trim().min(1).max(1000),
    email: z.string().trim().email().max(254).optional(),
    password: z
      .string()
      .min(12)
      .max(72)
      .refine((v) => Buffer.byteLength(v, "utf8") <= 72)
      .optional(),
  })
  .strict();
export const staffGET = requestMiddleware(async (request, context) => {
  try {
    const { client, companyId } = await operationsAccess(
        request,
        context,
        "staff",
      ),
      { offset, limit } = pageRange(request);
    const result = await client
      .from("company_users")
      .select("id,user_id,role,is_active,created_at", { count: "exact" })
      .eq("company_id", companyId)
      .order("id")
      .range(offset, offset + limit - 1);
    if (result.error) throw result.error;
    const users = result.data?.length
      ? await client
          .from("users")
          .select("id,email,display_name")
          .in(
            "id",
            result.data.map((x) => x.user_id),
          )
      : { data: [], error: null };
    if (users.error) throw users.error;
    return createSuccessResponse({
      rows: result.data.map((link) => ({
        ...link,
        ...{ identity: users.data?.find((u) => u.id === link.user_id) },
      })),
      total: result.count,
      limit,
      offset,
    });
  } catch (error) {
    return operationFailure(error);
  }
}, true);
export const staffPOST = requestMiddleware(async (request, context) => {
  try {
    const { client, companyId, actor, admin } = await operationsAccess(
      request,
      context,
      "staff",
    );
    const parsed = command.safeParse(await validateRequestBody(request));
    if (!parsed.success)
      return createErrorResponse({
        status: 400,
        errorMessage:
          "Check staff details; new passwords need 12–72 UTF-8 bytes",
      });
    const v = parsed.data;
    if (v.membership_id === null && (!v.email || !v.password))
      return createErrorResponse({
        status: 400,
        errorMessage: "New account email and password required",
      });
    const result = await client.rpc("security_change_company_staff", {
      p_company: companyId,
      p_actor: actor,
      p_admin: admin,
      p_membership: v.membership_id,
      p_role: v.role,
      p_active: v.is_active,
      p_reason: v.reason,
      p_email: v.email || null,
      p_hash: v.membership_id === null ? await hashString(v.password!) : null,
      p_user_role: getAuthRoles().userRole,
    });
    if (result.error) throw result.error;
    return createSuccessResponse(result.data);
  } catch (error) {
    return operationFailure(error);
  }
}, true);
