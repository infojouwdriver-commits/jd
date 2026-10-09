
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { ChironService } from '@/lib/chiron-service';

// POST - Sync a trip to Chiron
export const POST = requestMiddleware(async (request, context) => {
  const { trip_id } = parseQueryParams(request);

  if (!trip_id) {
    return createErrorResponse({
      errorMessage: "معرف الرحلة مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    
    // Get trip details
    const tripsCrud = new CrudOperations("trips", adminToken);
    const trip = await tripsCrud.findById(trip_id);

    if (!trip) {
      return createErrorResponse({
        errorMessage: "الرحلة غير موجودة",
        status: 404,
      });
    }

    // Check if trip is already synced
    if (trip.status === 'success' && trip.chiron_trip_id) {
      return createSuccessResponse({
        message: "الرحلة مزامنة بالفعل",
        chiron_trip_id: trip.chiron_trip_id,
      });
    }

    // Check if trip is completed
    if (trip.status !== 'completed') {
      return createErrorResponse({
        errorMessage: "لا يمكن مزامنة رحلة غير مكتملة",
        status: 400,
      });
    }

    const attemptNumber = (trip.chiron_sync_attempts || 0) + 1;

    try {
      // Submit trip to Chiron using ChironService
      const chironResponse = await ChironService.sendTrip(trip.company_id, {
        driver_id: trip.driver_id,
        vehicle_id: trip.vehicle_id,
        start_time: trip.start_time,
        end_time: trip.end_time,
        start_lat: parseFloat(trip.start_lat),
        start_lon: parseFloat(trip.start_lon),
        end_lat: parseFloat(trip.end_lat),
        end_lon: parseFloat(trip.end_lon),
        distance_km: parseFloat(trip.distance_km),
        price: parseFloat(trip.price),
      });

      // Update trip with Chiron ID
      await tripsCrud.update(trip_id, {
        status: 'success',
        chiron_trip_id: chironResponse.tripId,
        chiron_sync_attempts: attemptNumber,
        last_sync_attempt: new Date().toISOString(),
        sync_error_message: null,
      });

      // Log sync attempt
      await ChironService.logSyncAttempt(
        parseInt(trip_id),
        attemptNumber,
        'success',
        {
          driver_id: trip.driver_id,
          vehicle_id: trip.vehicle_id,
          start_time: trip.start_time,
          end_time: trip.end_time,
          distance_km: trip.distance_km,
          price: trip.price,
        },
        chironResponse,
        undefined,
        200
      );

      return createSuccessResponse({
        success: true,
        chiron_trip_id: chironResponse.tripId,
        message: "تمت المزامنة بنجاح",
      });

    } catch (error: any) {
      // Update trip with error
      await tripsCrud.update(trip_id, {
        status: 'failed',
        chiron_sync_attempts: attemptNumber,
        last_sync_attempt: new Date().toISOString(),
        sync_error_message: error.message,
      });

      // Log sync attempt
      await ChironService.logSyncAttempt(
        parseInt(trip_id),
        attemptNumber,
        'failed',
        {
          driver_id: trip.driver_id,
          vehicle_id: trip.vehicle_id,
          start_time: trip.start_time,
          end_time: trip.end_time,
          distance_km: trip.distance_km,
          price: trip.price,
        },
        undefined,
        error.message,
        error.status || 500
      );

      return createErrorResponse({
        errorMessage: error.message || "فشلت المزامنة",
        status: 500,
      });
    }

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشلت المزامنة",
      status: 500,
    });
  }
}, true);
