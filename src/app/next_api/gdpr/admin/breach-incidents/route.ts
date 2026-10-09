
import { requestMiddleware, validateRequestBody, parseQueryParams } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import CrudOperations from "@/lib/crud-operations";
import { generateAdminUserToken } from "@/lib/auth";

const checkAdmin = (context: any) => context.payload?.isAdmin === true;

export const GET = requestMiddleware(async (_request, context) => {
  if (!checkAdmin(context)) return createErrorResponse({ errorMessage: "Admin access required", status: 403 });

  try {
    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("personal_data_breach_incidents", adminToken);
    const incidents = await crud.findMany({}, { orderBy: { column: "detected_at", direction: "desc" }, limit: 100, offset: 0 });
    return createSuccessResponse(incidents || []);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);

export const POST = requestMiddleware(async (request, context) => {
  if (!checkAdmin(context)) return createErrorResponse({ errorMessage: "Admin access required", status: 403 });

  try {
    const body = await validateRequestBody(request);
    if (!body.title || !body.detected_at) {
      return createErrorResponse({ errorMessage: "title and detected_at are required", status: 400 });
    }

    const detectedAt = new Date(body.detected_at);
    const deadlineAt = new Date(detectedAt.getTime() + 72 * 60 * 60 * 1000);

    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("personal_data_breach_incidents", adminToken);

    const incident_code = `INC-${Date.now()}`;
    const record = await crud.create({
      incident_code,
      title: body.title,
      description: body.description || null,
      detected_at: detectedAt.toISOString(),
      occurred_at: body.occurred_at || null,
      risk_level: body.risk_level || "medium",
      authority_notification_required: body.authority_notification_required ?? false,
      user_notification_required: body.user_notification_required ?? false,
      report_deadline_at: deadlineAt.toISOString(),
      status: "open",
    });

    return createSuccessResponse(record, 201);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);

export const PUT = requestMiddleware(async (request, context) => {
  if (!checkAdmin(context)) return createErrorResponse({ errorMessage: "Admin access required", status: 403 });

  const { id } = parseQueryParams(request);
  if (!id) return createErrorResponse({ errorMessage: "ID is required", status: 400 });

  try {
    const body = await validateRequestBody(request);
    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("personal_data_breach_incidents", adminToken);

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status) updateData.status = body.status;
    if (body.authority_notified_at) updateData.authority_notified_at = body.authority_notified_at;
    if (body.users_notified_at) updateData.users_notified_at = body.users_notified_at;

    const record = await crud.update(id, updateData);
    return createSuccessResponse(record);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);
