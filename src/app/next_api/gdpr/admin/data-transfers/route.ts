
import { requestMiddleware, validateRequestBody, parseQueryParams } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import CrudOperations from "@/lib/crud-operations";
import { generateAdminUserToken } from "@/lib/auth";

const checkAdmin = (context: any) => context.payload?.isAdmin === true;

export const GET = requestMiddleware(async (_request, context) => {
  if (!checkAdmin(context)) return createErrorResponse({ errorMessage: "Admin access required", status: 403 });

  try {
    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("data_transfer_registry", adminToken);
    const transfers = await crud.findMany({ is_active: true }, { limit: 100, offset: 0 });
    return createSuccessResponse(transfers || []);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);

export const POST = requestMiddleware(async (request, context) => {
  if (!checkAdmin(context)) return createErrorResponse({ errorMessage: "Admin access required", status: 403 });

  try {
    const body = await validateRequestBody(request);
    const required = ["data_category", "destination_country", "recipient_type", "transfer_purpose", "legal_basis", "safeguard_mechanism"];
    for (const field of required) {
      if (!body[field]) return createErrorResponse({ errorMessage: `${field} is required`, status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("data_transfer_registry", adminToken);

    const transfer_code = `TRF-${Date.now()}`;
    const record = await crud.create({
      transfer_code,
      data_category: body.data_category,
      destination_country: body.destination_country,
      recipient_type: body.recipient_type,
      transfer_purpose: body.transfer_purpose,
      legal_basis: body.legal_basis,
      safeguard_mechanism: body.safeguard_mechanism,
      transfer_frequency: body.transfer_frequency || null,
      is_personal_data: body.is_personal_data ?? true,
      is_active: true,
      notes: body.notes || null,
    });

    return createSuccessResponse(record, 201);
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);

export const DELETE = requestMiddleware(async (request, context) => {
  if (!checkAdmin(context)) return createErrorResponse({ errorMessage: "Admin access required", status: 403 });

  const { id } = parseQueryParams(request);
  if (!id) return createErrorResponse({ errorMessage: "ID is required", status: 400 });

  try {
    const adminToken = await generateAdminUserToken();
    const crud = new CrudOperations("data_transfer_registry", adminToken);
    await crud.update(parseInt(id), { is_active: false });
    return createSuccessResponse({ id });
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message, status: 500 });
  }
}, true);
