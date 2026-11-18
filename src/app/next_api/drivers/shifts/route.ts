import QRCode from "qrcode";
import {shiftReference,shiftDocumentUrl} from "@/lib/shift-document";
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/create-response";
import { generateAdminUserToken } from "@/lib/auth";
import { createPostgrestClient } from "@/lib/postgrest";
import { shiftStatusChange, shiftDeclaration } from "@/lib/driver-shifts";
function failure(code?: string) {
  const status =
    code === "42501"
      ? 403
      : ["40001", "23505"].includes(code || "")
        ? 409
        : code === "22023"
          ? 400
          : 503;
  return createErrorResponse({
    status,
    errorMessage:
      status === 409
        ? "Shift changed or vehicle already in use. Refresh before retrying."
        : status === 400
          ? "Check the odometer and passenger distance."
          : status === 403
            ? "Shift unavailable"
            : "Shift service unavailable",
    errorCode:
      status === 409
        ? "SHIFT_CONFLICT"
        : status === 400
          ? "SHIFT_READINGS"
          : "SHIFT_UNAVAILABLE",
  });
}
export const GET = requestMiddleware(async (request, context) => {
  const userId = Number(context.payload?.sub);
  if (!Number.isSafeInteger(userId) || userId < 1) return failure("42501");
  const params = request.nextUrl.searchParams;
  if (params.get("startReading") === "1") {
    const client = createPostgrestClient(await generateAdminUserToken());
    const { data: driver, error: driverError } = await client
      .from("drivers")
      .select("company_id,current_vehicle_id,assigned_vehicle_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (driverError) return failure(driverError.code);
    if (!driver) return failure("42501");
    const vehicleId = driver.current_vehicle_id ?? driver.assigned_vehicle_id;
    if (!vehicleId) return createSuccessResponse(null);

    const { data: vehicle, error: vehicleError } = await client
      .from("vehicles")
      .select("plate_number")
      .eq("id", vehicleId)
      .eq("company_id", driver.company_id)
      .eq("status", "active")
      .maybeSingle();
    if (vehicleError) return failure(vehicleError.code);
    if (!vehicle) return createSuccessResponse(null);

    const { data: previous, error: historyError } = await client
      .from("driver_shifts")
      .select("odometer")
      .eq("user_id", userId)
      .eq("company_id", driver.company_id)
      .eq("vehicle_id", vehicleId)
      .not("ended_at", "is", null)
      .order("ended_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (historyError) return failure(historyError.code);
    return createSuccessResponse({ plate: vehicle.plate_number, odometer: previous?.odometer ?? null });
  }
  const id = params.get("id");
  const offset = Number(params.get("offset") || 0);
  if (
    (id &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )) ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 100000
  )
    return failure("22023");
  const { data, error } = await createPostgrestClient(
    await generateAdminUserToken(),
  ).rpc("security_driver_shifts", {
    p_user_id: userId,
    p_shift_id: id,
    p_offset: offset,
  });
  if(error)return failure(error.code);
  if(id && data?.shift?.id?.toLowerCase()===id.toLowerCase()) {
    const url=shiftDocumentUrl(data.shift.id), qr=QRCode.create(url,{errorCorrectionLevel:'M'});
    return createSuccessResponse({...data,document:{reference:shiftReference(data.shift.id),url,qr:{size:qr.modules.size,modules:Array.from(qr.modules.data)}}});
  }
  return createSuccessResponse(data);
}, true);
export const POST = requestMiddleware(async (request, context) => {
  const userId = Number(context.payload?.sub);
  if (!Number.isSafeInteger(userId) || userId < 1) return failure("42501");
  const body = await validateRequestBody(request);
  if (body?.action === "status") {
    const status = shiftStatusChange.safeParse(body);
    if (!status.success) return failure("22023");
    const b = status.data;
    const { data, error } = await createPostgrestClient(
      await generateAdminUserToken(),
    ).rpc("security_shift_status", {
      p_user_id: userId,
      p_request_id: b.request_id,
      p_shift_id: b.shift_id,
      p_expected_version: b.expected_version,
      p_status: b.work_status,
    });
    return error ? failure(error.code) : createSuccessResponse(data);
  }
  const parsed = shiftDeclaration.safeParse(body);
  if (!parsed.success) {
    if (body.action === "start" && !parsed.error.issues.some((issue) => issue.path[0] === "odometer")) {
      return createErrorResponse({
        status: 400,
        errorMessage: "The shift start request is invalid. Close the form and try again.",
        errorCode: "SHIFT_START_INVALID",
      });
    }
    return failure("22023");
  }
  const b = parsed.data;
  const { data, error } = await createPostgrestClient(
    await generateAdminUserToken(),
  ).rpc("security_record_driver_shift", {
    p_user_id: userId,
    p_request_id: b.request_id,
    p_shift_id: b.shift_id,
    p_action: b.action,
    p_expected_version: b.expected_version,
    p_odometer: b.odometer,
    p_passenger_km: b.passenger_km,
    p_work_status: b.work_status,
  });
  if (
    b.action === "start" &&
    error?.code === "22023" &&
    error.message === "Select an active company vehicle"
  ) {
    return createErrorResponse({
      status: 400,
      errorMessage: "Select an active company vehicle in your driver profile.",
      errorCode: "SHIFT_VEHICLE_REQUIRED",
    });
  }
  if (
    b.action === "start" &&
    error?.code === "23514" &&
    error.message === "First subscription invoice payment required before service activation"
  ) {
    return createErrorResponse({
      status: 402,
      errorMessage: "The company must settle the first subscription invoice before shifts can start.",
      errorCode: "SHIFT_SUBSCRIPTION_PAYMENT_REQUIRED",
    });
  }
  if (b.action === "start" && error?.code === "22023") return failure();
  return error ? failure(error.code) : createSuccessResponse(data);
}, true);
