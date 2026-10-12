import CrudOperations from './crud-operations';
import { createPostgrestClient } from './postgrest';
import { z } from 'zod';
export function messageId(value: unknown): number {
 const id = Number(value);
 if (!Number.isSafeInteger(id) || id < 1) throw new Response(null, {status:400});
 return id;
}
export async function accessibleMessage(token: string, id: number, userId: string, admin: boolean) {
 const message = await new CrudOperations('internal_messages', token).findById(id);
 if (!message) throw new Response(null, {status:404});
 if (!admin && String(message.sender_user_id) !== userId) {
  const recipients = await new CrudOperations('message_recipients', token).findMany({message_id:id,recipient_user_id:Number(userId)});
  if (!recipients.some(row => row.is_deleted !== true)) throw new Response(null, {status:404});
 }
 return message;
}
const fields = z.object({
 subject: z.string().trim().min(1).max(200), message_body: z.string().trim().min(1).max(10000),
 message_priority: z.enum(['low','normal','high','urgent']).optional(),
 recipient_type: z.enum(['all_drivers','all_active_drivers','individual']).optional(),
 target_company_id: z.coerce.number().int().positive().nullable().optional(),
 recipient_user_id: z.coerce.number().int().positive().optional(),
});
export async function writeMessage(token: string, actorId: string, admin: boolean, body: unknown, parentId: number | null = null) {
 const parsed = (parentId ? fields.pick({message_body:true}) : fields).safeParse(body);
 if (!parsed.success) throw new Response(JSON.stringify({success:false,errorMessage:'راجع عنوان الرسالة ونصها والمستلمين'}),{status:400,headers:{'Content-Type':'application/json'}});
 const result = await createPostgrestClient(token).rpc('security_write_message', {p_actor_id:messageId(actorId),p_is_admin:admin,p_message:parsed.data,p_parent_id:parentId});
 if (result.error || !result.data) {
  const code = result.error?.code;
  const status = code === 'P0002' ? 404 : code === '42501' ? 403 : code === '23514' ? 409 : ['22023','23503'].includes(code || '') ? 400 : 503;
  throw new Response(JSON.stringify({success:false,errorMessage:status===409?'المحادثة مغلقة؛ افتح رسالة جديدة':status===400?'نص الرسالة أو المستلم غير صالح':status===404?'الرسالة غير موجودة':'تعذر إرسال الرسالة'}),{status,headers:{'Content-Type':'application/json'}});
 }
 return result.data;
}
