import {calendarMonthDeadline} from "@/lib/security-policy";

import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import CrudOperations from "@/lib/crud-operations";
import { generateAdminUserToken } from "@/lib/auth";

const VALID_TYPES = ["access", "rectification", "erasure", "portability", "restriction", "objection"];

export const GET = requestMiddleware(async (_request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: "Auth required", status: 401 });

  try {
    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("data_subject_requests", adminToken);
    const requests = await crud.findMany(
      { user_id: parseInt(user_id) },
      { orderBy: { column: "requested_at", direction: "desc" } }
    );
    return createSuccessResponse(requests || []);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);

export const POST = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: "Auth required", status: 401 });

  try {
    const body = await validateRequestBody(request);
    const { request_type, request_details } = body;

    if (!request_type || !VALID_TYPES.includes(request_type)) {
      return createErrorResponse({ errorMessage: "Valid request_type is required", status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("data_subject_requests", adminToken);

    const dueAt = calendarMonthDeadline(new Date());

    const record = await crud.create({
      user_id: parseInt(user_id),
      request_type,
      status: "submitted",
      request_details: typeof request_details === "string" ? request_details.slice(0, 4000) : null,
      requested_at: new Date().toISOString(),
      due_at: dueAt.toISOString(),
    });

    return createSuccessResponse(record, 201);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);
