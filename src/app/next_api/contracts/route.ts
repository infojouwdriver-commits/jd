import CrudOperations from '@/lib/crud-operations';
import {createSuccessResponse, createErrorResponse} from '@/lib/create-response';
import {requestMiddleware, parseQueryParams, validateRequestBody} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {generateContractHTML} from '@/lib/contract-template';
import {contractFee, contractPeriod, contractIsImmutable, ContractValidationError} from '@/lib/contract-terms';

function positiveId(value: unknown) {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) throw new ContractValidationError('معرف العقد أو الشركة غير صالح');
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ContractValidationError('معرف العقد أو الشركة غير صالح');
  return id;
}
function failed(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof ContractValidationError) return createErrorResponse({errorMessage:error.message,status:400});
  return createErrorResponse({errorMessage:'تعذّر إتمام عملية العقد',status:500});
}
function document(company: any, number: string, period: ReturnType<typeof contractPeriod>, fees: ReturnType<typeof contractFee>, language: 'nl'|'fr' = 'nl') {
  return generateContractHTML({contractNumber:number,companyName:company.name,companyVAT:company.vat_number,companyKBO:company.kbo_number,
    companyEmail:company.email,companyPhone:company.phone,companyAddress:company.address,...period,...fees,language,grossBilling:{vatBps:2100,autoRenew:false}});
}

export const GET = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({errorMessage:'Admin access required',status:403});
  try {
    const {company_id, id} = parseQueryParams(request);
    const filters: Record<string, number> = {};
    if (company_id) filters.company_id = positiveId(company_id);
    if (id) filters.id = positiveId(id);
    const contracts = await new CrudOperations('company_contracts',await generateAdminUserToken()).findMany(filters,{orderBy:{column:'created_at',direction:'desc'}});
    return createSuccessResponse(contracts);
  } catch (error) {return failed(error);}
}, true);

export const POST = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({errorMessage:'Admin access required',status:403});
  try {
    const body = await validateRequestBody(request);
    const companyId = positiveId(body.company_id);
    if (typeof body.contract_number !== 'string' || !body.contract_number.trim() || body.contract_number.length > 128) throw new ContractValidationError('رقم العقد مطلوب');
    if (body.auto_renew !== undefined && typeof body.auto_renew !== 'boolean') throw new ContractValidationError('إعداد التجديد غير صالح');
    if (body.language !== undefined && !['nl','fr'].includes(body.language)) throw new ContractValidationError('اختر اللغة الهولندية أو الفرنسية للعقد');
    const period = contractPeriod(body.contract_start_date,body.contract_duration_months ?? 12);
    if(period.durationMonths!==12)throw new ContractValidationError('مدة عقد الاشتراك سنة واحدة');
    const fees = contractFee(body.monthly_fee);
    const notice = body.renewal_notice_days ?? 90;
    if (!Number.isInteger(notice) || notice < 0 || notice > 365) throw new ContractValidationError('مدة إشعار التجديد غير صالحة');
    const token = await generateAdminUserToken();
    const company = await new CrudOperations('companies',token).findById(companyId);
    if (!company) return createErrorResponse({errorMessage:'الشركة غير موجودة',status:404});
    const html = document(company,body.contract_number.trim(),period,fees,body.language);
    const contract = await new CrudOperations('company_contracts',token).create({company_id:companyId,contract_number:body.contract_number.trim(),contract_type:'annual_subscription',
      contract_start_date:period.startDate,contract_end_date:period.endDate,contract_duration_months:period.durationMonths,
      monthly_fee:fees.monthlyFee,annual_fee:fees.annualFee,contract_status:'pending_signature',contract_html_template:html,
      auto_renew:false,renewal_notice_days:0,billing_model:'gross_monthly_v1',monthly_gross_cents:Math.round(fees.monthlyFee*100),vat_bps:2100,contract_language:body.language??'nl'});
    return createSuccessResponse(contract,201);
  } catch (error) {return failed(error);}
}, true);

export const PUT = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({errorMessage:'Admin access required',status:403});
  try {
    const body = await validateRequestBody(request);
    const id = positiveId(body.id);
    const allowed = new Set(['id','monthly_fee','annual_fee','contract_duration_months','auto_renew','contract_status']);
    if (Object.keys(body).some(key=>!allowed.has(key))) throw new ContractValidationError('هذا الحقل غير قابل للتعديل من إعدادات العقد');
    const token = await generateAdminUserToken();
    const crud = new CrudOperations('company_contracts',token);
    const existing = await crud.findById(id);
    if (!existing) return createErrorResponse({errorMessage:'العقد غير موجود',status:404});
    const termsChanged = ['monthly_fee','annual_fee','contract_duration_months','auto_renew'].some(key=>Object.hasOwn(body,key));
    const immutable = contractIsImmutable(existing);
    if ((immutable || existing.registration_request_id) && termsChanged) return createErrorResponse({errorMessage:'شروط العقد الموقّع أو النهائي محفوظة؛ أنشئ عقداً جديداً لتغييرها',status:409});
    const update: Record<string,unknown> = {updated_at:new Date().toISOString()};
    if (body.contract_status !== undefined) {
      const permitted = immutable ? ['active','suspended','expired','cancelled'] : ['draft','pending_signature','cancelled'];
      if (!permitted.includes(body.contract_status)) throw new ContractValidationError('تغيير حالة العقد يتطلب مسار التوقيع المراجع');
      if (body.contract_status === 'active' && !existing.signed_at && !['active','suspended'].includes(existing.contract_status)) throw new ContractValidationError('لا يمكن تفعيل مسودة ملغاة دون توقيع');
      update.contract_status = body.contract_status;
    }
    if (termsChanged) {
      if (body.auto_renew !== undefined && typeof body.auto_renew !== 'boolean') throw new ContractValidationError('إعداد التجديد غير صالح');
      if (body.annual_fee !== undefined && body.monthly_fee === undefined) throw new ContractValidationError('الرسم السنوي يحسب من رسم الاشتراك الشهري');
      const fees = contractFee(Object.hasOwn(body,'monthly_fee') ? body.monthly_fee : existing.monthly_fee);
      const period = contractPeriod(existing.contract_start_date,Object.hasOwn(body,'contract_duration_months') ? body.contract_duration_months : existing.contract_duration_months ?? 12);
      const company = await new CrudOperations('companies',token).findById(existing.company_id);
      if (!company) return createErrorResponse({errorMessage:'الشركة غير موجودة',status:404});
      const language = /<html\s+lang="fr"/.test(existing.contract_html_template || '') ? 'fr' : 'nl';
      Object.assign(update,{monthly_fee:fees.monthlyFee,annual_fee:fees.annualFee,contract_duration_months:period.durationMonths,
        contract_end_date:period.endDate,auto_renew:false,...(existing.billing_model?{monthly_gross_cents:Math.round(fees.monthlyFee*100)}:{}),
        contract_html_template:document(company,existing.contract_number,period,fees,language)});
    }
    return createSuccessResponse(await crud.update(id,update));
  } catch (error) {return failed(error);}
}, true);

export const DELETE = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin) return createErrorResponse({errorMessage:'Admin access required',status:403});
  try {
    const {id: queryId} = parseQueryParams(request);
    const id = positiveId(queryId);
    const crud = new CrudOperations('company_contracts',await generateAdminUserToken());
    const contract = await crud.findById(id);
    if (!contract) return createErrorResponse({errorMessage:'العقد غير موجود',status:404});
    if (contractIsImmutable(contract)) return createErrorResponse({errorMessage:'العقد النهائي محفوظ ولا يمكن حذفه',status:409});
    await crud.update(id,{contract_status:'cancelled',updated_at:new Date().toISOString()});
    return createSuccessResponse({id,contract_status:'cancelled'});
  } catch (error) {return failed(error);}
}, true);
