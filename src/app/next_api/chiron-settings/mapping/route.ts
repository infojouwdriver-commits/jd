
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";

// POST - تحديث driver_mapping أو vehicle_mapping
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { 
    company_id, 
    mapping_type, // 'driver' or 'vehicle'
    internal_id,
    chiron_id
  } = body;
  
  if (!company_id || !mapping_type || !internal_id || !chiron_id) {
    return createErrorResponse({
      errorMessage: "جميع الحقول مطلوبة",
      status: 400,
    });
  }
  
  if (mapping_type !== 'driver' && mapping_type !== 'vehicle') {
    return createErrorResponse({
      errorMessage: "نوع الربط يجب أن يكون 'driver' أو 'vehicle'",
      status: 400,
    });
  }
  
  const chironSettingsCrud = new CrudOperations("chiron_settings", context.token);
  
  // جلب الإعدادات الحالية
  const settings = await chironSettingsCrud.findMany({ company_id });
  if (!settings || settings.length === 0) {
    return createErrorResponse({
      errorMessage: "إعدادات Chiron غير موجودة لهذه الشركة",
      status: 404,
    });
  }
  
  const currentSettings = settings[0];
  const mappingField = mapping_type === 'driver' ? 'driver_mapping' : 'vehicle_mapping';
  const currentMapping = currentSettings[mappingField] || {};
  
  // تحديث الربط
  const updatedMapping = {
    ...currentMapping,
    [internal_id]: chiron_id
  };
  
  const data = await chironSettingsCrud.update(currentSettings.id, {
    [mappingField]: updatedMapping
  });
  
  return createSuccessResponse(data);
}, true);

// DELETE - حذف ربط معين
export const DELETE = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { 
    company_id, 
    mapping_type,
    internal_id
  } = body;
  
  if (!company_id || !mapping_type || !internal_id) {
    return createErrorResponse({
      errorMessage: "جميع الحقول مطلوبة",
      status: 400,
    });
  }
  
  const chironSettingsCrud = new CrudOperations("chiron_settings", context.token);
  
  const settings = await chironSettingsCrud.findMany({ company_id });
  if (!settings || settings.length === 0) {
    return createErrorResponse({
      errorMessage: "إعدادات Chiron غير موجودة",
      status: 404,
    });
  }
  
  const currentSettings = settings[0];
  const mappingField = mapping_type === 'driver' ? 'driver_mapping' : 'vehicle_mapping';
  const currentMapping = currentSettings[mappingField] || {};
  
  // حذف الربط
  const { [internal_id]: removed, ...updatedMapping } = currentMapping;
  
  const data = await chironSettingsCrud.update(currentSettings.id, {
    [mappingField]: updatedMapping
  });
  
  return createSuccessResponse(data);
}, true);
