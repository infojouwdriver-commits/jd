
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { generateContractHTML } from '@/lib/contract-template';

// GET - جلب العقود
export const GET = requestMiddleware(async (request, context) => {
  const { company_id } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const contractsCrud = new CrudOperations("company_contracts", adminToken);
    
    const filters: Record<string, any> = {};
    if (company_id) {
      filters.company_id = parseInt(company_id);
    }
    
    const contracts = await contractsCrud.findMany(
      filters,
      { 
        orderBy: {
          column: 'created_at',
          direction: 'desc'
        }
      }
    );

    return createSuccessResponse(contracts);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل العقود",
      status: 500,
    });
  }
}, true);

// POST - إنشاء عقد جديد
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { 
    company_id,
    contract_number,
    contract_start_date,
    contract_duration_months,
    monthly_fee,
    auto_renew,
    renewal_notice_days,
    company_name,
    company_vat,
    company_kbo,
    company_email,
    company_phone,
    company_address
  } = body;

  if (!company_id || !contract_number || !contract_start_date || !monthly_fee) {
    return createErrorResponse({
      errorMessage: "جميع الحقول الأساسية مطلوبة",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const contractsCrud = new CrudOperations("company_contracts", adminToken);
    
    const startDate = new Date(contract_start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (contract_duration_months || 12));

    const annualFee = parseFloat(monthly_fee) * 12;

    // توليد HTML للعقد
    const contractHTML = generateContractHTML({
      contractNumber: contract_number,
      companyName: company_name,
      companyVAT: company_vat,
      companyKBO: company_kbo,
      companyEmail: company_email,
      companyPhone: company_phone,
      companyAddress: company_address,
      startDate: contract_start_date,
      endDate: endDate.toISOString().split('T')[0],
      monthlyFee: parseFloat(monthly_fee),
      annualFee: annualFee,
      durationMonths: contract_duration_months || 12
    });

    const newContract = await contractsCrud.create({
      company_id: parseInt(company_id),
      contract_number,
      contract_type: 'annual_subscription',
      contract_start_date,
      contract_end_date: endDate.toISOString().split('T')[0],
      contract_duration_months: contract_duration_months || 12,
      monthly_fee: parseFloat(monthly_fee),
      annual_fee: annualFee,
      contract_status: 'pending_signature',
      contract_html_template: contractHTML,
      auto_renew: auto_renew !== undefined ? auto_renew : true,
      renewal_notice_days: renewal_notice_days || 90
    });

    return createSuccessResponse(newContract, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء العقد",
      status: 500,
    });
  }
}, true);

// PUT - تحديث عقد
export const PUT = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const { id, ...updateData } = body;

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف العقد مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const contractsCrud = new CrudOperations("company_contracts", adminToken);
    
    const existing = await contractsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "العقد غير موجود",
        status: 404,
      });
    }

    const updated = await contractsCrud.update(id, {
      ...updateData,
      updated_at: new Date().toISOString()
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث العقد",
      status: 500,
    });
  }
}, true);

// DELETE - حذف عقد
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف العقد مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const contractsCrud = new CrudOperations("company_contracts", adminToken);
    
    const existing = await contractsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "العقد غير موجود",
        status: 404,
      });
    }

    // التحقق من أن العقد ليس نشطاً
    if (existing.contract_status === 'active') {
      return createErrorResponse({
        errorMessage: "لا يمكن حذف عقد نشط",
        status: 400,
      });
    }

    await contractsCrud.delete(id);
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف العقد",
      status: 500,
    });
  }
}, true);
