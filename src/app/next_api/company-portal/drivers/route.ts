import {companyMembership} from '@/lib/company-membership';
import {hashString} from "@/lib/server-utils";

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { parseDriverFields, mutateDriverAccount, driverValidationError } from '@/lib/driver-account';

async function getManagerCompanyId(userId: string, adminToken: string, company: string | null): Promise<number> {
  return Number((await companyMembership(adminToken,Number(userId),'fleet',company===null?undefined:Number(company))).company_id);
}

// POST - Add driver to company
export const POST = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const body = await validateRequestBody(request);
    const fields = parseDriverFields(body, true);
    const adminToken = await generateAdminUserToken();
    const company_id = await getManagerCompanyId(user_id, adminToken, request.nextUrl.searchParams.get('company_id'));
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked to this account', status: 403 });

    const created = await mutateDriverAccount(adminToken, 'create', {companyId:Number(company_id),fields});
    return createSuccessResponse(created.driver,201);
  } catch (error: any) {
    if(error instanceof Response)return error;
    const invalid = driverValidationError(error); if (invalid) return invalid;
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to add driver', status: 500 });
  }
}, true);

// PUT - Update driver
export const PUT = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const { id } = parseQueryParams(request);
    if (!id) return createErrorResponse({ errorMessage: 'Driver ID required', status: 400 });

    const body = await validateRequestBody(request);
    const adminToken = await generateAdminUserToken();
    const company_id = await getManagerCompanyId(user_id, adminToken, request.nextUrl.searchParams.get('company_id'));
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const driversCrud = new CrudOperations('drivers', adminToken);
    const existing = await driversCrud.findById(id);
    if (!existing || String(existing.company_id) !== String(company_id)) {
      return createErrorResponse({ errorMessage: 'Driver not found in your company', status: 404 });
    }

    const fields = parseDriverFields(body);
    const updated = await mutateDriverAccount(adminToken, 'update', {id, fields});
    return createSuccessResponse(updated.driver);
  } catch (error: any) {
    if(error instanceof Response)return error;
    const invalid = driverValidationError(error); if (invalid) return invalid;
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to update driver', status: 500 });
  }
}, true);

// DELETE - Remove driver
export const DELETE = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const { id } = parseQueryParams(request);
    if (!id) return createErrorResponse({ errorMessage: 'Driver ID required', status: 400 });

    const adminToken = await generateAdminUserToken();
    const company_id = await getManagerCompanyId(user_id, adminToken, request.nextUrl.searchParams.get('company_id'));
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const driversCrud = new CrudOperations('drivers', adminToken);
    const existing = await driversCrud.findById(id);
    if (!existing || String(existing.company_id) !== String(company_id)) {
      return createErrorResponse({ errorMessage: 'Driver not found in your company', status: 404 });
    }

    await mutateDriverAccount(adminToken, 'deactivate', {id});
    return createSuccessResponse({id,status:'inactive'});
  } catch (error: any) {
    if(error instanceof Response)return error;
    const invalid = driverValidationError(error); if (invalid) return invalid;
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to delete driver', status: 500 });
  }
}, true);
