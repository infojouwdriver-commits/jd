
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { ChironService } from '@/lib/chiron-service';
import { generateAdminUserToken } from '@/lib/auth';

// POST - إعادة محاولة مزامنة رحلة فاشلة
export const POST = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الرحلة مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations("trips", adminToken);
    
    // جلب معلومات الرحلة
    const trip = await tripsCrud.findById(id);
    if (!trip) {
      return createErrorResponse({
        errorMessage: "الرحلة غير موجودة",
        status: 404,
      });
    }

    // التحقق من أن الرحلة في حالة pending أو failed
    if (trip.status !== 'pending' && trip.status !== 'failed') {
      return createErrorResponse({
        errorMessage: "الرحلة ليست في حالة تتطلب إعادة المحاولة",
        status: 400,
      });
    }

    // محاولة إرسال الرحلة إلى Chiron
    const chironResponse = await ChironService.sendTrip(trip.company_id, {
      driver_id: trip.driver_id,
      vehicle_id: trip.vehicle_id,
      start_time: trip.start_time,
      end_time: trip.end_time,
      start_lat: trip.start_lat,
      start_lon: trip.start_lon,
      end_lat: trip.end_lat,
      end_lon: trip.end_lon,
      distance_km: trip.distance_km,
      price: trip.price
    });

    // تحديث الرحلة
    const updatedTrip = await tripsCrud.update(trip.id, {
      status: 'success',
      chiron_trip_id: chironResponse.tripId,
      chiron_sync_attempts: (trip.chiron_sync_attempts || 0) + 1,
      last_sync_attempt: new Date().toISOString(),
      sync_error_message: null
    });

    // تسجيل المحاولة الناجحة
    await ChironService.logSyncAttempt(
      trip.id,
      (trip.chiron_sync_attempts || 0) + 1,
      'success',
      {
        driver_id: trip.driver_id,
        vehicle_id: trip.vehicle_id,
        distance_km: trip.distance_km,
        price: trip.price
      },
      chironResponse,
      undefined,
      200
    );

    return createSuccessResponse(updatedTrip);

  } catch (error: any) {
    // تحديث عدد المحاولات وحفظ رسالة الخطأ
    const adminToken = await generateAdminUserToken();
    const tripsCrud = new CrudOperations("trips", adminToken);
    const trip = await tripsCrud.findById(id);
    
    if (trip) {
      await tripsCrud.update(trip.id, {
        status: 'failed',
        chiron_sync_attempts: (trip.chiron_sync_attempts || 0) + 1,
        last_sync_attempt: new Date().toISOString(),
        sync_error_message: error.message
      });

      // تسجيل المحاولة الفاشلة
      await ChironService.logSyncAttempt(
        trip.id,
        (trip.chiron_sync_attempts || 0) + 1,
        'failed',
        {
          driver_id: trip.driver_id,
          vehicle_id: trip.vehicle_id,
          distance_km: trip.distance_km,
          price: trip.price
        },
        undefined,
        error.message,
        500
      );
    }

    return createErrorResponse({
      errorMessage: `فشلت إعادة المحاولة: ${error.message}`,
      status: 500,
    });
  }
}, true);

// GET - جلب جميع الرحلات التي تحتاج إعادة محاولة
export const GET = requestMiddleware(async (request, context) => {
  const { company_id } = parseQueryParams(request);
  
  const adminToken = await generateAdminUserToken();
  const tripsCrud = new CrudOperations("trips", adminToken);
  
  const filters: Record<string, any> = {
    status: 'pending'
  };
  
  if (company_id) {
    filters.company_id = company_id;
  }
  
  const pendingTrips = await tripsCrud.findMany(filters, {
    limit: 100,
    orderBy: { column: 'created_at', direction: 'desc' }
  });
  
  return createSuccessResponse(pendingTrips);
}, true);
