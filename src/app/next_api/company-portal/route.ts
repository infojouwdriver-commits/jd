
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';

// GET - Fetch company info for the logged-in manager
export const GET = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({ errorMessage: 'User ID required', status: 400 });
  }

  try {
    const adminToken = await generateAdminUserToken();

    const companyUsersCrud = new CrudOperations('company_users', adminToken);
    const links = await companyUsersCrud.findMany({ user_id: parseInt(user_id) });

    if (!links || links.length === 0) {
      return createErrorResponse({ errorMessage: 'No company linked to this account', status: 404 });
    }

    const company_id = links[0].company_id;
    const companiesCrud = new CrudOperations('companies', adminToken);
    const company = await companiesCrud.findById(company_id);

    if (!company) {
      return createErrorResponse({ errorMessage: 'Company not found', status: 404 });
    }

    const driversCrud = new CrudOperations('drivers', adminToken);
    const drivers = await driversCrud.findMany({ company_id }, { limit: 10000, offset: 0 });

    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const vehicles = await vehiclesCrud.findMany({ company_id }, { limit: 10000, offset: 0 });

    return createSuccessResponse({ company, drivers: drivers || [], vehicles: vehicles || [] });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || 'Failed to load company data', status: 500 });
  }
}, true);
