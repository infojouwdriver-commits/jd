
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { createHash, randomUUID } from 'crypto';

function generateTripUuid(): string { return randomUUID(); }

function generateTripHash(data: Record<string, any>): string {
  const payload = JSON.stringify({
    trip_uuid: data.trip_uuid,
    user_id: data.user_id,
    driver_id: data.driver_id,
    vehicle_id: data.vehicle_id,
    start_time: data.start_time,
    start_lat: data.start_lat,
    start_lon: data.start_lon,
    start_address: data.start_address,
  });
  return createHash('sha256').update(payload).digest('hex');
}

function getRetentionDate(): string | null {
  const years = Number(process.env.TRIP_RETENTION_YEARS);
  if (!Number.isInteger(years) || years < 1 || years > 20) return null;
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split('T')[0];
}

export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  const { start_lat, start_lon, start_address } = body;

  if (typeof start_lat !== "number" || !Number.isFinite(start_lat) || Math.abs(start_lat) > 90 || typeof start_lon !== "number" || !Number.isFinite(start_lon) || Math.abs(start_lon) > 180 || typeof start_address !== "string" || !start_address || start_address.length > 500) {
    return createErrorResponse({
      errorMessage: "موقع وعنوان الانطلاق مطلوبان",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations("trips", context.token);

    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });

    if (!drivers || drivers.length === 0) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على ملف السائق",
        status: 404,
      });
    }

    const driver = drivers[0];

    // Resolve vehicle
    let vehicle: any = null;
    if (driver.current_vehicle_id) {
      const vehiclesCrud = new CrudOperations("vehicles", adminToken);
      vehicle = await vehiclesCrud.findById(driver.current_vehicle_id);
    }
    if (!vehicle) {
      const vehiclesCrud = new CrudOperations("vehicles", adminToken);
      const vehicles = await vehiclesCrud.findMany({
        company_id: driver.company_id,
        status: 'active',
      });
      vehicle = vehicles?.[0] || null;
    }

    if (!vehicle || String(vehicle.company_id) !== String(driver.company_id)) return createErrorResponse({errorMessage:'No authorized vehicle',status:403});
    const vehicleId = vehicle.id;

    const trip_uuid = generateTripUuid();
    const start_time = new Date().toISOString();

    const tripData: Record<string, any> = {
      user_id: parseInt(user_id),
      company_id: driver.company_id,
      driver_id: driver.id,
      vehicle_id: vehicleId,
      start_time,
      start_lat,
      start_lon,
      start_address,
      status: 'in_progress',
      trip_uuid,
      record_retention_until: getRetentionDate(),
      locked_after_completion: false,
    };

    // Generate hash after building the object
    tripData.trip_hash = generateTripHash(tripData);

    const data = await tripsCrud.create(tripData);
    return createSuccessResponse(data, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل بدء الرحلة",
      status: 500,
    });
  }
}, true);
