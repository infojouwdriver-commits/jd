
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// PUT - Update driver or vehicle mappings
export const PUT = requestMiddleware(async (request, context) => {
  const { id, type } = parseQueryParams(request);
  const body = await validateRequestBody(request);

  if (!id || !type) {
    return createErrorResponse({
      errorMessage: "معرف الإعدادات ونوع الربط مطلوبان",
      status: 400,
    });
  }

  if (type !== 'driver' && type !== 'vehicle') {
    return createErrorResponse({
      errorMessage: "نوع الربط يجب أن يكون driver أو vehicle",
      status: 400,
    });
  }

  // Check if user is admin
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  const { mappings } = body;

  if (!mappings || typeof mappings !== 'object') {
    return createErrorResponse({
      errorMessage: "بيانات الربط غير صحيحة",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const chironSettingsCrud = new CrudOperations("chiron_settings", adminToken);
    
    const existing = await chironSettingsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "الإعدادات غير موجودة",
        status: 404,
      });
    }

    const fieldName = type === 'driver' ? 'driver_mapping' : 'vehicle_mapping';
    
    const updated = await chironSettingsCrud.update(id, {
      [fieldName]: mappings,
      updated_at: new Date().toISOString(),
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث الربط",
      status: 500,
    });
  }
}, true);
