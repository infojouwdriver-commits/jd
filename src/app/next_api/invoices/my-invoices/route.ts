
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب فواتير الشركات التابعة للموزع (للموزعين فقط)
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, status } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    
    // التحقق من أن المستخدم موزع
    if (context.payload?.isAdmin) {
      return createErrorResponse({
        errorMessage: "هذا المسار مخصص للموزعين فقط",
        status: 403,
      });
    }
    
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    const distributors = await distributorsCrud.findMany({
      user_id: parseInt(context.payload?.sub || '0')
    });
    
    if (!distributors || distributors.length === 0) {
      return createSuccessResponse([]);
    }
    
    const distributor_id = distributors[0].id;
    
    // جلب الشركات المعينة للموزع
    const distributorCompaniesCrud = new CrudOperations("distributor_companies", adminToken);
    const assignments = await distributorCompaniesCrud.findMany({
      distributor_id,
      is_active: true
    });
    
    if (!assignments || assignments.length === 0) {
      return createSuccessResponse([]);
    }
    
    const companyIds = assignments.map((a: any) => a.company_id);
    
    // جلب الفواتير لهذه الشركات
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    const allInvoices = [];
    
    for (const companyId of companyIds) {
      const filters: Record<string, any> = { company_id: companyId };
      if (status) {
        filters.status = status;
      }
      
      const companyInvoices = await invoicesCrud.findMany(
        filters,
        {
          limit: limit || 50,
          offset: offset || 0,
          orderBy: {
            column: 'created_at',
            direction: 'desc'
          }
        }
      );
      
      if (companyInvoices) {
        allInvoices.push(...companyInvoices);
      }
    }
    
    // ترتيب الفواتير حسب التاريخ
    allInvoices.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return createSuccessResponse(allInvoices);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل الفواتير",
      status: 500,
    });
  }
}, true);
