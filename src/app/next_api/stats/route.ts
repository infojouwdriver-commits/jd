
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';

export const GET = requestMiddleware(async () => {
  try {
    const adminToken = await generateAdminUserToken();

    const driversCrud = new CrudOperations('drivers', adminToken);
    const companiesCrud = new CrudOperations('companies', adminToken);
    const tripsCrud = new CrudOperations('trips', adminToken);
    const invoicesCrud = new CrudOperations('invoices', adminToken);

    const [allDrivers, allCompanies, allCompletedTrips, allInvoices] = await Promise.all([
      driversCrud.findMany({ status: 'active' }, { limit: 10000 }),
      companiesCrud.findMany({}, { limit: 10000 }),
      tripsCrud.findMany({ status: 'completed' }, { limit: 100000 }),
      invoicesCrud.findMany({ status: 'sent' }, { limit: 100000 }),
    ]);

    const activeDriversCount = Array.isArray(allDrivers) ? allDrivers.length : 0;
    const companiesCount = Array.isArray(allCompanies) ? allCompanies.length : 0;
    const completedTripsCount = Array.isArray(allCompletedTrips) ? allCompletedTrips.length : 0;
    const sentInvoicesCount = Array.isArray(allInvoices) ? allInvoices.length : 0;

    return createSuccessResponse({
      activeDrivers: activeDriversCount,
      companies: companiesCount,
      completedTrips: completedTripsCount,
      sentInvoices: sentInvoicesCount,
      satisfactionRate: 99,
    });
  } catch (error) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: 'Failed to fetch statistics',
      status: 500,
    });
  }
}, false);
