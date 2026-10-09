
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب الشركات المعينة للموزع الحالي
export const GET = requestMiddleware(async (request, context) => {
  try {
    const adminToken = await generateAdminUserToken();
    const user_id = context.payload?.sub;
    
    // جلب معرف الموزع
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    const distributors = await distributorsCrud.findMany({
      user_id: parseInt(user_id || '0')
    });
    
    if (!distributors || distributors.length === 0) {
      return createSuccessResponse([]);
    }
    
    const distributor_id = distributors[0].id;
    
    // جلب الشركات المعينة
    const distributorCompaniesCrud = new CrudOperations("distributor_companies", adminToken);
    const assignments = await distributorCompaniesCrud.findMany({
      distributor_id,
      is_active: true
    });
    
    if (!assignments || assignments.length === 0) {
      return createSuccessResponse([]);
    }
    
    // جلب تفاصيل الشركات
    const companiesCrud = new CrudOperations("companies", adminToken);
    const companyIds = assignments.map((a: any) => a.company_id);
    
    const companies = [];
    for (const companyId of companyIds) {
      const company = await companiesCrud.findById(companyId);
      if (company) {
        companies.push(Object.fromEntries(["id","name","vat_number","kbo_number","address","email","phone","subscription_status"].map(key => [key,company[key]])));
      }
    }

    return createSuccessResponse(companies);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل الشركات",
      status: 500,
    });
  }
}, true);
