import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { accessibleMessage, messageId, writeMessage } from '@/lib/message-access';

export const GET = requestMiddleware(async (request, context) => {
 const id = messageId(parseQueryParams(request).message_id);
 const token = await generateAdminUserToken();
 const admin = context.payload?.isAdmin === true;
 const userId = context.payload!.sub;
 await accessibleMessage(token, id, userId, admin);
 const replies = await new CrudOperations('message_replies', token).findMany({parent_message_id:id},{limit:500,offset:0,orderBy:{column:'created_at',direction:'asc'}});
 const messages = new CrudOperations('internal_messages', token);
 const visible = [];
 for (const reply of replies) {
  // Broadcast recipients see their own replies and replies explicitly delivered to them.
  // Another driver's private reply must never appear in a shared broadcast thread.
  try {
   const message = admin ? await messages.findById(reply.reply_message_id) : await accessibleMessage(token, messageId(reply.reply_message_id), userId, false);
   if (message) visible.push({...reply,sender_name:message.sender_name,sender_type:message.sender_type});
  } catch (error) {
   if (!(error instanceof Response) || error.status !== 404) throw error;
  }
 }
 return createSuccessResponse(visible);
}, true);

export const POST = requestMiddleware(async (request, context) => {
 const body = await validateRequestBody(request);
 const parentId = messageId(body.parent_message_id);
 const token = await generateAdminUserToken();
 const result = await writeMessage(token, context.payload!.sub, context.payload?.isAdmin === true, {message_body:body.reply_body}, parentId);
 return createSuccessResponse(result, 201);
}, true);
