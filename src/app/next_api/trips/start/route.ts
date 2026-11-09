import CrudOperations from '@/lib/crud-operations';
import {createSuccessResponse, createErrorResponse} from '@/lib/create-response';
import {requestMiddleware, validateRequestBody} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createHash} from 'node:crypto';
import {createPostgrestClient} from '@/lib/postgrest';
import {ChironService} from '@/lib/chiron-service';
import {canonicalChironEnvironment} from '@/lib/chiron-protocol';
import {assertNativeTripExpectation} from '@/lib/native-trip-contract';
import {departureTime, tripRequestKey} from '@/lib/trip-times';
import {syncTripDeparture} from '@/lib/chiron-retry';

export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const userId = Number(context.payload?.sub);
  const {completion_request_key: key, start_lat, start_lon, start_address, ride_type, external_source, external_ride_number, agreed_price} = body;
  const startTime = departureTime(body.start_time);
  if (!Number.isSafeInteger(userId) || userId<=0 || !tripRequestKey(key) || !startTime ||
      typeof start_lat !== 'number' || !Number.isFinite(start_lat) || Math.abs(start_lat) > 90 ||
      typeof start_lon !== 'number' || !Number.isFinite(start_lon) || Math.abs(start_lon) > 180 ||
      typeof start_address !== 'string' || start_address.length > 500 ||
      !['INTERNAL','EXTERNAL'].includes(ride_type) ||
      (ride_type === 'EXTERNAL' && !['UBER','BOLT','HEETCH'].includes(external_source)) ||
      (external_ride_number != null && (typeof external_ride_number !== 'string' || external_ride_number.length > 100)) ||
      (agreed_price != null && (typeof agreed_price !== 'number' || !Number.isFinite(agreed_price) || agreed_price <= 0 || agreed_price > 100000))) {
    return createErrorResponse({status:400,errorMessage:'Invalid departure data'});
  }

  const token = await generateAdminUserToken();
  const [driver] = await new CrudOperations('drivers',token).findMany({user_id:userId});
  if (!driver || driver.status !== 'active') return createErrorResponse({status:403,errorMessage:'Driver inactive'});
  const [existing] = await new CrudOperations('trips',token).findMany({user_id:userId,completion_request_key:key});
  if (existing) {
    try {
      assertNativeTripExpectation(body, Number(existing.company_id), Number(existing.vehicle_id), existing.chiron_environment);
      if (!existing.chiron_realtime || String(existing.driver_id) !== String(driver.id) ||
          String(existing.company_id) !== String(driver.company_id) || Date.parse(existing.start_time) !== Date.parse(startTime) ||
          Number(existing.start_lat) !== start_lat || Number(existing.start_lon) !== start_lon ||
          existing.ride_type !== ride_type || existing.external_source !== (ride_type === 'EXTERNAL' ? external_source : null)) throw Error();
    } catch {return createErrorResponse({status:409,errorMessage:'Departure conflicts with a stored trip'});}
    return createSuccessResponse(await syncTripDeparture(existing,token));
  }
  const vehicleId = driver.current_vehicle_id ?? driver.assigned_vehicle_id;
  const vehicle = vehicleId ? await new CrudOperations('vehicles',token).findById(vehicleId) : null;
  if (!vehicle || vehicle.status !== 'active' || String(vehicle.company_id) !== String(driver.company_id)) {
    return createErrorResponse({status:403,errorMessage:'No authorized vehicle'});
  }
  const company = await ChironService.getCompanyConfig(driver.company_id);
  let environment;
  try {
    environment = canonicalChironEnvironment(company.chiron_mode);
    assertNativeTripExpectation(body, Number(driver.company_id), Number(vehicle.id), environment);
  } catch {
    return createErrorResponse({status:409,errorMessage:'Trip assignment or Chiron environment changed'});
  }

  const years = Number(process.env.TRIP_RETENTION_YEARS);
  const retention = new Date(startTime);
  const retain = Number.isInteger(years) && years >= 1 && years <= 20;
  if (retain) retention.setUTCFullYear(retention.getUTCFullYear() + years);
  const source = ride_type === 'EXTERNAL' ? external_source : null;
  const saved = await createPostgrestClient(token).rpc('security_save_trip_departure',{
    p_user_id:userId, p_key:key, p_payload:{
      company_id:driver.company_id, driver_id:driver.id, vehicle_id:vehicle.id,
      trip_uuid:key, ritnummer:`${source ?? 'TRIP'}-${key.toLowerCase()}`, start_time:startTime,
      start_lat, start_lon, start_address:start_address || null, ride_type,
      external_source:source, external_ride_number:source ? external_ride_number?.trim() || null : null,
      chiron_agreed_price:agreed_price ?? null, chiron_environment:environment,
      chiron_sync_state:'CREATED', chiron_sync_attempts:0, locked_after_completion:false,
      trip_hash:createHash('sha256').update(JSON.stringify({key,userId,driver:driver.id,vehicle:vehicle.id,startTime,start_lat,start_lon})).digest('hex'),
      record_retention_until:retain ? retention.toISOString().slice(0,10) : null,
    },
  });
  if (saved.data?.conflict || saved.error?.code==='23505') return createErrorResponse({status:409,errorMessage:'Departure conflicts with a stored trip'});
  if (saved.error || !saved.data?.trip) throw new Error('Trip departure storage unavailable');
  const trip = await syncTripDeparture(saved.data.trip,token);
  return createSuccessResponse(trip, saved.data.created ? 201 : 200);
});
