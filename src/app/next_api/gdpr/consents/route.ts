
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import CrudOperations from "@/lib/crud-operations";
import { generateAdminUserToken } from "@/lib/auth";

export const GET = requestMiddleware(async (_request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: "Auth required", status: 401 });

  try {
    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("user_consents", adminToken);
    const consents = await crud.findMany({ user_id: parseInt(user_id) });
    return createSuccessResponse(consents || []);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);

export const POST = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: "Auth required", status: 401 });

  try {
    const body = await validateRequestBody(request);
    const { consents } = body;

    if (!Array.isArray(consents) || consents.length === 0 || consents.length > 10 || consents.some((c: any) => !c || !["essential","analytics","marketing"].includes(c.consent_key) || typeof c.granted !== "boolean")) {
      return createErrorResponse({ errorMessage: "Consents array is required", status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("user_consents", adminToken);

    const ip_address = null;
    const user_agent = null;

    const results = [];
    for (const consent of consents) {
      const record = await crud.create({
        user_id: parseInt(user_id),
        consent_scope: "cookie_category",
        consent_key: consent.consent_key,
        consent_version: "1.0",
        granted: consent.granted,
        consent_text_snapshot: `${consent.consent_key}: ${consent.granted ? "accepted" : "rejected"}`,
        consent_method: "banner",
        ip_address,
        user_agent,
        consent_time: new Date().toISOString(),
      });
      results.push(record);
    }

    return createSuccessResponse(results, 201);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);
