
import { requestMiddleware, validateRequestBody, parseQueryParams } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import CrudOperations from "@/lib/crud-operations";
import { generateAdminUserToken } from "@/lib/auth";

const checkAdmin = (context: any) => context.payload?.isAdmin === true;

const VALID_STATUSES = ["submitted", "in_review", "approved", "rejected", "completed", "cancelled"];

export const GET = requestMiddleware(async (request, context) => {
  if (!checkAdmin(context)) return createErrorResponse({ errorMessage: "Admin access required", status: 403 });

  const { status } = parseQueryParams(request);

  try {
    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("data_subject_requests", adminToken);

    const filters: Record<string, any> = {};
    if (status) filters.status = status;

    const requests = await crud.findMany(filters, {
      orderBy: { column: "requested_at", direction: "desc" },
      limit: 100,
      offset: 0,
    });
    return createSuccessResponse(requests || []);
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
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return createErrorResponse({ errorMessage: "Invalid status value", status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("data_subject_requests", adminToken);

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status) updateData.status = body.status;
    if (body.resolution_notes) updateData.resolution_notes = body.resolution_notes;
    if (body.status === "completed") updateData.resolved_at = new Date().toISOString();

    const record = await crud.update(id, updateData);
    return createSuccessResponse(record);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);
