import { z } from 'zod';
import { hashString } from './server-utils';
import { createPostgrestClient } from './postgrest';
import { getAuthRoles } from './auth';

const optionalText = z.string().trim().max(200).nullable().optional();
export const driverFieldsSchema = z.object({
  full_name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().min(3).max(32).regex(/^\+?[\d ()-]+$/).optional(),
  national_id: optionalText, driver_license: optionalText,
  capacity_certificate_number: optionalText, bestuurderspas_number: optionalText,
  preferred_language: z.enum(['ar', 'fr', 'nl', 'en']).optional(),
  current_vehicle_id: z.number().int().positive().nullable().optional(),
  assigned_vehicle_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  password: z.string().min(12, 'كلمة المرور يجب أن تكون 12 حرفاً على الأقل').refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'كلمة المرور طويلة جداً').optional(),
}).strict();

export function parseDriverFields(body: unknown, create = false) {
  const result = driverFieldsSchema.parse(body);
  if (create && (!result.full_name || !result.phone || !result.password)) throw new z.ZodError([{code: 'custom',path: [],message:'الاسم ورقم الهاتف وكلمة المرور مطلوبة'}]);
  // Store one canonical format; login retains candidates for legacy numbers.
  if (result.phone) result.phone = result.phone.replace(/[ ()-]/g, '').replace(/^00/, '+');
  return result;
}

export async function mutateDriverAccount(token: string, action: 'create' | 'update' | 'deactivate', input: {id?: string; companyId?: number; fields?: ReturnType<typeof parseDriverFields>; distributorId?: number | null}) {
  const { password, ...driver } = input.fields || {};
  const account: Record<string, unknown> = {};
  if (driver.phone) account.email = `${driver.phone}@driver.local`;
  if (password) account.password = await hashString(password);
  if (action === 'create') account.role = getAuthRoles().userRole;
  const args = action === 'create' ? {
    p_company_id: input.companyId, p_account: account,
    p_driver: {...driver, status: 'active', created_by_distributor_id: input.distributorId || null},
  } : action === 'update' ? {p_driver_id: Number(input.id), p_account: account, p_driver: driver} : {p_driver_id: Number(input.id)};
  const result = await createPostgrestClient(token).rpc(`security_${action}_driver_account`, args);
  if (result.error) {
    const status = result.error.code === '23505' ? 409 : result.error.code === 'P0002' ? 404 : ['23514','23503','22023'].includes(result.error.code) ? 400 : 503;
    throw new Response(JSON.stringify({success:false,errorMessage:status === 409 ? 'رقم الهاتف مستخدم بالفعل' : status === 400 ? 'بيانات السائق أو المركبة غير صالحة' : status === 404 ? 'السائق غير موجود' : 'Driver account operation unavailable'}),{status,headers:{'Content-Type':'application/json'}});
  }
  if (!result.data) throw new Response(null, {status:503});
  return result.data;
}

export function driverValidationError(error: unknown): Response | null {
  if (error instanceof Response) return error;
  if (error instanceof z.ZodError) return new Response(JSON.stringify({success:false,errorMessage:error.issues[0]?.message || 'Invalid driver fields'}), {status:400,headers:{'Content-Type':'application/json'}});
  return null;
}
