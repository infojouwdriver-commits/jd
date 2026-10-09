
import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateAdminUserToken } from '@/lib/auth';
import CrudOperations from '@/lib/crud-operations';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registrationSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(8),
  company_address: z.string().min(5),
  company_name: z.string().min(2),
  vat_number: z.string().min(10),
  kbo_number: z.string().min(8),
  company_email: z.string().email().optional(),
  company_phone: z.string().optional(),
  // Chiron optional fields
  chiron_test_client_id: z.string().optional(),
  chiron_test_client_secret: z.string().optional(),
  // Vehicle
  vehicle_brand: z.string().min(2),
  vehicle_model: z.string().min(1),
  plate_number: z.string().min(3),
  vin: z.string().optional(),
  chiron_vehicle_id: z.string().optional(),
  driver_license: z.string().min(3),
  tva_number: z.string().optional(),
  bestuurderspas: z.string().optional(),
  user_id: z.union([z.number(), z.string().transform((v) => parseInt(v, 10))]).refine(
    (v) => !isNaN(v) && v > 0,
    { message: 'user_id must be a valid positive number' }
  ),
  preferred_language: z.enum(['nl', 'fr', 'en', 'ar']).default('fr'),
});

export const POST = requestMiddleware(async (request: NextRequest, context) => {
  try {
    const body = await validateRequestBody(request);

    if (body.user_id !== undefined && body.user_id !== null) {
      body.user_id = typeof body.user_id === 'string' ? parseInt(body.user_id, 10) : body.user_id;
    }

    const data = registrationSchema.parse(body);
    const adminToken = await generateAdminUserToken();

    // ── 1. Create or find company ──────────────────────────────────────────
    const companiesCrud = new CrudOperations('companies', adminToken);
    let company;

    const existingByVat = await companiesCrud.findMany({ vat_number: data.vat_number });
    if (existingByVat && existingByVat.length > 0) {
      company = existingByVat[0];
    } else {
      // Build company data — include Chiron credentials if provided
      const companyData: Record<string, any> = {
        name: data.company_name,
        vat_number: data.vat_number,
        kbo_number: data.kbo_number.replace(/\./g, ''),
        address: data.company_address,
        email: data.company_email || null,
        phone: data.company_phone || null,
        chiron_mode: 'TEST',
        bank_account_iban: 'BE16973450355674',
        bank_account_bic: 'ARSPBE22',
        bank_account_holder: data.company_name,
      };

      // Auto-save Chiron test credentials if provided during registration
      if (data.chiron_test_client_id) {
        companyData.chiron_test_client_id = data.chiron_test_client_id;
      }
      if (data.chiron_test_client_secret) {
        companyData.chiron_test_client_secret = data.chiron_test_client_secret;
      }

      company = await companiesCrud.create(companyData);
    }

    // If company already existed but Chiron credentials were provided, update them
    if (existingByVat && existingByVat.length > 0) {
      const chironUpdate: Record<string, any> = {};
      if (data.chiron_test_client_id) {
        chironUpdate.chiron_test_client_id = data.chiron_test_client_id;
      }
      if (data.chiron_test_client_secret) {
        chironUpdate.chiron_test_client_secret = data.chiron_test_client_secret;
      }
      if (Object.keys(chironUpdate).length > 0) {
        await companiesCrud.update(company.id, chironUpdate);
      }
    }

    // ── 2. Create or update driver record ─────────────────────────────────
    const driversCrud = new CrudOperations('drivers', adminToken);
    const existingDrivers = await driversCrud.findMany({ user_id: data.user_id });

    let driver;
    if (existingDrivers && existingDrivers.length > 0) {
      driver = await driversCrud.update(existingDrivers[0].id, {
        full_name: data.full_name,
        phone: data.phone,
        driver_license: data.driver_license,
        bestuurderspas_number: data.bestuurderspas || null,
        company_id: company.id,
        preferred_language: data.preferred_language,
        registration_status: 'pending',
        registration_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      driver = await driversCrud.create({
        user_id: data.user_id,
        company_id: company.id,
        full_name: data.full_name,
        phone: data.phone,
        driver_license: data.driver_license,
        bestuurderspas_number: data.bestuurderspas || null,
        preferred_language: data.preferred_language,
        registration_status: 'pending',
        registration_submitted_at: new Date().toISOString(),
        status: 'inactive',
      });
    }

    // ── 3. Create vehicle ──────────────────────────────────────────────────
    const vehiclesCrud = new CrudOperations('vehicles', adminToken);
    let vehicle;
    const existingVehicles = await vehiclesCrud.findMany({ plate_number: data.plate_number });
    if (existingVehicles && existingVehicles.length > 0) {
      vehicle = existingVehicles[0];
    } else {
      vehicle = await vehiclesCrud.create({
        company_id: company.id,
        brand: data.vehicle_brand,
        model: data.vehicle_model,
        plate_number: data.plate_number,
        vin: data.vin || null,
        chiron_vehicle_id: data.chiron_vehicle_id || null,
        status: 'active',
        documents: [],
      });
    }

    // ── 4. Link vehicle to driver ──────────────────────────────────────────
    await driversCrud.update(driver.id, {
      assigned_vehicle_id: vehicle.id,
    });

    // ── 5. Create driver_credentials ──────────────────────────────────────
    const credentialsCrud = new CrudOperations('driver_credentials', adminToken);
    const existingCreds = await credentialsCrud.findMany({ driver_id: driver.id });

    const tempPassword = data.phone.replace(/\s+/g, '').replace(/\+/g, '');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    if (!existingCreds || existingCreds.length === 0) {
      await credentialsCrud.create({
        driver_id: driver.id,
        phone: data.phone.replace(/\s+/g, ''),
        password_hash: passwordHash,
        is_active: false,
        vehicle_id: vehicle.id,
        company_id: company.id,
        preferred_language: data.preferred_language,
      });
    } else {
      await credentialsCrud.update(existingCreds[0].id, {
        phone: data.phone.replace(/\s+/g, ''),
        vehicle_id: vehicle.id,
        company_id: company.id,
        preferred_language: data.preferred_language,
        updated_at: new Date().toISOString(),
      });
    }

    // ── 6. Create registration request ────────────────────────────────────
    const regRequestsCrud = new CrudOperations('driver_registration_requests', adminToken);
    const regRequest = await regRequestsCrud.create({
      company_id: company.id,
      driver_id: driver.id,
      vehicle_id: vehicle.id,
      full_name: data.full_name,
      phone: data.phone,
      email: null,
      company_address: data.company_address,
      vehicle_brand: data.vehicle_brand,
      vehicle_model: data.vehicle_model,
      vehicle_vin: data.vin || null,
      vehicle_plate_number: data.plate_number,
      tva_number: data.tva_number || null,
      driver_license_number: data.driver_license,
      bestuurderspas_number: data.bestuurderspas || null,
      status: 'pending',
      payment_status: 'pending',
      preferred_language: data.preferred_language,
      submitted_at: new Date().toISOString(),
    });

    return createSuccessResponse({
      driver_id: driver.id,
      company_id: company.id,
      vehicle_id: vehicle.id,
      registration_request_id: regRequest.id,
      chiron_configured: !!(data.chiron_test_client_id && data.chiron_test_client_secret),
      message: 'Registration submitted successfully. Awaiting admin approval.',
    }, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Operation failed");
      return createErrorResponse({
        errorMessage: error.errors[0]?.message || 'Validation failed',
        status: 400,
      });
    }
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || 'Registration failed',
      status: 500,
    });
  }
}, true);

// GET - Fetch registration status for current driver
export const GET = requestMiddleware(async (request: NextRequest, context) => {
  try {
    const adminToken = await generateAdminUserToken();
    const user_id = context.payload?.sub;

    const driversCrud = new CrudOperations('drivers', adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id || '0') });

    if (!drivers || drivers.length === 0) {
      return createSuccessResponse({ status: 'not_started' });
    }

    const driver = drivers[0];
    const regRequestsCrud = new CrudOperations('driver_registration_requests', adminToken);
    const requests = await regRequestsCrud.findMany({ driver_id: driver.id });

    if (!requests || requests.length === 0) {
      return createSuccessResponse({ status: 'not_started', driver });
    }

    return createSuccessResponse({
      status: requests[0].status,
      registration_request: requests[0],
      driver,
    });
  } catch (error: any) {
    return createErrorResponse({
      errorMessage: error.message || 'Failed to fetch registration status',
      status: 500,
    });
  }
}, true);
