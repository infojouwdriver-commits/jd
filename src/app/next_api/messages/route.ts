
import { createPostgrestClient } from '@/lib/postgrest';
import { writeMessage } from '@/lib/message-access';
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
  
  let query = createPostgrestClient(adminToken).from('internal_messages').select('*').is('parent_message_id', null).order('last_activity_at', {ascending:false}).range(offset, offset + limit - 1);
  for (const [key,value] of Object.entries(filters)) query = query.eq(key, value);
  const {data:messages,error} = await query;
  if (error || !messages) throw new Error('Messages unavailable');

  // جلب معلومات المرسلين
  const usersCrud = new CrudOperations("users", adminToken);
  const driversCrud = new CrudOperations("drivers", adminToken);
  
  const senderIds = [...new Set(messages.map(message => String(message.sender_user_id)))];
  const [senderUsers,senderDrivers] = await Promise.all([
    Promise.all(senderIds.map(id => usersCrud.findById(id))),
    Promise.all(senderIds.map(id => driversCrud.findMany({user_id:Number(id)}))),
  ]);
  const allUsers = senderUsers.filter(Boolean);
  const allDrivers = senderDrivers.flat();
  
  // دمج معلومات المرسل مع الرسائل
  const messagesWithSenderInfo = messages.filter((message: any) => !message.parent_message_id).map((msg: any) => {
    const user = allUsers.find((u: any) => u.id === msg.sender_user_id);
    const driver = allDrivers.find((d: any) => d.user_id === msg.sender_user_id);
    
    return {
      ...msg,
      sender_name: driver?.full_name || msg.sender_name || user?.email || 'غير معروف',
      sender_email: user?.email || null
    };
  });
  
  return createSuccessResponse(messagesWithSenderInfo);
}, true);

// The server derives the sender and creates message/recipients in one transaction.
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const token = await generateAdminUserToken();
  const result = await writeMessage(token, context.payload!.sub, context.payload?.isAdmin === true, body);
  return createSuccessResponse(result, 201);
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
