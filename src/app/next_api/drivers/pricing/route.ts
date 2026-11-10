
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { activeCompanyTariffs, driverPricing, indicativeFare } from '@/lib/company-pricing';

import {signTariffQuote} from "@/lib/tariff-quote";

/**
 * GET - جلب تسعيرة الشركة للسائق الحالي
 */
const pricingHandler = requestMiddleware(async (request, context) => {
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
    const tariffs = activeCompanyTariffs(company);
    if (request.method === 'POST') {
      if (driver.status !== 'active' || company.archived_at) return createErrorResponse({status:403,errorMessage:'Driver or company inactive'});
      const {code, km, minutes} = await validateRequestBody(request);
      const manual=km===null&&minutes===null;
      if (!manual&&(typeof km !== 'number' || !Number.isFinite(km) || km <= 0 || km > 10000 ||
          !Number.isInteger(minutes) || minutes <= 0 || minutes > 14400)) return createErrorResponse({status:400,errorMessage:'Invalid route estimate'});
      const tariff = tariffs.find(item => item.code === code);
      if (!tariff) return createErrorResponse({status:409,errorMessage:'Tariff unavailable'});
      const price = manual?null:indicativeFare(tariff,km,minutes);
      if (price!==null&&(!Number.isFinite(price)||price>100000)) return createErrorResponse({status:400,errorMessage:'Invalid indicative fare'});
      return createSuccessResponse({price,token:signTariffQuote({user:user_id,company:String(company.id),issued:Date.now(),tariff,km,minutes,price},process.env.JWT_SECRET||'')});
    }
    const pricing = driverPricing(company);
    const vehicleId = driver.current_vehicle_id ?? driver.assigned_vehicle_id;

    return createSuccessResponse({
      company_id: company.id,
      company_name: company.name,
      vehicle_id: vehicleId ?? null,
      pricing, tariffs,
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

export const GET = pricingHandler;
export const POST = pricingHandler;
