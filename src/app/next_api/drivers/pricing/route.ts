
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { driverPricing } from '@/lib/company-pricing';

/**
 * GET - جلب تسعيرة الشركة للسائق الحالي
 */
export const GET = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  try {
    // استخدام token المستخدم الحالي بدلاً من admin token
    const driversCrud = new CrudOperations("drivers", context.token);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });
    
    if (!drivers || drivers.length === 0) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على معلومات السائق",
        status: 404,
      });
    }

    const driver = drivers[0];

    // جلب معلومات الشركة
    const companiesCrud = new CrudOperations("companies", context.token);
    const company = await companiesCrud.findById(driver.company_id);

    if (!company) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على معلومات الشركة",
        status: 404,
      });
    }

    // بناء كائن التسعير من الحقول الموجودة في قاعدة البيانات
    const pricing = driverPricing(company);

    return createSuccessResponse({
      company_id: company.id,
      company_name: company.name,
      pricing: pricing,
      chiron_mode: company.chiron_mode
    });

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل التسعيرة",
      status: 500,
    });
  }
}, true);
