
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { hashString } from '@/lib/server-utils';

// PUT - Update company password (admin only or company manager)
export const PUT = requestMiddleware(async (request, context) => {
  try {
    const body = await validateRequestBody(request);
    const { company_id, password } = body;

    if (!company_id || !password) {
      return createErrorResponse({ errorMessage: 'Company ID and password are required', status: 400 });
    }

    if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      return createErrorResponse({ errorMessage: 'Password must be at least 12 characters and at most 72 UTF-8 bytes', status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations('companies', adminToken);

    const existing = await companiesCrud.findById(company_id);
    if (!existing) {
      return createErrorResponse({ errorMessage: 'Company not found', status: 404 });
    }

    // If not admin, verify the user is linked to this company
    if (!context.payload?.isAdmin) {
      const companyUsersCrud = new CrudOperations('company_users', adminToken);
      const links = await companyUsersCrud.findMany({ user_id: parseInt(context.payload?.sub || '0') });
      const isLinked = links?.some((l: any) => String(l.company_id) === String(company_id));
      if (!isLinked) {
        return createErrorResponse({ errorMessage: 'Unauthorized', status: 403 });
      }
    }

    const hashed = await hashString(password);
    await companiesCrud.update(company_id, { password_hash: hashed });

    return createSuccessResponse({ success: true });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to update password', status: 500 });
  }
}, true);

// POST - Bulk set password for all companies (admin only)
export const POST = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) {
    return createErrorResponse({ errorMessage: 'Admin access required', status: 403 });
  }

  try {
    const body = await validateRequestBody(request);
    const { password } = body;

    if (!password || typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      return createErrorResponse({ errorMessage: 'Password must be at least 12 characters and at most 72 UTF-8 bytes', status: 400 });
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

    return createSuccessResponse({ updated });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to update passwords', status: 500 });
  }
}, true);
