
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب الرسائل للسائق الحالي
export const GET = requestMiddleware(async (request, context) => {
  const userId = context.payload?.sub;
  
  if (!userId) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم غير موجود",
      status: 401,
    });
  }
  
  const adminToken = await generateAdminUserToken();
  
  // جلب سجلات المستلمين للمستخدم الحالي (غير المحذوفة)
  const recipientsCrud = new CrudOperations("message_recipients", adminToken);
  const recipients = await recipientsCrud.findMany(
    { recipient_user_id: userId, is_deleted: false },
    { 
      limit: 100,
      orderBy: { column: 'created_at', direction: 'desc' }
    }
  );
  
  if (!recipients || recipients.length === 0) {
    return createSuccessResponse([]);
  }
  
  // جلب الرسائل المرتبطة
  const messagesCrud = new CrudOperations("internal_messages", adminToken);
  const messageIds = recipients.map((r: any) => r.message_id);
  
  const allMessages = await messagesCrud.findMany({}, { limit: 1000 });
  const messages = allMessages.filter((m: any) => messageIds.includes(m.id));
  
  // التحقق من الرسائل القديمة (أكثر من 30 يوم من آخر نشاط) وحذفها
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  for (const message of messages) {
    const lastActivity = new Date(message.last_activity_at || message.created_at);
    
    if (lastActivity < thirtyDaysAgo) {
      // حذف ناعم للرسالة من سجلات المستلم
      const recipient = recipients.find((r: any) => r.message_id === message.id);
      if (recipient) {
        await recipientsCrud.update(recipient.id, {
          is_deleted: true,
          deleted_at: new Date().toISOString()
        });
      }
    }
  }
  
  // تصفية الرسائل القديمة من النتائج
  const validMessages = messages.filter((m: any) => {
    const lastActivity = new Date(m.last_activity_at || m.created_at);
    return lastActivity >= thirtyDaysAgo;
  });
  
  // دمج البيانات مع حالة القراءة
  const messagesWithReadStatus = validMessages.map((msg: any) => {
    const recipient = recipients.find((r: any) => r.message_id === msg.id);
    return {
      ...msg,
      is_read: recipient?.is_read || false,
      read_at: recipient?.read_at || null,
      recipient_id: recipient?.id
    };
  });
  
  return createSuccessResponse(messagesWithReadStatus);
}, true);
