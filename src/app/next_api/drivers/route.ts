import {hashString} from "@/lib/server-utils";

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { parseDriverFields, mutateDriverAccount, driverValidationError } from '@/lib/driver-account';

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
    const invalid = driverValidationError(error); if (invalid) return invalid;
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
  
  const {company_id, ...driverBody} = body;
  if (!Number.isSafeInteger(Number(company_id)) || Number(company_id) <= 0) return createErrorResponse({errorMessage:'الشركة مطلوبة',status:400});

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

    const fields = parseDriverFields(driverBody, true);
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

    const result = await mutateDriverAccount(adminToken, 'create', {companyId:Number(company_id), fields, distributorId:created_by_distributor_id});
    return createSuccessResponse({...result.driver,login_phone:fields.phone},201);
  } catch (error: any) {
    const invalid = driverValidationError(error); if (invalid) return invalid;
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

    const approvedFields = parseDriverFields(body);
    if (!context.payload?.isAdmin && approvedFields.password) return createErrorResponse({errorMessage:'Password changes require an administrator',status:403});
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
      const links = await new CrudOperations('distributor_companies', adminToken).findMany({distributor_id,company_id:existing.company_id,is_active:true});
      if (!links.length) return createErrorResponse({errorMessage:'هذه الشركة غير مرتبطة بحسابك',status:403});
      const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
      const approvalRequest = await approvalRequestsCrud.create({
        request_type: 'update',
        entity_type: 'driver',
        entity_id: id,
        requested_by_user_id: context.payload?.sub,
        distributor_id,
        request_data: JSON.stringify(approvedFields),
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

    const fields = parseDriverFields(body);
    const updated = await mutateDriverAccount(adminToken, 'update', {id, fields});
    return createSuccessResponse(updated.driver);
  } catch (error: any) {
    const invalid = driverValidationError(error); if (invalid) return invalid;
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
      const links = await new CrudOperations('distributor_companies', adminToken).findMany({distributor_id,company_id:existing.company_id,is_active:true});
      if (!links.length) return createErrorResponse({errorMessage:'هذه الشركة غير مرتبطة بحسابك',status:403});
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

    await mutateDriverAccount(adminToken, 'deactivate', {id});
    return createSuccessResponse({id,status:'inactive',message:'تم تعطيل حساب السائق مع الحفاظ على سجل الرحلات'});
  } catch (error: any) {
    const invalid = driverValidationError(error); if (invalid) return invalid;
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف السائق",
      status: 500,
    });
  }
}, true);
