
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب الردود على رسالة معينة
export const GET = requestMiddleware(async (request, context) => {
  const { message_id } = parseQueryParams(request);
  
  if (!message_id) {
    return createErrorResponse({
      errorMessage: "معرف الرسالة مطلوب",
      status: 400,
    });
  }
  
  const adminToken = await generateAdminUserToken();
  const repliesCrud = new CrudOperations("message_replies", adminToken);
  
  const replies = await repliesCrud.findMany(
    { parent_message_id: parseInt(message_id) },
    { 
      orderBy: { column: 'created_at', direction: 'asc' }
    }
  );
  
  // جلب معلومات المرسلين للردود
  const usersCrud = new CrudOperations("users", adminToken);
  const driversCrud = new CrudOperations("drivers", adminToken);
  
  const allUsers = await usersCrud.findMany({}, { limit: 1000 });
  const allDrivers = await driversCrud.findMany({}, { limit: 1000 });
  
  const repliesWithSenderInfo = replies.map((reply: any) => {
    const user = allUsers.find((u: any) => u.id === reply.sender_user_id);
    const driver = allDrivers.find((d: any) => d.user_id === reply.sender_user_id);
    
    return {
      ...reply,
      sender_name: driver?.full_name || user?.email || 'غير معروف',
      sender_type: driver ? 'driver' : 'admin'
    };
  });
  
  return createSuccessResponse(repliesWithSenderInfo);
}, true);

// POST - إضافة رد على رسالة
export const POST = requestMiddleware(async (request, context) => {
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم غير موجود",
      status: 401,
    });
  }
  
  const body = await validateRequestBody(request);
  
  if (!body.parent_message_id || !body.reply_body) {
    return createErrorResponse({
      errorMessage: "معرف الرسالة الأصلية ونص الرد مطلوبان",
      status: 400,
    });
  }
  
  const adminToken = await generateAdminUserToken();
  
  // التحقق من الرسالة الأصلية
  const messagesCrud = new CrudOperations("internal_messages", adminToken);
  const parentMessage = await messagesCrud.findById(body.parent_message_id);
  
  if (!parentMessage) {
    return createErrorResponse({
      errorMessage: "الرسالة الأصلية غير موجودة",
      status: 404,
    });
  }
  
  // التحقق من أن الرسالة غير مقفلة
  if (parentMessage.is_locked || parentMessage.status === 'resolved') {
    return createErrorResponse({
      errorMessage: "لا يمكن الرد على رسالة تم حلها. يرجى فتح رسالة جديدة.",
      status: 403,
    });
  }
  
  // جلب معلومات المرسل
  const usersCrud = new CrudOperations("users", adminToken);
  const driversCrud = new CrudOperations("drivers", adminToken);
  
  const user = await usersCrud.findById(userId);
  const allDrivers = await driversCrud.findMany({ user_id: parseInt(userId) });
  const driver = allDrivers && allDrivers.length > 0 ? allDrivers[0] : null;
  
  const senderName = driver?.full_name || user?.email || 'غير معروف';
  
  // إنشاء رسالة الرد
  const replyMessage = await messagesCrud.create({
    sender_user_id: parseInt(userId),
    sender_type: body.sender_type || 'driver',
    sender_name: senderName,
    subject: `Re: ${parentMessage.subject}`,
    message_body: body.reply_body,
    message_priority: 'normal',
    recipient_type: 'individual',
    target_company_id: parentMessage.target_company_id,
    is_broadcast: false,
    parent_message_id: body.parent_message_id,
    status: 'open',
    last_activity_at: new Date().toISOString(),
    is_locked: false
  });
  
  // إنشاء سجل في message_replies
  const repliesCrud = new CrudOperations("message_replies", adminToken);
  const replyRecord = await repliesCrud.create({
    parent_message_id: body.parent_message_id,
    reply_message_id: replyMessage.id,
    sender_user_id: parseInt(userId),
    reply_body: body.reply_body
  });
  
  // تحديث آخر نشاط على الرسالة الأصلية
  await messagesCrud.update(body.parent_message_id, {
    last_activity_at: new Date().toISOString()
  });
  
  // إنشاء سجل مستلم للرد (إرسال للمرسل الأصلي)
  const recipientsCrud = new CrudOperations("message_recipients", adminToken);
  await recipientsCrud.create({
    message_id: replyMessage.id,
    recipient_user_id: parentMessage.sender_user_id,
    is_read: false
  });
  
  return createSuccessResponse(replyRecord, 201);
}, true);
