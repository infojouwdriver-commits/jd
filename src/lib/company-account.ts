import CrudOperations from './crud-operations';
import { z } from 'zod';
import { hashString } from './server-utils';
import { createPostgrestClient } from './postgrest';
import { getAuthRoles } from './auth';
const credentials = z.object({
 email: z.string().trim().toLowerCase().email(),
 password: z.string().min(12).refine(value => Buffer.byteLength(value, 'utf8') <= 72),
});
export async function saveCompanyAccount(token: string, id: number | null, company: Record<string, unknown>, password?: unknown) {
 const account: Record<string, unknown> = {};
 if (password !== undefined && password !== '') {
  let loginEmail = company.email;
  if (id !== null) {
   const links = await new CrudOperations('company_users',token).findMany({company_id:id,role:'portal_owner'});
   if (links.length === 1) {
    const owner = await new CrudOperations('users',token).findById(links[0].user_id);
    if (!owner) throw new Response(null,{status:409});
    loginEmail = owner.email;
   }
  }
  const parsed = credentials.safeParse({email: loginEmail, password});
  if (!parsed.success) throw new Response(JSON.stringify({success:false,errorMessage:'حساب الشركة يحتاج بريداً صالحاً وكلمة مرور من 12 حرفاً على الأقل ولا تتجاوز 72 بايت'}),{status:400,headers:{'Content-Type':'application/json'}});
  account.email = parsed.data.email;
  account.password = await hashString(parsed.data.password);
  account.role = getAuthRoles().userRole;
 }
 const result = await createPostgrestClient(token).rpc('security_save_company_account', {p_company_id:id,p_company:company,p_account:account});
 if (result.error || !result.data) {
  const status = result.error?.code === '23505' ? 409 : result.error?.code === 'P0002' ? 404 : ['22023','23503','23514'].includes(result.error?.code || '') ? 400 : 503;
  throw new Response(JSON.stringify({success:false,errorMessage:status === 409 ? 'البريد مستخدم بحساب آخر؛ لم تُحفظ أي تغييرات' : status === 400 ? 'راجع بيانات الشركة وحساب الدخول' : status === 404 ? 'الشركة أو حسابها غير موجود' : 'تعذر حفظ حساب الشركة'}),{status,headers:{'Content-Type':'application/json'}});
 }
 return result.data;
}
