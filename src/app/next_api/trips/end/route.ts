
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { ChironService } from '@/lib/chiron-service';
import { generateAdminUserToken } from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import { createHash, randomUUID } from 'crypto';
import { completedTripTimes, tripRequestKey } from '@/lib/trip-times';
import { canonicalChironEnvironment } from '@/lib/chiron-protocol';
import {assertNativeTripExpectation} from '@/lib/native-trip-contract';

import {tripDelivery, syncTripEvent} from '@/lib/chiron-retry';
import {readTariffQuote} from "@/lib/tariff-quote";

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
  if (!tripRequestKey(body.completion_request_key)) return createErrorResponse({errorMessage:'Trip completion key required',status:400});

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
    const [departure] = await new CrudOperations('trips', adminToken).findMany({user_id: Number(user_id), completion_request_key: body.completion_request_key});
    if (departure?.status === 'completed') return createSuccessResponse({...departure,chiron_delivery:departure.chiron_realtime?tripDelivery(departure):'review',replayed:true}, 200);
    if ((body.chiron_realtime === true || departure) && !departure?.chiron_realtime) {
      return createErrorResponse({status:409,errorMessage:'Save the original departure before completing this trip'});
    }

    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });

    if (!drivers || drivers.length === 0) {
      return createErrorResponse({ errorMessage: "لم يتم العثور على معلومات السائق", status: 404 });
    }

    const driver = drivers[0];
    if (driver.status !== 'active') return createErrorResponse({errorMessage:'Driver inactive',status:403});
    const company = await ChironService.getCompanyConfig(driver.company_id);

    if (departure && (String(departure.driver_id) !== String(driver.id) || String(departure.company_id) !== String(driver.company_id))) {
      return createErrorResponse({status:409,errorMessage:'Original driver or company changed'});
    }
    let vehicle: any = null;
    if (departure) {
      vehicle = await new CrudOperations("vehicles", adminToken).findById(departure.vehicle_id);
    } else if (driver.current_vehicle_id) {
      const vehiclesCrud = new CrudOperations("vehicles", adminToken);
      vehicle = await vehiclesCrud.findById(driver.current_vehicle_id);
    }
    if (!vehicle && !departure) {
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

    if (!vehicle || (!departure && vehicle.status !== 'active') || String(vehicle.company_id) !== String(driver.company_id)) return createErrorResponse({errorMessage:'Vehicle not permitted',status:403});
    try {assertNativeTripExpectation(body, Number(driver.company_id), Number(vehicle.id), departure?.chiron_environment ?? company.chiron_mode);}
    catch {return createErrorResponse({errorMessage:'تغيرت الشركة أو المركبة أو بيئة الإرسال منذ بدء الرحلة. تبقى الرحلة محفوظة على الهاتف.',status:409});}
    const actualDuration = duration_minutes || 0;
    const { endTime } = eventTimes;
    const startTime = departure ? new Date(departure.start_time) : eventTimes.startTime;
    if (departure && (eventTimes.startTime.getTime() !== startTime.getTime() || endTime <= startTime
      || ride_type !== departure.ride_type || (external_source ?? null) !== departure.external_source
      || end_lat == null || end_lon == null || distance_km == null)) {
      return createErrorResponse({status:409,errorMessage:'Arrival does not match the original departure'});
    }

    const trip_uuid = departure?.trip_uuid ?? generateTripUuid();
    const ritnummer = departure?.ritnummer ?? (ride_type === 'EXTERNAL' && external_ride_number?.trim()
      ? `${external_source.toUpperCase()}-${external_ride_number.trim()}`.slice(0,100)
      : `${ride_type === 'EXTERNAL' ? external_source.toUpperCase().slice(0,20) : 'TRIP'}-${trip_uuid}`);

    const finalEndLat = end_lat ?? start_lat;
    const finalEndLon = end_lon ?? start_lon;

    if (finalEndLat == null || finalEndLon == null) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على إحداثيات الموقع. يرجى التأكد من تفعيل GPS.",
        status: 400,
      });
    }

    const tripData: Record<string, any> = {
      user_id: parseInt(user_id),
      company_id: driver.company_id,
      driver_id: driver.id,
      vehicle_id: vehicle.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      start_lat: departure?.start_lat ?? start_lat ?? finalEndLat,
      start_lon: departure?.start_lon ?? start_lon ?? finalEndLon,
      end_lat: finalEndLat,
      end_lon: finalEndLon,
      start_address: departure?.start_address ?? (start_address || null),
      end_address: end_address || null,
      distance_km: distance_km != null ? parseFloat(distance_km.toFixed(3)) : null,
      duration_minutes: actualDuration,
      price: parseFloat(price.toFixed(2)),
      status: 'completed',
      ritnummer,
      trip_uuid,
      chiron_environment: canonicalChironEnvironment(departure?.chiron_environment ?? company.chiron_mode),
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
      tripData.actual_duration_minutes = actualDuration;
    }

    if (body.tariff_quote != null) {
      try {
        if (ride_type !== 'INTERNAL') throw Error('Unexpected tariff');
        const quote=readTariffQuote(body.tariff_quote,user_id,String(driver.company_id),startTime.getTime(),process.env.JWT_SECRET||'');
        Object.assign(tripData,{tariff_code:quote.tariff.code,tariff_settings_snapshot:quote.tariff,
          estimated_distance_km:quote.km,estimated_duration_min:quote.minutes,
          initial_proposed_price:quote.price,driver_adjusted_price:tripData.price===quote.price?null:tripData.price});
      } catch {return createErrorResponse({status:400,errorMessage:'Invalid trip tariff quote'});}
    }

    // Generate immutability hash after all fields are set
    tripData.trip_hash = generateTripHash(tripData);

    const saved = await createPostgrestClient(adminToken).rpc(
      departure ? 'security_finish_realtime_trip' : 'security_save_completed_trip',
      {p_payload:tripData,p_user_id:Number(user_id),p_key:body.completion_request_key},
    );
    if (saved.data?.conflict) return createErrorResponse({status:409,errorMessage:'Trip completion conflicts with its departure'});
    if (saved.error || !saved.data?.trip) throw new Error('Atomic trip storage unavailable');
    const trip = saved.data.trip;
    if (!saved.data.created) return createSuccessResponse({...trip,chiron_delivery:trip.chiron_realtime?tripDelivery(trip):'review',replayed:true},200);
    if (!departure) {
      return createSuccessResponse({...trip,chiron_delivery:'review',warning:'تم حفظ الرحلة للمراجعة. لم يُسجّل انطلاقها عبر مسار Chiron اللحظي.'},201);
    }
    return createSuccessResponse(await syncTripEvent(trip, adminToken, 'aankomst'), 201);

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء الرحلة",
      status: 500,
    });
  }
}, true);
