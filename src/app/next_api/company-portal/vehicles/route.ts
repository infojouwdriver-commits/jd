
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';

async function getManagerCompanyId(userId: string, adminToken: string): Promise<number | null> {
  const companyUsersCrud = new CrudOperations('company_users', adminToken);
  const links = await companyUsersCrud.findMany({ user_id: parseInt(userId) });
  if (!links || links.length === 0) return null;
  return links[0].company_id;
}

// POST - Add vehicle
export const POST = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const body = await validateRequestBody(request);
    const { brand, model, plate_number, vin } = body;

    if (!brand || !model || !plate_number) {
      return createErrorResponse({ errorMessage: 'Brand, model and plate number are required', status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const company_id = await getManagerCompanyId(user_id, adminToken);
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const newVehicle = await vehiclesCrud.create({
      company_id,
      brand,
      model,
      plate_number,
      vin: vin || null,
      status: 'active',
      documents: [],
    });

    return createSuccessResponse(newVehicle, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to add vehicle', status: 500 });
  }
}, true);

// PUT - Update vehicle
export const PUT = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const { id } = parseQueryParams(request);
    if (!id) return createErrorResponse({ errorMessage: 'Vehicle ID required', status: 400 });

    const body = await validateRequestBody(request);
    const adminToken = await generateAdminUserToken();
    const company_id = await getManagerCompanyId(user_id, adminToken);
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const existing = await vehiclesCrud.findById(id);
    if (!existing || existing.company_id !== company_id) {
      return createErrorResponse({ errorMessage: 'Vehicle not found in your company', status: 404 });
    }

    const fields = Object.fromEntries(Object.entries(body).filter(([key]) => ['brand','model','plate_number','vin','status'].includes(key)));
    const updated = await vehiclesCrud.update(id, {...fields, updated_at: new Date().toISOString()});
    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to update vehicle', status: 500 });
  }
}, true);

// DELETE - Remove vehicle
export const DELETE = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;
  if (!user_id) return createErrorResponse({ errorMessage: 'Unauthorized', status: 401 });

  try {
    const { id } = parseQueryParams(request);
    if (!id) return createErrorResponse({ errorMessage: 'Vehicle ID required', status: 400 });

    const adminToken = await generateAdminUserToken();
    const company_id = await getManagerCompanyId(user_id, adminToken);
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const existing = await vehiclesCrud.findById(id);
    if (!existing || existing.company_id !== company_id) {
      return createErrorResponse({ errorMessage: 'Vehicle not found in your company', status: 404 });
    }

    await vehiclesCrud.delete(id);
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to delete vehicle', status: 500 });
  }
}, true);
