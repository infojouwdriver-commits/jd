import { createErrorResponse, createSuccessResponse } from "@/lib/create-response";
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { ChironService } from "@/lib/chiron-service";

interface TestTripRequest {
  company_id?: number | string;
  driver_id?: number | string;
  vehicle_id?: number | string;
}

function parsePositiveId(value: number | string | undefined): number | null {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

export const POST = requestMiddleware(async (request) => {
  try {
    const body = await validateRequestBody(request) as TestTripRequest;
    const companyId = parsePositiveId(body?.company_id);
    const driverId = parsePositiveId(body?.driver_id);
    const vehicleId = parsePositiveId(body?.vehicle_id);

    if (!companyId || !driverId || !vehicleId) {
      return createErrorResponse({
        errorCode: "INVALID_TEST_TRIP_REQUEST",
        errorMessage: "معرف الشركة والسائق والمركبة مطلوبة ويجب أن تكون أرقاماً صحيحة.",
        status: 400,
      });
    }

    const result = await ChironService.runAcceptanceTest(
      companyId,
      driverId,
      vehicleId
    );

    const responseStatus = result.success ? 201 : 200;

    return createSuccessResponse(
      {
        message: result.success
          ? "تم إرسال رسائل الاختبار العشر إلى Chiron بنجاح."
          : "تم تنفيذ الاختبار، لكن بعض الرسائل لم تُقبل.",
        total: result.totalMessages,
        success: result.successCount,
        failed: result.failedCount,
        results: result.results,
      },
      responseStatus
    );
  } catch (error: unknown) {
    console.error("Operation failed");

    const errorMessage =
      error instanceof Error
        ? error.message
        : "فشل إرسال رحلات الاختبار إلى Chiron.";

    return createErrorResponse({
      errorCode: "CHIRON_TEST_TRIP_SEND_FAILED",
      errorMessage,
      status: 500,
    });
  }
}, true);
