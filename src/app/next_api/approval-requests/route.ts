import {createPostgrestClient} from '@/lib/postgrest';

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب طلبات الموافقة
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, status, distributor_id } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
    
    const filters: Record<string, any> = {};
    
    // إذا كان المستخدم موزع، عرض طلباته فقط
    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(context.payload?.sub || '0')
      });
      
      if (distributors && distributors.length > 0) {
        filters.distributor_id = distributors[0].id;
      } else {
        return createSuccessResponse([]);
      }
    } else if (distributor_id) {
      filters.distributor_id = parseInt(distributor_id);
    }
    
    if (status) {
      filters.status = status;
    }
    
    const requests = await approvalRequestsCrud.findMany(
      filters,
      { 
        limit: limit || 100, 
        offset: offset || 0,
        orderBy: {
          column: 'created_at',
          direction: 'desc'
        }
      }
    );

    return createSuccessResponse(requests);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل طلبات الموافقة",
      status: 500,
    });
  }
}, true);

// POST - إنشاء طلب موافقة جديد
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { 
    request_type, 
    entity_type, 
    entity_id, 
    request_data, 
    current_data,
    request_reason 
  } = body;

  if (!request_type || !entity_type || !entity_id || !request_data) {
    return createErrorResponse({
      errorMessage: "جميع الحقول الأساسية مطلوبة",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const user_id = context.payload?.sub;
    
    let distributor_id = null;
    if (!context.payload?.isAdmin) {
      const distributorsCrud = new CrudOperations("distributors", adminToken);
      const distributors = await distributorsCrud.findMany({
        user_id: parseInt(user_id || '0')
      });
      
      if (distributors && distributors.length > 0) {
        distributor_id = distributors[0].id;
      }
    }
    
    const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
    const newRequest = await approvalRequestsCrud.create({
      request_type,
      entity_type,
      entity_id,
      requested_by_user_id: user_id,
      distributor_id,
      request_data: JSON.stringify(request_data),
      current_data: current_data ? JSON.stringify(current_data) : null,
      request_reason: request_reason || null,
      status: 'pending'
    });

    const approvalHistoryCrud = new CrudOperations("approval_history", adminToken);
    await approvalHistoryCrud.create({
      approval_request_id: newRequest.id,
      action: 'submitted',
      performed_by_user_id: user_id,
      action_notes: 'تم تقديم الطلب'
    });

    return createSuccessResponse(newRequest, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء طلب الموافقة",
      status: 500,
    });
  }
}, true);

// PUT - تحديث حالة طلب الموافقة (للمسؤول فقط)
export const PUT = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const { id, status, review_notes } = body;

  if (!id || !status) {
    return createErrorResponse({
      errorMessage: "معرف الطلب والحالة مطلوبان",
      status: 400,
    });
  }

  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const approvalRequestsCrud = new CrudOperations("approval_requests", adminToken);
    
    const existing = await approvalRequestsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "طلب الموافقة غير موجود",
        status: 404,
      });
    }

    if(existing.entity_type==='company' && existing.request_type==='delete'){
      if(!['approved','rejected'].includes(status))return createErrorResponse({status:400,errorMessage:'Invalid decision'});
      const reviewed=await createPostgrestClient(adminToken).rpc('security_review_company_archive',{p_approval:Number(id),p_actor:Number(context.payload!.sub),p_decision:status,p_notes:typeof review_notes==='string'?review_notes:''});
      if(reviewed.error)return createErrorResponse({status:reviewed.error.code==='40001'?409:503,errorMessage:'Archive review unavailable; finish active trips and review pending Chiron deliveries'});
      return createSuccessResponse(reviewed.data);
    }

    const user_id = context.payload?.sub;

    const updated = await approvalRequestsCrud.update(id, {
      status,
      reviewed_by_user_id: user_id,
      reviewed_at: new Date().toISOString(),
      review_notes: review_notes || null,
      updated_at: new Date().toISOString()
    });

    const approvalHistoryCrud = new CrudOperations("approval_history", adminToken);
    await approvalHistoryCrud.create({
      approval_request_id: id,
      action: status,
      performed_by_user_id: user_id,
      action_notes: review_notes || null
    });

    // إذا تمت الموافقة، تنفيذ العملية
    if (status === 'approved') {
      await executeApprovedRequest(existing, adminToken);
    }

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث طلب الموافقة",
      status: 500,
    });
  }
}, true);

// دالة مساعدة لتنفيذ الطلب المعتمد
async function executeApprovedRequest(request: any, adminToken: string) {
  const { request_type, entity_type, entity_id, request_data } = request;
  const data = typeof request_data === 'string' ? JSON.parse(request_data) : request_data;

  // إذا كان طلب إنشاء مركبة من سائق
  if (request_type === 'create' && entity_type === 'vehicle') {
    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    const { requested_by_driver_id, ...vehicleData } = data;
    const newVehicle = await vehiclesCrud.create(vehicleData);

    // ربط المركبة بالسائق إذا كان الطلب من سائق
    if (requested_by_driver_id && newVehicle?.id) {
      const driversCrud = new CrudOperations('drivers', adminToken);
      await driversCrud.update(requested_by_driver_id, {
        assigned_vehicle_id: newVehicle.id,
        updated_at: new Date().toISOString(),
      });
    }
    return;
  }

  const crud = new CrudOperations(getTableName(entity_type), adminToken);

  if (request_type === 'update') {
    await crud.update(entity_id, data);
  } else if (request_type === 'delete') {
    await crud.delete(entity_id);
  }
}

// دالة مساعدة للحصول على اسم الجدول
function getTableName(entity_type: string): string {
  const mapping: Record<string, string> = {
    'company': 'companies',
    'vehicle': 'vehicles',
    'driver': 'drivers',
    'invoice': 'invoices',
    'expense': 'expenses'
  };
  return mapping[entity_type] || entity_type;
}
