import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/create-response";
import { generateAdminUserToken } from "@/lib/auth";
import { createPostgrestClient } from "@/lib/postgrest";
import { operationFailure } from "@/lib/operations-access";
import { parseWelcomeSave } from "@/lib/app-experience";
import { welcomePayload } from "../../../../driver-app/src/welcome-config";

export const GET = requestMiddleware(async () => {
  const client = createPostgrestClient(await generateAdminUserToken());
  const result = await client
    .from("app_experience_settings")
    .select("version,enabled,motion,title,subtitle,poster_data")
    .eq("id", 1)
    .single();
  if (result.error || !parseWelcomeSave(result.data))
    return createErrorResponse({
      status: 503,
      errorMessage: "Welcome configuration unavailable",
    });
  const response = createSuccessResponse(result.data);
  response.headers.set("Cache-Control", "public, max-age=60");
  return response;
}, false);
export const PUT = requestMiddleware(async (request, context) => {
  if (!context.payload?.isAdmin)
    return createErrorResponse({
      status: 403,
      errorMessage: "Admin access required",
    });
  const value = parseWelcomeSave(await validateRequestBody(request));
  if (!value)
    return createErrorResponse({
      status: 400,
      errorMessage: "Invalid welcome configuration or image",
    });
  const client = createPostgrestClient(context.token);
  const result = await client.rpc("security_save_app_experience", {
    p_actor: Number(context.payload.sub),
    p_expected: value.version,
    p_data: welcomePayload(value),
  });
  if (result.error) return operationFailure(result.error);
  const response = createSuccessResponse(result.data);
  response.headers.set("Cache-Control", "no-store");
  return response;
}, true);
