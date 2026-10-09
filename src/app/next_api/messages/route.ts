
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب الرسائل
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, target_company_id, status } = parseQueryParams(request);
  const userId = context.payload?.sub;
  
  const adminToken = await generateAdminUserToken();
  const messagesCrud = new CrudOperations("internal_messages", adminToken);
  
  const filters: Record<string, any> = {};
  
  // إذا كان هناك شركة محددة
  if (target_company_id) {
    filters.target_company_id = parseInt(target_company_id);
  }
  
  // تصفية حسب الحالة
  if (status) {
    filters.status = status;
  }
  
  const messages = await messagesCrud.findMany(filters, { 
    limit: limit || 50, 
    offset: offset || 0,
    orderBy: { column: 'last_activity_at', direction: 'desc' }
  });
  
  // جلب معلومات المرسلين
  const usersCrud = new CrudOperations("users", adminToken);
  const driversCrud = new CrudOperations("drivers", adminToken);
  
  const allUsers = await usersCrud.findMany({}, { limit: 1000 });
  const allDrivers = await driversCrud.findMany({}, { limit: 1000 });
  
  // دمج معلومات المرسل مع الرسائل
  const messagesWithSenderInfo = messages.map((msg: any) => {
    const user = allUsers.find((u: any) => u.id === msg.sender_user_id);
    const driver = allDrivers.find((d: any) => d.user_id === msg.sender_user_id);
    
    return {
      ...msg,
      sender_name: driver?.full_name || user?.email || 'غير معروف',
      sender_email: user?.email || null
    };
  });
  
  return createSuccessResponse(messagesWithSenderInfo);
}, true);

// POST - إنشاء رسالة جديدة
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 401,
    });
  }
  
  if (!body.subject || !body.message_body) {
    return createErrorResponse({
      errorMessage: "الموضوع والرسالة مطلوبان",
      status: 400,
    });
  }
  
  const adminToken = await generateAdminUserToken();
  
  // جلب معلومات المرسل
  const usersCrud = new CrudOperations("users", adminToken);
  const driversCrud = new CrudOperations("drivers", adminToken);
  
  const user = await usersCrud.findById(userId);
  const allDrivers = await driversCrud.findMany({ user_id: parseInt(userId) });
  const driver = allDrivers && allDrivers.length > 0 ? allDrivers[0] : null;
  
  const senderName = driver?.full_name || user?.email || 'غير معروف';
  
  const messagesCrud = new CrudOperations("internal_messages", adminToken);
  
  const messageData = {
    sender_user_id: parseInt(userId),
    sender_type: body.sender_type || 'admin',
    sender_name: senderName,
    subject: body.subject,
    message_body: body.message_body,
    message_priority: body.message_priority || 'normal',
    recipient_type: body.recipient_type || 'all_drivers',
    target_company_id: body.target_company_id || null,
    is_broadcast: body.is_broadcast || false,
    parent_message_id: body.parent_message_id || null,
    status: 'open',
    last_activity_at: new Date().toISOString(),
    is_locked: false
  };
  
  const data = await messagesCrud.create(messageData);
  
  // إنشاء سجلات المستلمين
  if (data && data.id) {
    const recipientsCrud = new CrudOperations("message_recipients", adminToken);
    
    // جلب قائمة المستلمين بناءً على نوع المستلم
    let recipientUserIds: number[] = [];
    
    if (body.recipient_type === 'all_drivers' || body.recipient_type === 'all_active_drivers') {
      const filters: Record<string, any> = {};
      
      if (body.recipient_type === 'all_active_drivers') {
        filters.status = 'active';
      }
      
      if (body.target_company_id) {
        filters.company_id = parseInt(body.target_company_id);
      }
      
      const drivers = await driversCrud.findMany(filters);
      recipientUserIds = drivers.map((d: any) => d.user_id);
    } else if (body.recipient_type === 'individual' && body.recipient_user_id) {
      recipientUserIds = [parseInt(body.recipient_user_id)];
    }
    
    // إنشاء سجل لكل مستلم
    for (const recipientUserId of recipientUserIds) {
      await recipientsCrud.create({
        message_id: data.id,
        recipient_user_id: recipientUserId,
        is_read: false
      });
    }
  }
  
  return createSuccessResponse(data, 201);
}, true);

// PUT - تحديث رسالة
export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 401,
    });
  }
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الرسالة مطلوب",
      status: 400,
    });
  }
  
  const body = await validateRequestBody(request);
  const adminToken = await generateAdminUserToken();
  const messagesCrud = new CrudOperations("internal_messages", adminToken);
  
  const existing = await messagesCrud.findById(id);
  if (!existing) {
    return createErrorResponse({
      errorMessage: "الرسالة غير موجودة",
      status: 404,
    });
  }
  
  // إذا تم تغيير الحالة إلى "resolved"، قفل الرسالة
  const updateData: any = { ...body };
  
  if (body.status === 'resolved' && existing.status !== 'resolved') {
    updateData.is_locked = true;
    updateData.resolved_at = new Date().toISOString();
    updateData.resolved_by_user_id = parseInt(userId);
  }
  
  const data = await messagesCrud.update(id, updateData);
  return createSuccessResponse(data);
}, true);

// DELETE - حذف رسالة
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الرسالة مطلوب",
      status: 400,
    });
  }
  
  const adminToken = await generateAdminUserToken();
  const messagesCrud = new CrudOperations("internal_messages", adminToken);
  
  const existing = await messagesCrud.findById(id);
  if (!existing) {
    return createErrorResponse({
      errorMessage: "الرسالة غير موجودة",
      status: 404,
    });
  }
  
  // حذف سجلات المستلمين المرتبطة
  const recipientsCrud = new CrudOperations("message_recipients", adminToken);
  const recipients = await recipientsCrud.findMany({ message_id: parseInt(id) });
  
  for (const recipient of recipients) {
    await recipientsCrud.delete(recipient.id);
  }
  
  // حذف الردود المرتبطة
  const repliesCrud = new CrudOperations("message_replies", adminToken);
  const replies = await repliesCrud.findMany({ parent_message_id: parseInt(id) });
  
  for (const reply of replies) {
    await repliesCrud.delete(reply.id);
  }
  
  // حذف الرسالة
  const data = await messagesCrud.delete(id);
  return createSuccessResponse(data);
}, true);
