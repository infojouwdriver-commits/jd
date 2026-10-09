
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { ChironService } from '@/lib/chiron-service';
import { generateAdminUserToken } from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import { createHash, randomUUID } from 'crypto';
import { completedTripTimes } from '@/lib/trip-times';

function generateTripUuid(): string { return randomUUID(); }

function generateTripHash(data: Record<string, any>): string {
  const payload = JSON.stringify({
    trip_uuid: data.trip_uuid,
    ritnummer: data.ritnummer,
    user_id: data.user_id,
    driver_id: data.driver_id,
    vehicle_id: data.vehicle_id,
    start_time: data.start_time,
    end_time: data.end_time,
    start_lat: data.start_lat,
    start_lon: data.start_lon,
    end_lat: data.end_lat,
    end_lon: data.end_lon,
    price: data.price,
    distance_km: data.distance_km,
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
  if (typeof body.completion_request_key !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.completion_request_key)) return createErrorResponse({errorMessage:'Trip completion key required',status:400});

  const {
    start_lat,
    start_lon,
    end_lat,
    end_lon,
    start_address,
    end_address,
    distance_km,
    duration_minutes,
    price,
    passenger_name,
    estimated_distance_km,
    estimated_duration_min,
    initial_proposed_price,
    driver_adjusted_price,
    payment_method,
    ride_type,
    external_source,
    external_ride_number,
    currency,
  } = body;

  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > 100000) {
    return createErrorResponse({ errorMessage: "السعر مطلوب", status: 400 });
  }

  for (const key of ['start_lat','end_lat','start_lon','end_lon','distance_km','duration_minutes','estimated_distance_km','estimated_duration_min','initial_proposed_price','driver_adjusted_price']) {
    const value = body[key];
    if (value != null && (typeof value !== 'number' || !Number.isFinite(value) || (key.endsWith('_lat') ? Math.abs(value) > 90 : key.endsWith('_lon') ? Math.abs(value) > 180 : value < 0))) return createErrorResponse({errorMessage:'Invalid trip value',status:400});
  }
  for (const key of ['start_address','end_address','passenger_name','external_source','external_ride_number','currency','payment_method']) if (body[key] != null && (typeof body[key] !== 'string' || body[key].length > 500)) return createErrorResponse({errorMessage:'Invalid trip text',status:400});
  if (!ride_type || !['INTERNAL', 'EXTERNAL'].includes(ride_type)) {
    return createErrorResponse({ errorMessage: "نوع الرحلة غير صالح", status: 400 });
  }

  if (ride_type === 'EXTERNAL' && !external_source) {
    return createErrorResponse({ errorMessage: "مصدر الرحلة الخارجية مطلوب", status: 400 });
  }
  let eventTimes: ReturnType<typeof completedTripTimes>;
  try { eventTimes = completedTripTimes(body); }
  catch { return createErrorResponse({ errorMessage: 'Invalid original trip times', status: 400 }); }

  const user_id = context.payload?.sub;
  if (!user_id) {
    return createErrorResponse({ errorMessage: "معرف المستخدم مطلوب", status: 400 });
  }

  try {
    const adminToken = await generateAdminUserToken();

    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });

    if (!drivers || drivers.length === 0) {
      return createErrorResponse({ errorMessage: "لم يتم العثور على معلومات السائق", status: 404 });
    }

    const driver = drivers[0];
    const company = await ChironService.getCompanyConfig(driver.company_id);

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
      if (!vehicles || vehicles.length === 0) {
        return createErrorResponse({ errorMessage: "لا توجد مركبات نشطة متاحة", status: 404 });
      }
      vehicle = vehicles[0];
    }

    if (String(vehicle.company_id) !== String(driver.company_id)) return createErrorResponse({errorMessage:'Vehicle not permitted',status:403});
    const tripsCrud = new CrudOperations("trips", context.token);

    const actualDuration = duration_minutes || 0;
    const { startTime, endTime } = eventTimes;

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    let ritnummer: string;
    if (ride_type === 'EXTERNAL' && external_source) {
      const platformPrefix = external_source.toUpperCase();
      ritnummer = (external_ride_number && external_ride_number.trim() !== '')
        ? `${platformPrefix}-${external_ride_number.trim()}`
        : `${platformPrefix}-${timestamp}-${driver.id}-${randomSuffix}`;
    } else {
      ritnummer = `TRIP-${driver.company_id}-${timestamp}-${driver.id}-${randomSuffix}`;
    }

    if (!ritnummer || ritnummer.trim() === '') {
      return createErrorResponse({ errorMessage: "فشل في توليد معرف الرحلة", status: 500 });
    }

    const finalEndLat = end_lat ?? start_lat;
    const finalEndLon = end_lon ?? start_lon;

    if (finalEndLat == null || finalEndLon == null) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على إحداثيات الموقع. يرجى التأكد من تفعيل GPS.",
        status: 400,
      });
    }

    const trip_uuid = generateTripUuid();

    const tripData: Record<string, any> = {
      user_id: parseInt(user_id),
      company_id: driver.company_id,
      driver_id: driver.id,
      vehicle_id: vehicle.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      start_lat: start_lat ?? finalEndLat,
      start_lon: start_lon ?? finalEndLon,
      end_lat: finalEndLat,
      end_lon: finalEndLon,
      start_address: start_address || null,
      end_address: end_address || null,
      distance_km: distance_km ? parseFloat(distance_km.toFixed(3)) : null,
      duration_minutes: actualDuration || null,
      price: parseFloat(price.toFixed(2)),
      status: 'completed',
      ritnummer,
      trip_uuid,
      chiron_environment: company.chiron_mode,
      chiron_sync_attempts: 0,
      chiron_sync_state: 'CREATED',
      passenger_name: passenger_name || null,
      payment_method: payment_method || null,
      ride_type: ride_type.toUpperCase(),
      external_source: external_source ? external_source.toUpperCase() : null,
      external_ride_number: external_ride_number || null,
      currency: currency || 'EUR',
      locked_after_completion: true,
      record_retention_until: getRetentionDate(),
    };

    if (ride_type === 'INTERNAL') {
      tripData.estimated_distance_km = estimated_distance_km
        ? parseFloat(estimated_distance_km.toFixed(3))
        : null;
      tripData.estimated_duration_min = estimated_duration_min || null;
      tripData.initial_proposed_price = initial_proposed_price
        ? parseFloat(initial_proposed_price.toFixed(2))
        : null;
      tripData.driver_adjusted_price = driver_adjusted_price
        ? parseFloat(driver_adjusted_price.toFixed(2))
        : null;
      tripData.actual_distance_km = distance_km ? parseFloat(distance_km.toFixed(3)) : null;
      tripData.actual_duration_minutes = actualDuration || null;
    }

    // Generate immutability hash after all fields are set
    tripData.trip_hash = generateTripHash(tripData);

    const saved = await createPostgrestClient(adminToken).rpc('security_save_completed_trip',{p_payload:tripData,p_user_id:Number(user_id),p_key:body.completion_request_key});
    if (saved.error || !saved.data?.trip) throw new Error('Atomic trip storage unavailable');
    const trip = saved.data.trip;
    if (!saved.data.created) return createSuccessResponse({...trip,replayed:true},200);
    if (process.env.CHIRON_TRANSMISSION_ENABLED !== 'true') return createSuccessResponse({...trip,warning:'تم حفظ الرحلة دون إرسالها — تكامل Chiron غير مفعّل.'},201);

    void 0;

    if (!trip.ritnummer || trip.ritnummer.trim() === '') {
      return createErrorResponse({ errorMessage: "معرف الرحلة مفقود بعد الإنشاء", status: 500 });
    }

    try {
      await ChironService.sendTripStart(trip.id, driver.company_id, {
        driver_id: driver.id,
        vehicle_id: vehicle.id,
        start_time: startTime.toISOString(),
        start_lat: start_lat ?? finalEndLat,
        start_lon: start_lon ?? finalEndLon,
        ritnummer: trip.ritnummer,
        external_source: external_source ? external_source.toUpperCase() : undefined,
      });

      await ChironService.sendTripArrival(trip.id, driver.company_id, {
        driver_id: driver.id,
        vehicle_id: vehicle.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        start_lat: start_lat ?? finalEndLat,
        start_lon: start_lon ?? finalEndLon,
        end_lat: finalEndLat,
        end_lon: finalEndLon,
        distance_km: distance_km ? parseFloat(distance_km.toFixed(3)) : 0,
        price: parseFloat(price.toFixed(2)),
        ritnummer: trip.ritnummer,
        external_source: external_source ? external_source.toUpperCase() : undefined,
      });

      // Lock the trip after successful completion (immutability — Article 33)
      await tripsCrud.update(trip.id, {
        locked_after_completion: true,
        locked_at: new Date().toISOString(),
      });

      const updatedTrip = await tripsCrud.findById(trip.id);
      return createSuccessResponse({
        ...updatedTrip,
        chiron_sync_status: 'تم الإرسال بنجاح إلى Chiron',
      }, 201);

    } catch (chironError: any) {
      console.error("Operation failed");

      await tripsCrud.update(trip.id, {
        status: 'pending',
        chiron_sync_attempts: 1,
        sync_error_message: chironError.message,
        last_sync_attempt: new Date().toISOString(),
      });

      await ChironService.logSyncAttempt(
        trip.id,
        1,
        'failed',
        { ritnummer: trip.ritnummer, driver_id: driver.id, vehicle_id: vehicle.id, ride_type, external_source },
        undefined,
        chironError.message,
        500
      );

      return createSuccessResponse({
        ...trip,
        status: 'pending',
        warning: 'تم حفظ الرحلة ولكن فشل إرسالها إلى Chiron. سيتم إعادة المحاولة لاحقاً.',
      }, 201);
    }

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء الرحلة",
      status: 500,
    });
  }
}, true);
