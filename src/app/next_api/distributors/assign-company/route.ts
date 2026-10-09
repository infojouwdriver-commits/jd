
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// POST - تعيين شركة لموزع
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  // التحقق من أن المستخدم مسؤول
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  const { distributor_id, company_id, notes } = body;

  if (!distributor_id || !company_id) {
    return createErrorResponse({
      errorMessage: "معرف الموزع ومعرف الشركة مطلوبان",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const user_id = context.payload?.sub;
    
    // التحقق من وجود الموزع
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    const distributor = await distributorsCrud.findById(distributor_id);
    
    if (!distributor) {
      return createErrorResponse({
        errorMessage: "الموزع غير موجود",
        status: 404,
      });
    }

    // التحقق من وجود الشركة
    const companiesCrud = new CrudOperations("companies", adminToken);
    const company = await companiesCrud.findById(company_id);
    
    if (!company) {
      return createErrorResponse({
        errorMessage: "الشركة غير موجودة",
        status: 404,
      });
    }

    // التحقق من عدم وجود تعيين سابق
    const distributorCompaniesCrud = new CrudOperations("distributor_companies", adminToken);
    const existing = await distributorCompaniesCrud.findMany({
      distributor_id,
      company_id
    });

    if (existing && existing.length > 0) {
      return createErrorResponse({
        errorMessage: "الشركة معينة بالفعل لهذا الموزع",
        status: 400,
      });
    }

    // إنشاء التعيين
    const assignment = await distributorCompaniesCrud.create({
      distributor_id,
      company_id,
      assigned_by_user_id: user_id,
      is_active: true,
      notes: notes || null
    });

    return createSuccessResponse(assignment, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تعيين الشركة للموزع",
      status: 500,
    });
  }
}, true);
