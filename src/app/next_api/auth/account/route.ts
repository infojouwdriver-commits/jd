import { requestMiddleware, validateRequestBody, sendVerificationEmail } from '@/lib/api-utils';
import { authCrudOperations, generateAdminUserToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { hashString, verifyHashString, generateVerificationCode, hashVerificationCode } from '@/lib/server-utils';
import { createPostgrestClient } from '@/lib/postgrest';
import { consumeRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
const available = () => Boolean(process.env.RESEND_KEY && process.env.RESEND_FROM_EMAIL);
const schema = z.object({
 action:z.enum(['request_email_code','update_email','update_password']),
 current_password:z.string().min(1).refine(value => Buffer.byteLength(value,'utf8') <= 72),
 email:z.string().trim().toLowerCase().email().optional(), passcode:z.string().regex(/^\d{6}$/).optional(),
 password:z.string().min(12).refine(value => Buffer.byteLength(value,'utf8') <= 72).optional(),
}).strict();
export const GET = requestMiddleware(async (_request, context) => {
 const {usersCrud} = await authCrudOperations();
 const user = await usersCrud.findById(context.payload!.sub);
 return createSuccessResponse({id:user.id,email:user.email,display_name:user.display_name,user_type:user.user_type,email_verification_available:available()});
}, true);
export const POST = requestMiddleware(async (request, context) => {
 const parsed = schema.safeParse(await validateRequestBody(request));
 if (!parsed.success) return createErrorResponse({errorMessage:'راجع البريد وكلمة المرور؛ كلمة المرور الجديدة 12 حرفاً على الأقل ولا تتجاوز 72 بايت',status:400});
 const body = parsed.data;
 const {usersCrud,userPasscodeCrud} = await authCrudOperations();
 const userId = context.payload!.sub;
 const {action} = body;
 const limited = await consumeRateLimit('account-change:' + userId, 5);
 if (limited) return limited;
 const user = await usersCrud.findById(userId);
 if (!user?.password || !await verifyHashString(body.current_password, user.password)) return createErrorResponse({errorMessage:'كلمة المرور الحالية غير صحيحة',status:403});
 let codeId: number | null = null;
 if (action !== 'update_password') {
  if (!body.email) return createErrorResponse({errorMessage:'البريد الجديد مطلوب',status:400});
  if (!available()) return createErrorResponse({errorMessage:'خدمة تأكيد البريد غير مجهزة',status:409});
  if (action === 'request_email_code') {
   const code = generateVerificationCode();
   const row = await userPasscodeCrud.create({pass_object:body.email,security_purpose:'account-email:'+userId,passcode:await hashVerificationCode(code),valid_until:new Date(Date.now()+3*60000).toISOString(),revoked:false});
   let sent = false;
   try { sent = await sendVerificationEmail(body.email, code); } catch { /* Do not expose provider diagnostics or codes. */ }
   if (!sent) { await userPasscodeCrud.update(row.id,{revoked:true}); return createErrorResponse({errorMessage:'تعذر إرسال رمز التحقق',status:503}); }
   return createSuccessResponse({sent:true});
  }
  if (!body.passcode) return createErrorResponse({errorMessage:'رمز التحقق مطلوب',status:400});
  const codes = await userPasscodeCrud.findMany({pass_object:body.email,security_purpose:'account-email:'+userId},{limit:1,offset:0,orderBy:{column:'id',direction:'desc'}});
  const code = codes[0];
  if (!code || code.revoked || !(Date.parse(code.valid_until)>Date.now()) || !await verifyHashString(body.passcode, code.passcode)) return createErrorResponse({errorMessage:'رمز التحقق غير صحيح أو منتهي',status:403});
  codeId = code.id;
 } else if (!body.password) return createErrorResponse({errorMessage:'كلمة المرور الجديدة مطلوبة',status:400});
 const token = await generateAdminUserToken();
 const result = await createPostgrestClient(token).rpc('security_change_account', {p_user_id:Number(userId),p_expected_hash:user.password,p_email:action==='update_email'?body.email:null,p_password:action==='update_password'?await hashString(body.password!):null,p_code_id:codeId});
 if (result.error) return createErrorResponse({errorMessage:result.error.code==='23505'?'البريد مستخدم بحساب آخر':'تعذر تعديل الحساب؛ أعد تسجيل الدخول والمحاولة',status:result.error.code==='23505'?409:result.error.code==='42501'?403:503});
 return createSuccessResponse({updated:true,sign_in_required:true});
}, true);
