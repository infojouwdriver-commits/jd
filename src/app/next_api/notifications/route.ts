
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";

// GET - جلب الإشعارات
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, target_company_id } = parseQueryParams(request);
  
  const notificationsCrud = new CrudOperations("notifications", context.token);
  
  const filters: Record<string, any> = {
    is_active: true
  };
  
  // إذا كان هناك شركة محددة
  if (target_company_id) {
    filters.target_company_id = parseInt(target_company_id);
  }
  
  const data = await notificationsCrud.findMany(filters, { 
    limit: limit || 50, 
    offset: offset || 0,
    orderBy: { column: 'created_at', direction: 'desc' }
  });
  
  return createSuccessResponse(data);
}, true);

// POST - إنشاء إشعار جديد
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  if (!body.title || !body.message) {
    return createErrorResponse({
      errorMessage: "العنوان والرسالة مطلوبان",
      status: 400,
    });
  }
  
  const notificationsCrud = new CrudOperations("notifications", context.token);
  
  const notificationData = {
    title: body.title,
    message: body.message,
    notification_type: body.notification_type || 'announcement',
    priority: body.priority || 'normal',
    target_audience: body.target_audience || 'all_drivers',
    target_company_id: body.target_company_id || null,
    icon_url: body.icon_url || null,
    action_url: body.action_url || null,
    is_active: true,
    scheduled_at: body.scheduled_at || null,
    expires_at: body.expires_at || null,
    created_by_user_id: context.payload?.sub
  };
  
  const data = await notificationsCrud.create(notificationData);
  
  return createSuccessResponse(data, 201);
}, true);

// PUT - تحديث إشعار
export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الإشعار مطلوب",
      status: 400,
    });
  }
  
  const body = await validateRequestBody(request);
  const notificationsCrud = new CrudOperations("notifications", context.token);
  
  const existing = await notificationsCrud.findById(id);
  if (!existing) {
    return createErrorResponse({
      errorMessage: "الإشعار غير موجود",
      status: 404,
    });
  }
  
  const data = await notificationsCrud.update(id, body);
  return createSuccessResponse(data);
}, true);

// DELETE - حذف إشعار
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الإشعار مطلوب",
      status: 400,
    });
  }
  
  const notificationsCrud = new CrudOperations("notifications", context.token);
  
  const existing = await notificationsCrud.findById(id);
  if (!existing) {
    return createErrorResponse({
      errorMessage: "الإشعار غير موجود",
      status: 404,
    });
  }
  
  const data = await notificationsCrud.delete(id);
  return createSuccessResponse(data);
}, true);
