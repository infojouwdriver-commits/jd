
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, company_id } = parseQueryParams(request);
  
  const user_id = context.payload?.sub;
  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations("trips", adminToken);
    
    const filters: Record<string, unknown> = context.payload?.isAdmin ? {} : {user_id};
    if (context.payload?.isAdmin && company_id) {
      const companyId = Number(company_id);
      if (!Number.isSafeInteger(companyId) || companyId < 1) return createErrorResponse({errorMessage:'معرف الشركة غير صالح',status:400});
      filters.company_id = companyId;
    }
    const trips = await tripsCrud.findMany(
      filters,
      { 
        limit: limit || 50, 
        offset: offset || 0,
        orderBy: {
          column: 'created_at',
          direction: 'desc'
        }
      }
    );

    const invoicesCrud = new CrudOperations("invoices", adminToken);
    const tripIds = trips.map((trip: any) => trip.id);
    
    let tripInvoices: any[] = [];
    if (tripIds.length > 0) {
      // Query only invoices belonging to displayed trips; a global first-1000
      // scan silently lost receipts for drivers after the database grew.
      const groups = await Promise.all(tripIds.map((trip_id: number) => invoicesCrud.findMany({trip_id, invoice_category:'trip'})));
      tripInvoices = groups.flat();
    }

    const companiesCrud = new CrudOperations('companies', adminToken);
    const driversCrud = new CrudOperations('drivers', adminToken);
    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const uniqueRecords = async (crud: CrudOperations, ids: unknown[]) => {
      const unique = [...new Set(ids.filter(Boolean).map(String))];
      return new Map(await Promise.all(unique.map(async id => [id, await crud.findById(id)] as const)));
    };
    const [companies, drivers, vehicles] = await Promise.all([
      uniqueRecords(companiesCrud, trips.map(trip => trip.company_id)),
      uniqueRecords(driversCrud, trips.map(trip => trip.driver_id)),
      uniqueRecords(vehiclesCrud, trips.map(trip => trip.vehicle_id)),
    ]);
    const tripsWithInvoices = trips.map((trip: any) => {
      const invoice = tripInvoices.find((inv: any) => inv.trip_id === trip.id);
      return {
        ...trip,
        invoice: invoice || null,
        company_name: companies.get(String(trip.company_id))?.name || null,
        driver_name: drivers.get(String(trip.driver_id))?.full_name || null,
        vehicle_plate_number: vehicles.get(String(trip.vehicle_id))?.plate_number || null
      };
    });

    return createSuccessResponse(tripsWithInvoices);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل الرحلات",
      status: 500,
    });
  }
}, true);

export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الرحلة مطلوب",
      status: 400,
    });
  }

  const body = await validateRequestBody(request);

  if (body.price === undefined || body.price === null) {
    return createErrorResponse({
      errorMessage: "السعر الجديد مطلوب",
      status: 400,
    });
  }

  const newPrice = parseFloat(body.price);
  if (typeof body.price !== 'number' || !Number.isFinite(newPrice) || newPrice < 0 || newPrice > 100000) {
    return createErrorResponse({
      errorMessage: "السعر غير صالح",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations("trips", adminToken);

    const existing = await tripsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "الرحلة غير موجودة",
        status: 404,
      });
    }

    if (existing.locked_after_completion) return createErrorResponse({errorMessage:'Completed trip is locked; use an audited correction procedure',status:409});
    const updated = await tripsCrud.update(id, {
      price: parseFloat(newPrice.toFixed(2)),
      updated_at: new Date().toISOString(),
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تعديل سعر الرحلة",
      status: 500,
    });
  }
}, true);
