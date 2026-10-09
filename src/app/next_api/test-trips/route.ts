
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب الرحلات التجريبية
export const GET = requestMiddleware(async (request, context) => {
  const { company_id } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const testTripsCrud = new CrudOperations("test_trips", adminToken);
    
    const filters: Record<string, any> = {};
    if (company_id) {
      filters.company_id = parseInt(company_id);
    }
    
    const testTrips = await testTripsCrud.findMany(
      filters,
      { 
        limit: 100,
        offset: 0,
        orderBy: {
          column: 'test_sequence_number',
          direction: 'asc'
        }
      }
    );

    return createSuccessResponse(testTrips);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل الرحلات التجريبية",
      status: 500,
    });
  }
}, true);

// POST - إنشاء رحلات تجريبية (10 رسائل)
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { company_id, driver_id, vehicle_id } = body;

  if (!company_id || !driver_id || !vehicle_id) {
    return createErrorResponse({
      errorMessage: "company_id و driver_id و vehicle_id مطلوبة",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    
    // التحقق من وجود الشركة
    const companiesCrud = new CrudOperations("companies", adminToken);
    const company = await companiesCrud.findById(company_id);
    
    if (!company) {
      return createErrorResponse({
        errorMessage: "الشركة غير موجودة",
        status: 404,
      });
    }

    // التحقق من وجود السائق
    const driversCrud = new CrudOperations("drivers", adminToken);
    const driver = await driversCrud.findById(driver_id);
    
    if (!driver) {
      return createErrorResponse({
        errorMessage: "السائق غير موجود",
        status: 404,
      });
    }

    // التحقق من وجود المركبة
    const vehiclesCrud = new CrudOperations("vehicles", adminToken);
    const vehicle = await vehiclesCrud.findById(vehicle_id);
    
    if (!vehicle) {
      return createErrorResponse({
        errorMessage: "المركبة غير موجودة",
        status: 404,
      });
    }

    // جلب إعدادات Chiron
    const chironSettingsCrud = new CrudOperations("chiron_settings", adminToken);
    const chironSettings = await chironSettingsCrud.findMany({ company_id: parseInt(company_id) });
    
    if (!chironSettings || chironSettings.length === 0) {
      return createErrorResponse({
        errorMessage: "إعدادات Chiron غير موجودة لهذه الشركة",
        status: 404,
      });
    }

    const settings = chironSettings[0];
    const driverMapping = settings.driver_mapping || {};
    const vehicleMapping = settings.vehicle_mapping || {};

    const chironDriverId = driverMapping[driver_id.toString()];
    const chironVehicleId = vehicleMapping[vehicle_id.toString()];

    if (!chironDriverId) {
      return createErrorResponse({
        errorMessage: "السائق غير مربوط بمعرف Chiron",
        status: 400,
      });
    }

    if (!chironVehicleId) {
      return createErrorResponse({
        errorMessage: "المركبة غير مربوطة بمعرف Chiron",
        status: 400,
      });
    }

    // إنشاء 10 رحلات تجريبية (5 VERTREK + 5 AANKOMST)
    const testTripsCrud = new CrudOperations("test_trips", adminToken);
    const createdTrips = [];

    // مواقع تجريبية في بروكسل
    const testLocations = [
      { lat: 50.8503, lon: 4.3517, address: "Grand Place, Brussels" },
      { lat: 50.8467, lon: 4.3525, address: "Brussels Central Station" },
      { lat: 50.8798, lon: 4.7005, address: "Brussels Airport" },
      { lat: 50.8476, lon: 4.3572, address: "Manneken Pis" },
      { lat: 50.8411, lon: 4.3571, address: "Brussels South Station" }
    ];

    for (let i = 0; i < 5; i++) {
      const ritnummer = `TEST-${company_id}-${Date.now()}-${i + 1}`;
      const startLoc = testLocations[i];
      const endLoc = testLocations[(i + 1) % 5];
      const distance = Math.random() * 10 + 5; // 5-15 كم
      const price = 2.40 + (distance * 1.80);

      // رسالة VERTREK (البداية)
      const vertrekTrip = await testTripsCrud.create({
        company_id: parseInt(company_id),
        ritnummer,
        message_type: 'vertrek',
        driver_id: parseInt(driver_id),
        vehicle_id: parseInt(vehicle_id),
        chiron_driver_id: chironDriverId,
        chiron_vehicle_id: chironVehicleId,
        start_lat: startLoc.lat,
        start_lon: startLoc.lon,
        start_address: startLoc.address,
        timestamp: new Date().toISOString(),
        test_sequence_number: i + 1,
        sync_status: 'pending'
      });

      createdTrips.push(vertrekTrip);

      // رسالة AANKOMST (الوصول)
      const aankomstTrip = await testTripsCrud.create({
        company_id: parseInt(company_id),
        ritnummer,
        message_type: 'aankomst',
        driver_id: parseInt(driver_id),
        vehicle_id: parseInt(vehicle_id),
        chiron_driver_id: chironDriverId,
        chiron_vehicle_id: chironVehicleId,
        start_lat: startLoc.lat,
        start_lon: startLoc.lon,
        end_lat: endLoc.lat,
        end_lon: endLoc.lon,
        start_address: startLoc.address,
        end_address: endLoc.address,
        distance_km: distance,
        price: price,
        timestamp: new Date(Date.now() + 300000).toISOString(), // +5 دقائق
        test_sequence_number: i + 6,
        sync_status: 'pending'
      });

      createdTrips.push(aankomstTrip);
    }

    return createSuccessResponse({
      message: "تم إنشاء 10 رحلات تجريبية بنجاح",
      trips: createdTrips
    }, 201);

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء الرحلات التجريبية",
      status: 500,
    });
  }
}, true);

// DELETE - حذف جميع الرحلات التجريبية لشركة
export const DELETE = requestMiddleware(async (request, context) => {
  const { company_id } = parseQueryParams(request);

  if (!company_id) {
    return createErrorResponse({
      errorMessage: "معرف الشركة مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const testTripsCrud = new CrudOperations("test_trips", adminToken);
    
    const testTrips = await testTripsCrud.findMany({ company_id: parseInt(company_id) });
    
    for (const trip of testTrips) {
      await testTripsCrud.delete(trip.id);
    }

    return createSuccessResponse({ 
      message: "تم حذف جميع الرحلات التجريبية",
      deleted_count: testTrips.length 
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف الرحلات التجريبية",
      status: 500,
    });
  }
}, true);
