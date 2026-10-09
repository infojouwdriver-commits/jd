
import { NextRequest } from 'next/server';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateAdminUserToken } from '@/lib/auth';
import CrudOperations from '@/lib/crud-operations';

// GET - جلب قائمة طلبات تسجيل السائقين (للمسؤول فقط)
export const GET = requestMiddleware(async (request: NextRequest, context) => {
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: 'Unauthorized',
      status: 403,
    });
  }

  try {
    const { status, limit, offset } = parseQueryParams(request);
    const adminToken = await generateAdminUserToken();

    const regRequestsCrud = new CrudOperations('driver_registration_requests', adminToken);

    const filters: Record<string, any> = {};
    if (status) {
      filters.status = status;
    }

    const requests = await regRequestsCrud.findMany(filters, {
      limit: limit || 50,
      offset: offset || 0,
      orderBy: { column: 'submitted_at', direction: 'desc' },
    });

    // جلب بيانات الشركة لكل طلب
    const companiesCrud = new CrudOperations('companies', adminToken);
    const vehiclesCrud = new CrudOperations('vehicles', adminToken);

    const enrichedRequests = await Promise.all(
      (requests || []).map(async (req: any) => {
        let company = null;
        let vehicle = null;

        try {
          company = await companiesCrud.findById(req.company_id);
        } catch {}

        try {
          if (req.vehicle_id) {
            vehicle = await vehiclesCrud.findById(req.vehicle_id);
          }
        } catch {}

        return {
          ...req,
          company,
          vehicle,
        };
      })
    );

    return createSuccessResponse(enrichedRequests);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || 'Failed to fetch registration requests',
      status: 500,
    });
  }
}, true);
