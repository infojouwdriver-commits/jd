
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";

// POST - تحديد إشعار كمقروء
export const POST = requestMiddleware(async (request, context) => {
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم غير موجود",
      status: 401,
    });
  }
  
  const body = await validateRequestBody(request);
  
  if (!body.notification_id) {
    return createErrorResponse({
      errorMessage: "معرف الإشعار مطلوب",
      status: 400,
    });
  }
  
  const userNotificationsCrud = new CrudOperations("user_notifications", context.token);
  
  // التحقق من وجود السجل
  const existing = await userNotificationsCrud.findMany({
    user_id: userId,
    notification_id: body.notification_id
  });
  
  if (existing && existing.length > 0) {
    // تحديث السجل الموجود
    const data = await userNotificationsCrud.update(existing[0].id, {
      is_read: true,
      read_at: new Date().toISOString()
    });
    return createSuccessResponse(data);
  } else {
    // إنشاء سجل جديد
    const data = await userNotificationsCrud.create({
      user_id: userId,
      notification_id: body.notification_id,
      is_read: true,
      read_at: new Date().toISOString()
    });
    return createSuccessResponse(data, 201);
  }
}, true);
