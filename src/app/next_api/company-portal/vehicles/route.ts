import {createPostgrestClient} from '@/lib/postgrest';
import {companyMembership} from '@/lib/company-membership';

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';

async function getManagerCompanyId(userId: string, adminToken: string, company: string | null): Promise<number> {
  return Number((await companyMembership(adminToken,Number(userId),'fleet',company===null?undefined:Number(company))).company_id);
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
    const company_id = await getManagerCompanyId(user_id, adminToken, request.nextUrl.searchParams.get('company_id'));
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
    if(error instanceof Response)return error;
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
    const company_id = await getManagerCompanyId(user_id, adminToken, request.nextUrl.searchParams.get('company_id'));
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
    if(error instanceof Response)return error;
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
    const company_id = await getManagerCompanyId(user_id, adminToken, request.nextUrl.searchParams.get('company_id'));
    if (!company_id) return createErrorResponse({ errorMessage: 'No company linked', status: 403 });

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const existing = await vehiclesCrud.findById(id);
    if (!existing || existing.company_id !== company_id) {
      return createErrorResponse({ errorMessage: 'Vehicle not found in your company', status: 404 });
    }

    const client=createPostgrestClient(adminToken);
    const running=await client.from('trips').select('id',{count:'exact',head:true}).eq('vehicle_id',id).eq('status','in_progress').is('end_time',null);if(running.error)throw running.error;if(running.count)return createErrorResponse({status:409,errorMessage:'Finish the active trip first'});
    await vehiclesCrud.update(id,{status:'inactive',updated_at:new Date().toISOString()});
    return createSuccessResponse({ id });
  } catch (error: any) {
    if(error instanceof Response)return error;
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to delete vehicle', status: 500 });
  }
}, true);
