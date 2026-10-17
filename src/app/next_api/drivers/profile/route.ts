
import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateAdminUserToken } from '@/lib/auth';
import CrudOperations from '@/lib/crud-operations';

// GET - جلب بيانات السائق الكاملة مع مركبته وشركته وجميع مركباته
export const GET = requestMiddleware(async (request: NextRequest, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({ errorMessage: 'User ID is required', status: 400 });
  }

  try {
    const adminToken = await generateAdminUserToken();

    // 1. جلب بيانات السائق
    const driversCrud = new CrudOperations('drivers', adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });

    if (!drivers || drivers.length === 0) {
      return createSuccessResponse({ hasProfile: false, registrationStatus: 'not_started' });
    }

    const driver = drivers[0];

    // 2. جلب بيانات الشركة
    const companiesCrud = new CrudOperations('companies', adminToken);
    const company = await companiesCrud.findById(driver.company_id);

    // 3. جلب بيانات المركبة المخصصة
    let vehicle = null;
    const vehicleId = driver.current_vehicle_id || driver.assigned_vehicle_id;
    if (vehicleId) {
      const vehiclesCrud = new CrudOperations('vehicles', adminToken);
      vehicle = await vehiclesCrud.findById(vehicleId);
      if(vehicle && vehicle.company_id !== driver.company_id) vehicle = null;
    }

    // 4. جلب جميع مركبات الشركة
    let allVehicles: any[] = [];
    if (driver.company_id) {
      const vehiclesCrud = new CrudOperations('vehicles', adminToken);
      allVehicles = await vehiclesCrud.findMany({ company_id: driver.company_id, status: 'active' }) || [];
    }

    // 5. جلب طلبات الإضافة المعلقة للسائق
    const regRequestsCrud = new CrudOperations('driver_registration_requests', adminToken);
    const pendingRequests = await regRequestsCrud.findMany({ driver_id: driver.id }) || [];
    const latestRequest = pendingRequests.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    // السائق لديه ملف شخصي بغض النظر عن حالة التسجيل
    return createSuccessResponse({
      hasProfile: true,
      registrationStatus: driver.registration_status,
      driver: {
        id: driver.id,
        full_name: driver.full_name,
        phone: driver.phone,
        national_id: driver.national_id,
        driver_license: driver.driver_license,
        bestuurderspas_number: driver.bestuurderspas_number,
        status: driver.status,
        registration_status: driver.registration_status,
        preferred_language: driver.preferred_language,
        created_at: driver.created_at,
      },
      company: company
        ? {
            id: company.id,
            name: company.name,
            vat_number: company.vat_number,
            kbo_number: company.kbo_number,
            address: company.address,
            email: company.email,
            phone: company.phone,
            subscription_status: company.subscription_status,
          }
        : null,
      vehicle: vehicle
        ? {
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            plate_number: vehicle.plate_number,
            vin: vehicle.vin,
            status: vehicle.status,
          }
        : null,
      all_vehicles: allVehicles.map((v: any) => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
        plate_number: v.plate_number,
        status: v.status,
      })),
      latest_registration_request: latestRequest
        ? {
            id: latestRequest.id,
            status: latestRequest.status,
            submitted_at: latestRequest.submitted_at,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || 'Failed to load driver profile',
      status: 500,
    });
  }
}, true);

// POST - طلب إضافة مركبة جديدة (يحتاج موافقة المدير)
export const POST = requestMiddleware(async (request: NextRequest, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({ errorMessage: 'User ID is required', status: 400 });
  }

  try {
    const body = await validateRequestBody(request);
    const { request_type, vehicle_brand, vehicle_model, plate_number, vin } = body;

    if (request_type !== 'add_vehicle') {
      return createErrorResponse({ errorMessage: 'Invalid request type', status: 400 });
    }

    if (!vehicle_brand || !vehicle_model || !plate_number) {
      return createErrorResponse({ errorMessage: 'Vehicle brand, model and plate number are required', status: 400 });
    }

    const adminToken = await generateAdminUserToken();
    const driversCrud = new CrudOperations('drivers', adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });

    if (!drivers || drivers.length === 0) {
      return createErrorResponse({ errorMessage: 'Driver not found', status: 404 });
    }

    const driver = drivers[0];

    // إنشاء طلب موافقة لإضافة مركبة
    const approvalRequestsCrud = new CrudOperations('approval_requests', adminToken);
    const newRequest = await approvalRequestsCrud.create({
      request_type: 'create',
      entity_type: 'vehicle',
      entity_id: driver.company_id,
      requested_by_user_id: user_id,
      distributor_id: null,
      request_data: JSON.stringify({
        company_id: driver.company_id,
        brand: vehicle_brand,
        model: vehicle_model,
        plate_number: plate_number,
        vin: vin || null,
        status: 'active',
        documents: [],
        requested_by_driver_id: driver.id,
      }),
      request_reason: `طلب إضافة مركبة جديدة من السائق ${driver.full_name}`,
      status: 'pending',
    });

    return createSuccessResponse({ message: 'Vehicle addition request submitted successfully', request_id: newRequest.id }, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || 'Failed to submit vehicle request',
      status: 500,
    });
  }
}, true);
