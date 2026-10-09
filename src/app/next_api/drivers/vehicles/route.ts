
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - Fetch vehicles for the driver's company
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

    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    const vehicles = await vehiclesCrud.findMany(
      { company_id: driver.company_id, status: 'active' },
      { limit: 1000, offset: 0 }
    );

    return createSuccessResponse({
      vehicles: vehicles || [],
      current_vehicle_id: driver.current_vehicle_id || null,
      driver_id: driver.id,
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل المركبات",
      status: 500,
    });
  }
}, true);

// PUT - Update driver's current vehicle
export const PUT = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  const body = await validateRequestBody(request);
  const { vehicle_id } = body;

  if (!vehicle_id) {
    return createErrorResponse({
      errorMessage: "معرف المركبة مطلوب",
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

    // Verify the vehicle belongs to the driver's company
    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    const vehicle = await vehiclesCrud.findById(vehicle_id);

    if (!vehicle || vehicle.company_id !== driver.company_id) {
      return createErrorResponse({
        errorMessage: "المركبة غير موجودة أو لا تنتمي لشركتك",
        status: 403,
      });
    }

    // Update driver's current vehicle
    const updatedDriver = await driversCrud.update(driver.id, {
      current_vehicle_id: vehicle_id,
    });

    return createSuccessResponse({
      driver_id: driver.id,
      current_vehicle_id: vehicle_id,
      vehicle: vehicle,
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث المركبة",
      status: 500,
    });
  }
}, true);
