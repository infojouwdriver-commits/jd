
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { hashString, verifyHashString } from '@/lib/server-utils';

// POST - Set password for a specific company (admin only)
export const POST = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) {
    return createErrorResponse({ errorMessage: 'Admin access required', status: 403 });
  }

  try {
    const body = await validateRequestBody(request);
    const { company_id, password } = body;

    if (!company_id || !password) {
      return createErrorResponse({ errorMessage: 'company_id and password are required', status: 400 });
    }

    if (password.length < 4) {
      return createErrorResponse({ errorMessage: 'Password must be at least 4 characters', status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations('companies', adminToken);

    const existing = await companiesCrud.findById(company_id);
    if (!existing) {
      return createErrorResponse({ errorMessage: 'Company not found', status: 404 });
    }

    const hashed = await hashString(password);
    await companiesCrud.update(company_id, { password_hash: hashed });

    return createSuccessResponse({ success: true });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to set password', status: 500 });
  }
}, true);

// PUT - Bulk set password for ALL companies (admin only, one-time use)
export const PUT = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) {
    return createErrorResponse({ errorMessage: 'Admin access required', status: 403 });
  }

  try {
    const body = await validateRequestBody(request);
    const { password } = body;

    if (!password || password.length < 4) {
      return createErrorResponse({ errorMessage: 'Password must be at least 4 characters', status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations('companies', adminToken);

    const companies = await companiesCrud.findMany({}, { limit: 10000, offset: 0 });
    if (!companies || companies.length === 0) {
      return createSuccessResponse({ updated: 0 });
    }

    const hashed = await hashString(password);
    let updated = 0;

    for (const company of companies) {
      await companiesCrud.update(company.id, { password_hash: hashed });
      updated++;
    }

    return createSuccessResponse({ updated, message: `Password set for ${updated} companies` });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to set passwords', status: 500 });
  }
}, true);
