
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب إحصائيات الرسائل للمستخدم الحالي
export const GET = requestMiddleware(async (request, context) => {
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم غير موجود",
      status: 401,
    });
  }
  
  const adminToken = await generateAdminUserToken();
  const statsCrud = new CrudOperations("message_statistics", adminToken);
  
  // البحث عن إحصائيات المستخدم
  const existing = await statsCrud.findMany({ user_id: userId });
  
  if (existing && existing.length > 0) {
    return createSuccessResponse(existing[0]);
  }
  
  // إنشاء سجل جديد إذا لم يكن موجوداً
  const newStats = await statsCrud.create({
    user_id: userId,
    total_sent: 0,
    total_received: 0,
    total_read: 0,
    total_unread: 0,
    total_archived: 0
  });
  
  return createSuccessResponse(newStats);
}, true);
