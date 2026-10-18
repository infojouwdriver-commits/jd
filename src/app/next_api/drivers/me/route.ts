
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { ChironService } from '@/lib/chiron-service';

export const GET = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    
    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });
    
    if (!drivers || drivers.length === 0) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على معلومات السائق",
        status: 404,
      });
    }

    const driver = drivers[0];

    const company = await ChironService.getCompanyConfig(driver.company_id);
    const pricing = ChironService.getPricingJson(company);

    // جلب عدد المركبات النشطة للشركة
    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    const vehicles = await vehiclesCrud.findMany({
      company_id: driver.company_id,
      status: 'active',
    });

    return createSuccessResponse({
      native_trip_contract_version: 1,
      driver: {
        id: driver.id,
        full_name: driver.full_name,
        phone: driver.phone,
        status: driver.status,
        company_id: driver.company_id,
        current_vehicle_id: driver.current_vehicle_id || null,
      },
      company: {
        id: company.id,
        name: company.name,
        chiron_mode: company.chiron_mode,
        is_test: company.is_test===true,
        pricing: pricing,
      },
      vehicles_count: vehicles ? vehicles.length : 0,
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل معلومات السائق",
      status: 500,
    });
  }
}, true);

export const PUT = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  try {
    const body = await validateRequestBody(request);
    const { current_vehicle_id } = body;

    const adminToken = await generateAdminUserToken();
    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });

    if (!drivers || drivers.length === 0) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على معلومات السائق",
        status: 404,
      });
    }

    const driver = drivers[0];

    if (current_vehicle_id) {
      const vehicle = await new CrudOperations('vehicles', adminToken).findById(current_vehicle_id);
      if (!vehicle || String(vehicle.company_id) !== String(driver.company_id)) return createErrorResponse({errorMessage:'Vehicle not permitted',status:403});
    }
    const updated = await driversCrud.update(driver.id, {
      current_vehicle_id: current_vehicle_id || null,
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث مركبة السائق",
      status: 500,
    });
  }
}, true);
