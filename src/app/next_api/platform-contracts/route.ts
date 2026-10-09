
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب عقود المنصات
export const GET = requestMiddleware(async (request, context) => {
  const { company_id, platform_name } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const platformContractsCrud = new CrudOperations("platform_contracts", adminToken);
    
    const filters: Record<string, any> = {};
    if (company_id) {
      filters.company_id = parseInt(company_id);
    }
    if (platform_name) {
      filters.platform_name = platform_name.toLowerCase();
    }
    
    const contracts = await platformContractsCrud.findMany(filters);
    return createSuccessResponse(contracts);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل عقود المنصات",
      status: 500,
    });
  }
}, true);

// POST - إنشاء عقد منصة جديد
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { 
    company_id,
    platform_name,
    contract_number,
    contractor_name,
    contract_start_date,
    contract_end_date,
    is_active,
    notes
  } = body;

  if (!company_id || !platform_name || !contract_number || !contractor_name) {
    return createErrorResponse({
      errorMessage: "جميع الحقول الأساسية مطلوبة",
      status: 400,
    });
  }

  // تحويل اسم المنصة إلى أحرف صغيرة والتحقق من صحته
  const normalizedPlatformName = platform_name.toLowerCase().trim();
  
  if (!['uber', 'bolt', 'heetch'].includes(normalizedPlatformName)) {
    return createErrorResponse({
      errorMessage: "اسم المنصة يجب أن يكون uber أو bolt أو heetch",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const platformContractsCrud = new CrudOperations("platform_contracts", adminToken);
    
    // التحقق من عدم وجود عقد مكرر لنفس الشركة والمنصة
    const existingContracts = await platformContractsCrud.findMany({
      company_id: parseInt(company_id),
      platform_name: normalizedPlatformName
    });

    if (existingContracts && existingContracts.length > 0) {
      return createErrorResponse({
        errorMessage: `يوجد عقد بالفعل لهذه الشركة مع منصة ${normalizedPlatformName.toUpperCase()}`,
        status: 400,
      });
    }
    
    const newContract = await platformContractsCrud.create({
      company_id: parseInt(company_id),
      platform_name: normalizedPlatformName,
      contract_number: contract_number.trim(),
      contractor_name: contractor_name.trim(),
      contract_start_date: contract_start_date || null,
      contract_end_date: contract_end_date || null,
      is_active: is_active !== undefined ? is_active : true,
      notes: notes ? notes.trim() : null
    });

    return createSuccessResponse(newContract, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء عقد المنصة",
      status: 500,
    });
  }
}, true);

// PUT - تحديث عقد منصة
export const PUT = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const { id, platform_name, contract_number, contractor_name, notes, ...otherData } = body;

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف العقد مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const platformContractsCrud = new CrudOperations("platform_contracts", adminToken);
    
    const existing = await platformContractsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "العقد غير موجود",
        status: 404,
      });
    }

    // إعداد البيانات المحدثة
    const updateData: any = {
      ...otherData,
      updated_at: new Date().toISOString()
    };

    // تحويل اسم المنصة إلى أحرف صغيرة إذا تم تحديثه
    if (platform_name) {
      const normalizedPlatformName = platform_name.toLowerCase().trim();
      if (!['uber', 'bolt', 'heetch'].includes(normalizedPlatformName)) {
        return createErrorResponse({
          errorMessage: "اسم المنصة يجب أن يكون uber أو bolt أو heetch",
          status: 400,
        });
      }
      updateData.platform_name = normalizedPlatformName;
    }

    // تنظيف الحقول النصية
    if (contract_number) {
      updateData.contract_number = contract_number.trim();
    }
    if (contractor_name) {
      updateData.contractor_name = contractor_name.trim();
    }
    if (notes !== undefined) {
      updateData.notes = notes ? notes.trim() : null;
    }

    const updated = await platformContractsCrud.update(id, updateData);

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث عقد المنصة",
      status: 500,
    });
  }
}, true);

// DELETE - حذف عقد منصة
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
    const platformContractsCrud = new CrudOperations("platform_contracts", adminToken);
    
    const existing = await platformContractsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "العقد غير موجود",
        status: 404,
      });
    }

    await platformContractsCrud.delete(id);
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف عقد المنصة",
      status: 500,
    });
  }
}, true);
