import {hashString} from "@/lib/server-utils";

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Fetch drivers (admin sees all, distributor sees only their companies' drivers)
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, company_id } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const driversCrud = new CrudOperations("drivers", adminToken);
    
    const filters: Record<string, any> = {};
    
    // If distributor, show only their companies' drivers
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
        
        const allDrivers = [];
        for (const companyId of companyIds) {
          const companyDrivers = await driversCrud.findMany(
            { company_id: companyId },
            { limit: 10000, offset: 0 }
          );
          if (companyDrivers) {
            allDrivers.push(...companyDrivers);
          }
        }
        
        return createSuccessResponse(allDrivers);
      } else {
        return createSuccessResponse([]);
      }
    }
    
    if (company_id) {
      filters.company_id = parseInt(company_id);
    }

    // Admin: fetch all drivers with a high limit to avoid missing records
    const drivers = await driversCrud.findMany(
      filters,
      { 
        limit: limit > 10 ? limit : 10000,
        offset: offset || 0,
        orderBy: {
          column: 'created_at',
          direction: 'desc'
        }
      }
    );

    return createSuccessResponse(drivers);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل السائقين",
      status: 500,
    });
  }
}, true);

// POST - Create new driver (admin and distributor can create)
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const {
    company_id,
    full_name,
    national_id,
    driver_license,
    capacity_certificate_number,
    phone,
    password
  } = body;

  if (!company_id || !full_name || !phone || !password) {
    return createErrorResponse({
      errorMessage: "الشركة والاسم ورقم الهاتف وكلمة المرور مطلوبة",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    
    const companiesCrud = new CrudOperations("companies", adminToken);
    const company = await companiesCrud.findById(company_id);
    
    if (!company) {
      return createErrorResponse({
        errorMessage: "الشركة غير موجودة",
        status: 404,
      });
    }

    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (!distributors || distributors.length === 0) {
        return createErrorResponse({
          errorMessage: "غير مصرح لك بالوصول",
          status: 403,
        });
      }
      
      const distributor_id = distributors[0].id;
      
      const distributorCompaniesCrud = new CrudOperations("distributor_companies", adminToken);
      const assignments = await distributorCompaniesCrud.findMany({
        distributor_id,
        company_id: parseInt(company_id),
        is_active: true
      });
      
      if (!assignments || assignments.length === 0) {
        return createErrorResponse({
          errorMessage: "هذه الشركة غير مرتبطة بحسابك",
          status: 403,
        });
      }
    }

    const usersCrud = new CrudOperations("users", adminToken);
    
    const phoneEmail = `${phone.replace(/\s+/g, '')}@driver.local`;
    const existingUsers = await usersCrud.findMany({ email: phoneEmail });
    if (existingUsers && existingUsers.length > 0) {
      return createErrorResponse({
        errorMessage: "رقم الهاتف مستخدم بالفعل",
        status: 400,
      });
    }
    
    const hashedPassword = await hashString(password);
    
    const newUser = await usersCrud.create({
      email: phoneEmail,
      password: hashedPassword,
      role: 'app20251225073911jaqqaxdfir_v1_user',
      user_type: 'driver'
    });

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

    const driversCrud = new CrudOperations("drivers", adminToken);
    const newDriver = await driversCrud.create({
      user_id: newUser.id,
      company_id: parseInt(company_id),
      full_name,
      national_id: national_id || null,
      driver_license: driver_license || null,
      capacity_certificate_number: capacity_certificate_number || null,
      phone: phone || null,
      status: 'active',
      created_by_distributor_id
    });

    return createSuccessResponse({
      ...newDriver,
      login_phone: phone,
      login_info: `يمكن للسائق تسجيل الدخول باستخدام رقم الهاتف: ${phone}`
    }, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إضافة السائق",
      status: 500,
    });
  }
}, true);

// PUT - Update driver (requires approval for distributors)
export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  const body = await validateRequestBody(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف السائق مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const driversCrud = new CrudOperations("drivers", adminToken);
    
    const existing = await driversCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "السائق غير موجود",
        status: 404,
      });
    }

    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (!distributors || distributors.length === 0) {
        return createErrorResponse({
          errorMessage: "غير مصرح لك بالوصول",
          status: 403,
        });
      }
      
      const distributor_id = distributors[0].id;
      
      const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
      const approvalRequest = await approvalRequestsCrud.create({
        request_type: 'update',
        entity_type: 'driver',
        entity_id: id,
        requested_by_user_id: context.payload?.sub,
        distributor_id,
        request_data: JSON.stringify(body),
        current_data: JSON.stringify(existing),
        request_reason: 'طلب تعديل بيانات السائق',
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

    if (body.phone && body.phone !== existing.phone) {
      const usersCrud = new CrudOperations("users", adminToken);
      const phoneEmail = `${body.phone.replace(/\s+/g, '')}@driver.local`;
      
      const existingUsers = await usersCrud.findMany({ email: phoneEmail });
      if (existingUsers && existingUsers.length > 0) {
        return createErrorResponse({
          errorMessage: "رقم الهاتف مستخدم بالفعل",
          status: 400,
        });
      }
      
      await usersCrud.update(existing.user_id, {
        email: phoneEmail
      });
    }

    if (body.password) {
      const usersCrud = new CrudOperations("users", adminToken);
      const hashedPassword = await hashString(body.password);
      await usersCrud.update(existing.user_id, {
        password: hashedPassword
      });
      delete body.password;
    }

    const updated = await driversCrud.update(id, {
      ...body,
      updated_at: new Date().toISOString(),
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث السائق",
      status: 500,
    });
  }
}, true);

// DELETE - Delete driver (requires approval for distributors)
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف السائق مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const driversCrud = new CrudOperations("drivers", adminToken);
    
    const existing = await driversCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "السائق غير موجود",
        status: 404,
      });
    }

    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (!distributors || distributors.length === 0) {
        return createErrorResponse({
          errorMessage: "غير مصرح لك بالوصول",
          status: 403,
        });
      }
      
      const distributor_id = distributors[0].id;
      
      const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
      const approvalRequest = await approvalRequestsCrud.create({
        request_type: 'delete',
        entity_type: 'driver',
        entity_id: id,
        requested_by_user_id: context.payload?.sub,
        distributor_id,
        request_data: JSON.stringify({}),
        current_data: JSON.stringify(existing),
        request_reason: 'طلب حذف السائق',
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

    const usersCrud = new CrudOperations("users", adminToken);
    await usersCrud.delete(existing.user_id);
    await driversCrud.delete(id);
    
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف السائق",
      status: 500,
    });
  }
}, true);
