import { createHmac } from "node:crypto";
import { z } from "zod";
import { requestMiddleware, validateRequestBody } from "./api-utils";
import { generateAdminUserToken, getAuthRoles } from "./auth";
import { companyMembership } from "./company-membership";
import { createPostgrestClient } from "./postgrest";
import { parseDriverFields, driverValidationError } from "./driver-account";
import { hashString } from "./server-utils";
import { operationFailure, pageRange } from "./operations-access";
import { createSuccessResponse, createErrorResponse } from "./create-response";

// Never expose the private payload (password hashes) or concurrency snapshot.
const publicFields =
  "id,company_id,entity_type,entity_id,action,summary,status,requested_by,reviewed_by,review_notes,created_at,reviewed_at";
const vehicleFields = z
  .object({
    brand: z.string().trim().min(1).max(100).optional(),
    model: z.string().trim().min(1).max(100).optional(),
    plate_number: z.string().trim().min(1).max(32).optional(),
    vin: z.string().trim().max(100).nullable().optional(),
    status: z.enum(["active", "inactive", "maintenance"]).optional(),
  })
  .strict();

export async function submitCompanyChange(
  token: string,
  actor: number,
  companyId: number,
  entity: string,
  action: string,
  entityId: number | null,
  payload: Record<string, unknown>,
  summary: Record<string, unknown>,
  fingerprint: string,
  requestId: string,
) {
  const r = await createPostgrestClient(token).rpc(
    "security_submit_company_change",
    {
      p_company: companyId,
      p_actor: actor,
      p_entity: entity,
      p_action: action,
      p_entity_id: entityId,
      p_payload: { ...payload, command_hash: fingerprint },
      p_summary: summary,
      p_fingerprint: changeFingerprint([
        actor,
        companyId,
        entity,
        action,
        entityId,
        requestId,
      ]),
    },
  );
  if (r.error) throw r.error;
  return createSuccessResponse(r.data, 202);
}

// Stable HMAC permits safe replay without retaining plaintext credentials.
export function changeFingerprint(value: unknown) {
  return createHmac("sha256", process.env.JWT_SECRET!)
    .update(
      JSON.stringify(value, (_key, item) =>
        item && typeof item === "object" && !Array.isArray(item)
          ? Object.fromEntries(
              Object.entries(item).sort(([a], [b]) => a.localeCompare(b)),
            )
          : item,
      ),
    )
    .digest("hex");
}

export function fleetChange(
  entity: "driver" | "vehicle",
  action: "create" | "update" | "deactivate",
) {
  return requestMiddleware(async (request, context) => {
    try {
      const token = await generateAdminUserToken(),
        actor = Number(context.payload!.sub);
      const selected = request.nextUrl.searchParams.get("company_id");
      const link = await companyMembership(
        token,
        actor,
        "fleet",
        selected === null ? undefined : Number(selected),
      );
      const entityId =
        action === "create"
          ? null
          : Number(request.nextUrl.searchParams.get("id"));
      if (
        action !== "create" &&
        (!Number.isSafeInteger(entityId) || entityId! < 1)
      )
        return createErrorResponse({
          status: 400,
          errorMessage: "Record required",
        });
      const requestId = z
        .string()
        .uuid()
        .parse(request.nextUrl.searchParams.get("request_id"));
      const body =
        action === "deactivate" ? {} : await validateRequestBody(request);
      let payload: Record<string, unknown>, summary: Record<string, unknown>;
      if (entity === "driver") {
        const { password, ...driver } = parseDriverFields(
          body,
          action === "create",
        );
        // Portal changes cannot reassign another company's vehicles or identities.
        if ("current_vehicle_id" in driver || "assigned_vehicle_id" in driver)
          return createErrorResponse({
            status: 400,
            errorMessage:
              "Vehicle assignment requires administrator review separately",
          });
        const account: Record<string, string> = {};
        if (driver.phone) account.email = `${driver.phone}@driver.local`;
        if (password) account.password = await hashString(password);
        if (action === "create") account.role = getAuthRoles().userRole;
        payload = { driver, account };
        summary = { ...driver, password_change: Boolean(password) };
      } else {
        const fields = vehicleFields.parse(body);
        if (
          action === "create" &&
          (!fields.brand || !fields.model || !fields.plate_number)
        )
          return createErrorResponse({
            status: 400,
            errorMessage: "Brand, model and plate required",
          });
        payload = summary = fields;
      }
      return await submitCompanyChange(
        token,
        actor,
        Number(link.company_id),
        entity,
        action,
        entityId,
        payload,
        summary,
        changeFingerprint([
          actor,
          link.company_id,
          entity,
          action,
          entityId,
          body,
        ]),
        requestId,
      );
    } catch (error) {
      return driverValidationError(error) || operationFailure(error);
    }
  }, true);
}

export const changesGET = requestMiddleware(async (request, context) => {
  try {
    const token = await generateAdminUserToken(),
      client = createPostgrestClient(token);
    const { offset, limit } = pageRange(request);
    let query = client
      .from("company_change_requests")
      .select(publicFields, { count: "exact" });
    if (!context.payload?.isAdmin) {
      const link = await companyMembership(
        token,
        Number(context.payload!.sub),
        "overview",
        Number(request.nextUrl.searchParams.get("company_id")),
      );
      // Accountants do not read fleet/identity change requests.
      if (
        !["owner", "portal_owner", "manager", "fleet_manager"].includes(
          link.role,
        )
      )
        return createErrorResponse({
          status: 403,
          errorMessage: "Fleet or owner required",
        });
      query = query.eq("company_id", link.company_id);
      if (["manager", "fleet_manager"].includes(link.role))
        query = query.in("entity_type", ["driver", "vehicle"]);
    }
    const result = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (result.error) throw result.error;
    return createSuccessResponse({ rows: result.data, total: result.count });
  } catch (error) {
    return operationFailure(error);
  }
}, true);

export const changesPUT = requestMiddleware(async (request, context) => {
  try {
    if (!context.payload?.isAdmin)
      return createErrorResponse({
        status: 403,
        errorMessage: "Administrator required",
      });
    const v = z
      .object({
        id: z.number().int().positive(),
        decision: z.enum(["approved", "rejected"]),
        notes: z.string().trim().max(1000),
      })
      .strict()
      .parse(await validateRequestBody(request));
    if (v.decision === "rejected" && !v.notes)
      return createErrorResponse({
        status: 400,
        errorMessage: "Rejection reason required",
      });
    const result = await createPostgrestClient(
      await generateAdminUserToken(),
    ).rpc("security_review_company_change", {
      p_id: v.id,
      p_actor: Number(context.payload.sub),
      p_decision: v.decision,
      p_notes: v.notes,
    });
    if (result.error) throw result.error;
    return createSuccessResponse(result.data);
  } catch (error) {
    return driverValidationError(error) || operationFailure(error);
  }
}, true);
