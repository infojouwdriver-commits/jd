
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { ChironService } from '@/lib/chiron-service';
import { generateAdminUserToken } from '@/lib/auth';

// POST - Retry syncing a failed trip
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
    
    const trip = await tripsCrud.findById(id);
    
    if (!trip) {
      return createErrorResponse({
        errorMessage: "الرحلة غير موجودة",
        status: 404,
      });
    }

    if (trip.status === 'success') {
      return createErrorResponse({
        errorMessage: "الرحلة تمت مزامنتها بالفعل",
        status: 400,
      });
    }

    const attemptNumber = (trip.chiron_sync_attempts || 0) + 1;

    try {
      // Attempt sync
      const syncResult = await ChironService.sendTrip(trip.company_id, {
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

      // Update trip on success
      await tripsCrud.update(trip.id, {
        status: 'success',
        chiron_trip_id: syncResult.tripId,
        chiron_sync_attempts: attemptNumber,
        last_sync_attempt: new Date().toISOString(),
        sync_error_message: null
      });

      // Log success
      await ChironService.logSyncAttempt(
        trip.id,
        attemptNumber,
        'success',
        { driver_id: trip.driver_id, vehicle_id: trip.vehicle_id },
        { tripId: syncResult.tripId },
        undefined,
        200
      );

      return createSuccessResponse({
        success: true,
        tripId: syncResult.tripId
      });

    } catch (syncError: any) {
      // Update attempt count on failure
      await tripsCrud.update(trip.id, {
        status: 'failed',
        chiron_sync_attempts: attemptNumber,
        last_sync_attempt: new Date().toISOString(),
        sync_error_message: syncError.message
      });

      // Log failure
      await ChironService.logSyncAttempt(
        trip.id,
        attemptNumber,
        'failed',
        { driver_id: trip.driver_id, vehicle_id: trip.vehicle_id },
        undefined,
        syncError.message || 'Unknown error',
        undefined
      );

      return createErrorResponse({
        errorMessage: syncError.message || 'فشلت المزامنة',
        status: 500,
      });
    }
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إعادة المحاولة",
      status: 500,
    });
  }
}, true);
