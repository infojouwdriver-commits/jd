
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - Fetch vehicles (admin sees all, distributor sees only their companies' vehicles)
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, company_id } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    
    const filters: Record<string, any> = {};
    
    // If distributor, show only their companies' vehicles
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
        
        const allVehicles = [];
        for (const companyId of companyIds) {
          const companyVehicles = await vehiclesCrud.findMany(
            { company_id: companyId },
            { limit: 10000, offset: 0 }
          );
          if (companyVehicles) {
            allVehicles.push(...companyVehicles);
          }
        }
        
        return createSuccessResponse(allVehicles);
      } else {
        return createSuccessResponse([]);
      }
    }
    
    if (company_id) {
      filters.company_id = company_id;
    }
    
    // Admin: fetch all vehicles with a high limit to avoid missing records
    const data = await vehiclesCrud.findMany(
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
    return createSuccessResponse(data);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل المركبات",
      status: 500,
    });
  }
}, true);

// POST - Create new vehicle (admin and distributor can create)
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { company_id, brand, model, plate_number, vin, chiron_vehicle_id, status } = body;
  
  if (!company_id || !brand || !model || !plate_number) {
    return createErrorResponse({
      errorMessage: "الحقول المطلوبة: company_id, brand, model, plate_number",
      status: 400,
    });
  }
  
  try {
    const adminToken = await generateAdminUserToken();
    
    // If distributor, verify the company belongs to them
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
    
    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    const data = await vehiclesCrud.create({
      company_id,
      brand,
      model,
      plate_number,
      vin,
      chiron_vehicle_id,
      status: status || 'active',
      documents: [],
      created_by_distributor_id
    });
    
    return createSuccessResponse(data, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء المركبة",
      status: 500,
    });
  }
}, true);

// PUT - Update vehicle (requires approval for distributors)
export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف المركبة مطلوب",
      status: 400,
    });
  }
  
  const body = await validateRequestBody(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    
    const existing = await vehiclesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "المركبة غير موجودة",
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
        entity_type: 'vehicle',
        entity_id: id,
        requested_by_user_id: context.payload?.sub,
        distributor_id,
        request_data: JSON.stringify(body),
        current_data: JSON.stringify(existing),
        request_reason: 'طلب تعديل بيانات المركبة',
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
    
    const data = await vehiclesCrud.update(id, body);
    return createSuccessResponse(data);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث المركبة",
      status: 500,
    });
  }
}, true);

// DELETE - Delete vehicle (requires approval for distributors)
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف المركبة مطلوب",
      status: 400,
    });
  }
  
  try {
    const adminToken = await generateAdminUserToken();
    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    
    const existing = await vehiclesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "المركبة غير موجودة",
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
        entity_type: 'vehicle',
        entity_id: id,
        requested_by_user_id: context.payload?.sub,
        distributor_id,
        request_data: JSON.stringify({}),
        current_data: JSON.stringify(existing),
        request_reason: 'طلب حذف المركبة',
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
    
    const data = await vehiclesCrud.delete(id);
    return createSuccessResponse(data);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف المركبة",
      status: 500,
    });
  }
}, true);
