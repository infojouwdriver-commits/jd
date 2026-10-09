
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  
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
    
    const trips = await tripsCrud.findMany(
      { user_id },
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
      const allInvoices = await invoicesCrud.findMany(
        { invoice_category: 'trip' },
        { limit: 1000, offset: 0 }
      );
      
      tripInvoices = allInvoices.filter((invoice: any) => 
        invoice.trip_id && tripIds.includes(invoice.trip_id)
      );
    }

    const tripsWithInvoices = trips.map((trip: any) => {
      const invoice = tripInvoices.find((inv: any) => inv.trip_id === trip.id);
      return {
        ...trip,
        invoice: invoice || null
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
