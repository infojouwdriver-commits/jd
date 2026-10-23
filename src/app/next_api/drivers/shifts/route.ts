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
        : ["22023", "23514"].includes(code || "")
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
  if (!parsed.success) return failure("22023");
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
  return error ? failure(error.code) : createSuccessResponse(data);
}, true);
