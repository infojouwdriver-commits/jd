
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب الإشعارات للسائق الحالي
export const GET = requestMiddleware(async (request, context) => {
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم غير موجود",
      status: 401,
    });
  }
  
  // جلب معلومات السائق
  const adminToken = await generateAdminUserToken();
  const driversCrud = new CrudOperations("drivers", adminToken);
  const drivers = await driversCrud.findMany({ user_id: userId });
  
  if (!drivers || drivers.length === 0) {
    return createErrorResponse({
      errorMessage: "السائق غير موجود",
      status: 404,
    });
  }
  
  const driver = drivers[0];
  
  // جلب جميع الإشعارات النشطة
  const notificationsCrud = new CrudOperations("notifications", adminToken);
  const now = new Date().toISOString();
  
  // جلب الإشعارات المناسبة للسائق
  const allNotifications = await notificationsCrud.findMany(
    { is_active: true },
    { 
      limit: 100,
      orderBy: { column: 'created_at', direction: 'desc' }
    }
  );
  
  // تصفية الإشعارات حسب الجمهور المستهدف
  const relevantNotifications = allNotifications.filter((notif: any) => {
    // تحقق من انتهاء الصلاحية
    if (notif.expires_at && new Date(notif.expires_at) < new Date()) {
      return false;
    }
    
    // تحقق من الجدولة
    if (notif.scheduled_at && new Date(notif.scheduled_at) > new Date()) {
      return false;
    }
    
    // تحقق من الجمهور المستهدف
    if (notif.target_audience === 'all_drivers') {
      return true;
    }
    
    if (notif.target_audience === 'specific_company' && notif.target_company_id === driver.company_id) {
      return true;
    }
    
    if (notif.target_audience === 'active_drivers' && driver.status === 'active') {
      return true;
    }
    
    return false;
  });
  
  // جلب حالة القراءة لكل إشعار
  const userNotificationsCrud = new CrudOperations("user_notifications", context.token);
  const userNotifications = await userNotificationsCrud.findMany({ user_id: userId });
  
  // دمج البيانات
  const notificationsWithReadStatus = relevantNotifications.map((notif: any) => {
    const userNotif = userNotifications.find((un: any) => un.notification_id === notif.id);
    return {
      ...notif,
      is_read: userNotif?.is_read || false,
      read_at: userNotif?.read_at || null
    };
  });
  
  return createSuccessResponse(notificationsWithReadStatus);
}, true);
