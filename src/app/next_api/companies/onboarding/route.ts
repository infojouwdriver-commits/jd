import { z } from 'zod';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { prepareCompanyLogin } from '@/lib/company-account';
import { createErrorResponse, createSuccessResponse } from '@/lib/create-response';
import { driverFieldsSchema, parseDriverFields, prepareDriverAccount } from '@/lib/driver-account';
import { createPostgrestClient } from '@/lib/postgrest';

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).transform(value => value || null);
const driverInput = driverFieldsSchema.pick({
  full_name: true, phone: true, password: true, driver_license: true, bestuurderspas_number: true,
}).required({full_name: true, phone: true, password: true});

const registration = z.object({
  request_id: z.uuid(),
  company: z.object({
    name: requiredText(200),
    vat_number: requiredText(50).transform(value => value.replace(/[ .-]/g, '').toUpperCase()).pipe(requiredText(50)),
    kbo_number: requiredText(50).transform(value => value.replace(/[ .-]/g, '')).pipe(requiredText(50)),
    address: optionalText(400),
    email: z.string().trim().pipe(z.union([z.literal(''), z.string().email().max(255)])).transform(value => value.toLowerCase() || null),
    phone: optionalText(50),
    password: z.string().max(72).optional(),
  }).strict(),
  fleet: z.object({
    driver: driverInput,
    vehicle: z.object({
      brand: requiredText(100),
      model: requiredText(100),
      plate_number: requiredText(50).transform(value => value.replace(/[\s-]/g, '').toUpperCase())
        .pipe(z.string().regex(/^[A-Z0-9]+$/)),
      vin: optionalText(100).transform(value => value?.toUpperCase() ?? null),
      chiron_vehicle_id: optionalText(100),
    }).strict(),
  }).strict().optional(),
}).strict();

export const POST = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin || !context.token) return createErrorResponse({status: 403, errorMessage: 'صلاحية الإدارة مطلوبة'});
  const parsed = registration.safeParse(await validateRequestBody(request));
  if (!parsed.success) {
    const section = parsed.error.issues[0]?.path;
    const label = section?.[0] === 'company' ? 'الشركة' : section?.[1] === 'driver' ? 'السائق' : 'المركبة';
    return createErrorResponse({status: 400, errorMessage: `راجع الحقول المطلوبة في قسم ${label}.`});
  }

  const { request_id, company: {password, ...company}, fleet } = parsed.data;
  const driverFields = fleet ? parseDriverFields(fleet.driver, true) : undefined;
  if (driverFields && !/^\+?\d{3,}$/.test(driverFields.phone ?? '')) {
    return createErrorResponse({status: 400, errorMessage: 'أدخل رقم هاتف صالحًا للسائق.'});
  }
  const [companyLogin, driverLogin] = await Promise.all([
    prepareCompanyLogin(company.email, password),
    prepareDriverAccount(driverFields, true),
  ]);

  const { data, error } = await createPostgrestClient(context.token).rpc('security_onboard_admin_company', {
    p_actor: Number(context.payload.sub),
    p_request: request_id,
    p_company: company,
    p_company_account: companyLogin,
    p_driver: driverFields ? driverLogin.driver : null,
    p_driver_account: driverFields ? driverLogin.account : null,
    p_vehicle: fleet?.vehicle ?? null,
  });
  if (!error && data) return createSuccessResponse(data, 201);
  if (error?.code === '23505') {
    return createErrorResponse({status: 409, errorMessage: 'رقم VAT أو KBO، البريد، هاتف السائق أو لوحة المركبة مسجّل مسبقًا. راجع البيانات وحاول مجددًا.'});
  }
  if (['22023', '23503', '23514'].includes(error?.code ?? '')) {
    return createErrorResponse({status: 400, errorMessage: 'راجع بيانات الشركة والسائق والمركبة.'});
  }
  if (error?.code === '42501') return createErrorResponse({status: 403, errorMessage: 'صلاحية الإدارة مطلوبة'});
  return createErrorResponse({status: 503, errorMessage: 'تعذر حفظ التسجيل'});
}, true);
