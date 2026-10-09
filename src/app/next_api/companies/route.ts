
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { hashString } from '@/lib/server-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations("companies", adminToken);
    
    const filters: Record<string, any> = {};
    
    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (distributors && distributors.length > 0) {
        const distributor_id = distributors[0].id;
        
        const distributorCompaniesCrud = new CrudOperations("distributor_companies", adminToken);
        const assignments = await distributorCompaniesCrud.findMany({
          distributor_id,
          is_active: true
        });
        
        if (!assignments || assignments.length === 0) {
          return createSuccessResponse([]);
        }
        
        const companyIds = assignments.map((a: any) => a.company_id);
        const companies = [];
        for (const companyId of companyIds) {
          const company = await companiesCrud.findById(companyId);
          if (company) companies.push(company);
        }
        
        return createSuccessResponse(companies);
      } else {
        return createSuccessResponse([]);
      }
    }
    
    const companies = await companiesCrud.findMany(
      filters,
      { 
        limit: limit > 10 ? limit : 10000,
        offset: offset || 0,
        orderBy: { column: 'created_at', direction: 'desc' }
      }
    );

    return createSuccessResponse(companies);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || "فشل تحميل الشركات", status: 500 });
  }
}, true);

export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { name, vat_number, kbo_number, address, email, phone, logo_url, password } = body;

  if (!name || !vat_number) {
    return createErrorResponse({ errorMessage: "اسم الشركة ورقم VAT مطلوبان", status: 400 });
  }

  if (!kbo_number) {
    return createErrorResponse({ errorMessage: "رقم KBO مطلوب لإرسال البيانات إلى Chiron", status: 400 });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations("companies", adminToken);
    
    let created_by_distributor_id = null;
    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (distributors && distributors.length > 0) {
        created_by_distributor_id = distributors[0].id;
      }
    }

    let password_hash = null;
    if (password && password.length >= 4) {
      password_hash = await hashString(password);
    }
    
    const newCompany = await companiesCrud.create({
      name,
      vat_number,
      kbo_number,
      address: address || null,
      email: email || null,
      phone: phone || null,
      logo_url: logo_url || null,
      chiron_mode: 'TEST',
      bank_account_iban: 'BE16973450355674',
      bank_account_bic: 'ARSPBE22',
      bank_account_holder: name,
      created_by_distributor_id,
      password_hash,
    });

    if (created_by_distributor_id) {
      const distributorCompaniesCrud = new CrudOperations("distributor_companies", adminToken);
      await distributorCompaniesCrud.create({
        distributor_id: created_by_distributor_id,
        company_id: newCompany.id,
        assigned_by_user_id: context.payload?.sub,
        is_active: true,
        notes: 'تم الإنشاء تلقائياً عند إضافة الشركة'
      });
    }

    return createSuccessResponse(newCompany, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || "فشل إنشاء الشركة", status: 500 });
  }
}, true);

export const PUT = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const { id, password, ...updateData } = body;

  if (!id) {
    return createErrorResponse({ errorMessage: "معرف الشركة مطلوب", status: 400 });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations("companies", adminToken);
    
    const existing = await companiesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({ errorMessage: "الشركة غير موجودة", status: 404 });
    }

    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (!distributors || distributors.length === 0) {
        return createErrorResponse({ errorMessage: "غير مصرح لك بالوصول", status: 403 });
      }
      
      const distributor_id = distributors[0].id;
      
      const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
      const approvalRequest = await approvalRequestsCrud.create({
        request_type: 'update',
        entity_type: 'company',
        entity_id: id,
        requested_by_user_id: context.payload?.sub,
        distributor_id,
        request_data: JSON.stringify(updateData),
        current_data: JSON.stringify(existing),
        request_reason: 'طلب تعديل بيانات الشركة',
        status: 'pending'
      });
      
      const approvalHistoryCrud = new CrudOperations("approval_history", adminToken);
      await approvalHistoryCrud.create({
        approval_request_id: approvalRequest.id,
        action: 'submitted',
        performed_by_user_id: context.payload?.sub,
        action_notes: 'تم تقديم طلب التعديل'
      });
      
      return createSuccessResponse({
        message: 'تم إرسال طلب التعديل للمسؤول',
        approval_request_id: approvalRequest.id,
        status: 'pending_approval'
      });
    }

    // Handle password update separately
    if (password && password.length >= 4) {
      updateData.password_hash = await hashString(password);
    }

    if (updateData.chiron_mode && !['TEST', 'PRODUCTION'].includes(updateData.chiron_mode)) {
      return createErrorResponse({ errorMessage: "وضع Chiron يجب أن يكون TEST أو PRODUCTION", status: 400 });
    }

    const updated = await companiesCrud.update(id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || "فشل تحديث الشركة", status: 500 });
  }
}, true);

export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({ errorMessage: "معرف الشركة مطلوب", status: 400 });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations("companies", adminToken);
    
    const existing = await companiesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({ errorMessage: "الشركة غير موجودة", status: 404 });
    }

    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (!distributors || distributors.length === 0) {
        return createErrorResponse({ errorMessage: "غير مصرح لك بالوصول", status: 403 });
      }
      
      const distributor_id = distributors[0].id;
      
      const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
      const approvalRequest = await approvalRequestsCrud.create({
        request_type: 'delete',
        entity_type: 'company',
        entity_id: id,
        requested_by_user_id: context.payload?.sub,
        distributor_id,
        request_data: JSON.stringify({}),
        current_data: JSON.stringify(existing),
        request_reason: 'طلب حذف الشركة',
        status: 'pending'
      });
      
      const approvalHistoryCrud = new CrudOperations("approval_history", adminToken);
      await approvalHistoryCrud.create({
        approval_request_id: approvalRequest.id,
        action: 'submitted',
        performed_by_user_id: context.payload?.sub,
        action_notes: 'تم تقديم طلب الحذف'
      });
      
      return createSuccessResponse({
        message: 'تم إرسال طلب الحذف للمسؤول',
        approval_request_id: approvalRequest.id,
        status: 'pending_approval'
      });
    }

    await companiesCrud.delete(id);
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: error.message || "فشل حذف الشركة", status: 500 });
  }
}, true);
