
import { accessibleMessage, messageId } from '@/lib/message-access';
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// POST - تحديد رسالة كمقروءة
export const POST = requestMiddleware(async (request, context) => {
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم غير موجود",
      status: 401,
    });
  }
  
  const body = await validateRequestBody(request);
  
  if (!body.message_id) {
    return createErrorResponse({
      errorMessage: "معرف الرسالة مطلوب",
      status: 400,
    });
  }
  
  const adminToken = await generateAdminUserToken();
  const id = messageId(body.message_id);
  const message = await accessibleMessage(adminToken, id, userId, context.payload?.isAdmin === true);
  if (String(message.sender_user_id) === String(userId)) return createSuccessResponse({is_read:true});
  const recipientsCrud = new CrudOperations("message_recipients", adminToken);
  
  // البحث عن السجل
  const existing = await recipientsCrud.findMany({
    recipient_user_id: userId,
    message_id: body.message_id
  });
  
  if (existing && existing.length > 0) {
    // تحديث السجل الموجود
    const data = await recipientsCrud.update(existing[0].id, {
      is_read: true,
      read_at: new Date().toISOString()
    });
    return createSuccessResponse(data);
  } else {
    return createErrorResponse({
      errorMessage: "سجل المستلم غير موجود",
      status: 404,
    });
  }
}, true);
