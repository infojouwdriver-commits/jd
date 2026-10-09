import {hashString} from "@/lib/server-utils";

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

async function getManagerCompanyId(userId: string, adminToken: string): Promise<number | null> {
  const companyUsersCrud = new CrudOperations('company_users', adminToken);
  const links = await companyUsersCrud.findMany({ user_id: parseInt(userId) });
  if (!links || links.length === 0) return null;
  return links[0].company_id;
}

// POST - Add driver to company
export const POST = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const body = await validateRequestBody(request);
    const { full_name, phone, password, national_id, driver_license } = body;

    if (!full_name || !phone || !password) {
      return createErrorResponse({ errorMessage: 'Full name, phone and password are required', status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const company_id = await getManagerCompanyId(user_id, adminToken);
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked to this account', status: 403 });

    const usersCrud = new CrudOperations('users', adminToken);
    const phoneEmail = `${phone.replace(/\s+/g, '')}@driver.local`;
    const existing = await usersCrud.findMany({ email: phoneEmail });
    if (existing && existing.length > 0) {
      return createErrorResponse({ errorMessage: 'Phone number already in use', status: 400 });
    }

    const hashedPassword = await hashString(password);
    const newUser = await usersCrud.create({
      email: phoneEmail,
      password: hashedPassword,
      role: 'app20251225073911jaqqaxdfir_v1_user',
      user_type: 'driver',
    });

    const driversCrud = new CrudOperations('drivers', adminToken);
    const newDriver = await driversCrud.create({
      user_id: newUser.id,
      company_id,
      full_name,
      phone,
      national_id: national_id || null,
      driver_license: driver_license || null,
      status: 'active',
    });

    return createSuccessResponse(newDriver, 201);
  } catch (error: any) {
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
    const company_id = await getManagerCompanyId(user_id, adminToken);
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const driversCrud = new CrudOperations('drivers', adminToken);
    const existing = await driversCrud.findById(id);
    if (!existing || existing.company_id !== company_id) {
      return createErrorResponse({ errorMessage: 'Driver not found in your company', status: 404 });
    }

    const {password} = body;
    const driverData = Object.fromEntries(Object.entries(body).filter(([key]) => ['full_name','phone','national_id','driver_license'].includes(key)));
    if (password) {
      const usersCrud = new CrudOperations('users', adminToken);
      const hashed = await hashString(password);
      await usersCrud.update(existing.user_id, { password: hashed });
    }

    const updated = await driversCrud.update(id, { ...driverData, updated_at: new Date().toISOString() });
    return createSuccessResponse(updated);
  } catch (error: any) {
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
    const company_id = await getManagerCompanyId(user_id, adminToken);
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const driversCrud = new CrudOperations('drivers', adminToken);
    const existing = await driversCrud.findById(id);
    if (!existing || existing.company_id !== company_id) {
      return createErrorResponse({ errorMessage: 'Driver not found in your company', status: 404 });
    }

    const usersCrud = new CrudOperations('users', adminToken);
    await driversCrud.delete(id);
    await usersCrud.delete(existing.user_id);

    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to delete driver', status: 500 });
  }
}, true);
