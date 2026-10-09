
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import { generateAdminUserToken } from "@/lib/auth";
import CrudOperations from "@/lib/crud-operations";

const NOTIFICATION_EMAIL = "ezetdin@gmail.com";

function getStatusLabel(status: "proposed" | "executed" | "rejected"): string {
  if (status === "proposed") {
    return "New Action Proposed";
  }

  if (status === "executed") {
    return "Action Executed";
  }

  return "Action Rejected";
}

function getStatusColor(status: "proposed" | "executed" | "rejected"): string {
  if (status === "proposed") {
    return "#f59e0b";
  }

  if (status === "executed") {
    return "#10b981";
  }

  return "#ef4444";
}

async function sendNotificationEmail(
  actionDescription: string,
  details: any,
  status: "proposed" | "executed" | "rejected"
) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:20px;border-radius:10px;margin-bottom:20px;">
        <h2 style="color:#fff;margin:0;font-size:18px;">AI Assistant Notification</h2>
        <p style="color:#e9d5ff;margin:6px 0 0;font-size:13px;">Taximeter Platform - Smart Assistant</p>
      </div>
      <div style="background:#fff;padding:20px;border-radius:10px;border-left:4px solid ${getStatusColor(status)};margin-bottom:16px;">
        <h3 style="color:${getStatusColor(status)};margin:0 0 8px;">${getStatusLabel(status)}</h3>
        <p style="color:#374151;font-size:14px;margin:0;"><strong>Action:</strong> ${actionDescription}</p>
      </div>
      <div style="background:#fff;padding:16px;border-radius:10px;margin-bottom:16px;">
        <h4 style="color:#6b7280;font-size:12px;text-transform:uppercase;margin:0 0 10px;">Details</h4>
        <pre style="background:#f3f4f6;padding:12px;border-radius:8px;overflow:auto;font-size:12px;color:#1f2937;">${JSON.stringify(details, null, 2)}</pre>
      </div>
      <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;">Sent at: ${new Date().toLocaleString("en-GB", { timeZone: "Europe/Brussels" })}</p>
    </div>
  `;

  const url = `${process.env.NEXT_PUBLIC_ZOER_HOST}/zapi/app/email/send`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Postgrest-API-Key": process.env.POSTGREST_API_KEY || "",
      },
      body: JSON.stringify({
        to: NOTIFICATION_EMAIL,
        subject: `[AI Assistant] ${getStatusLabel(status)}: ${actionDescription}`,
        html,
      }),
    });
  } catch (error) {
    console.error("Operation failed");
  }
}

function sanitizeChanges(changes: Record<string, any>): Record<string, any> {
  const internalKeys = ["_admin_note", "_note", "_internal"];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(changes || {})) {
    if (!internalKeys.includes(key)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

async function handleExecuteAction(body: any, adminToken: string): Promise<Response> {
  const actionId = body?.action_id;

  if (!actionId) {
    return createErrorResponse({
      errorMessage: "action_id is required",
      status: 400,
    });
  }

  const actionsCrud = new CrudOperations("ai_assistant_actions", adminToken);
  const actionRecord = await actionsCrud.findById(actionId);

  if (!actionRecord?.id) {
    return createErrorResponse({
      errorMessage: "Action not found",
      status: 404,
    });
  }

  if (actionRecord?.status !== "pending") {
    return createErrorResponse({
      errorMessage: `Action is already in '${actionRecord?.status}' state`,
      status: 400,
    });
  }

  const targetTable = actionRecord?.target_table;
  const targetRecordId = actionRecord?.target_record_id;
  const proposedChanges = actionRecord?.proposed_changes || {};
  const cleanChanges = sanitizeChanges(proposedChanges);
  const executedAt = new Date().toISOString();

  try {
    if (targetTable && targetRecordId && Object.keys(cleanChanges).length > 0) {
      const targetCrud = new CrudOperations(targetTable, adminToken);
      await targetCrud.update(targetRecordId, cleanChanges);
    }

    await actionsCrud.update(actionId, {
      status: "executed",
      confirmed_at: executedAt,
      executed_at: executedAt,
      email_sent: true,
      email_sent_at: executedAt,
      execution_details: {
        executed_at: executedAt,
        target_table: targetTable,
        target_record_id: targetRecordId,
        applied_changes: cleanChanges,
      },
    });

    void sendNotificationEmail(
      actionRecord?.action_description,
      {
        action_id: actionId,
        target_table: targetTable,
        target_record_id: targetRecordId,
        proposed_changes: proposedChanges,
        executed_at: executedAt,
      },
      "executed"
    );

    return createSuccessResponse({
      executed: true,
      action_id: actionId,
    });
  } catch (error: any) {
    console.error("Operation failed");

    try {
      await actionsCrud.update(actionId, {
        status: "failed",
        execution_error: error?.message || "Unknown error",
        execution_details: {
          error: error?.message || "Unknown error",
          failed_at: new Date().toISOString(),
        },
      });
    } catch (updateError) {
      console.error("Operation failed");
    }

    return createErrorResponse({
      errorMessage: `Execution failed: ${error?.message || "Unknown error"}`,
      status: 500,
    });
  }
}

async function handleRejectAction(body: any, adminToken: string): Promise<Response> {
  const actionId = body?.action_id;
  const reason = body?.reason || "User rejected from chat";

  if (!actionId) {
    return createErrorResponse({
      errorMessage: "action_id is required",
      status: 400,
    });
  }

  const actionsCrud = new CrudOperations("ai_assistant_actions", adminToken);
  const actionRecord = await actionsCrud.findById(actionId);

  await actionsCrud.update(actionId, {
    status: "rejected",
    rejected_at: new Date().toISOString(),
    rejection_reason: reason,
  });

  if (actionRecord?.id) {
    void sendNotificationEmail(
      actionRecord?.action_description,
      {
        action_id: actionId,
        reason,
        rejected_at: new Date().toISOString(),
      },
      "rejected"
    );
  }

  return createSuccessResponse({ rejected: true });
}

function getSafeActionType(actionType: string): string {
  const validActionTypes = [
    "update_trip",
    "update_driver",
    "update_vehicle",
    "update_company",
    "cancel_trip",
    "change_trip_status",
    "update_payment",
    "other",
  ];

  return validActionTypes.includes(actionType) ? actionType : "other";
}

async function handleProposeAction(body: any, adminToken: string): Promise<Response> {
  const actionsCrud = new CrudOperations("ai_assistant_actions", adminToken);
  const safeActionType = getSafeActionType(body?.action_type);

  const newAction = await actionsCrud.create({
    conversation_id: body?.conversation_id || 0,
    user_id: body?.user_id || 0,
    action_type: safeActionType,
    action_description: body?.action_description,
    target_table: body?.target_table || null,
    target_record_id: body?.target_record_id || null,
    before_data: body?.before_data || {},
    proposed_changes: body?.proposed_changes || {},
    status: "pending",
    notification_email: NOTIFICATION_EMAIL,
  });

  void sendNotificationEmail(
    body?.action_description,
    {
      action_id: newAction?.id,
      action_type: safeActionType,
      target_table: body?.target_table,
      target_record_id: body?.target_record_id,
      proposed_changes: body?.proposed_changes,
      status: "pending - awaiting user confirmation",
    },
    "proposed"
  )
    .then(async () => {
      await actionsCrud.update(newAction?.id, {
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      });
    })
    .catch((error) => {
      console.error("Operation failed");
    });

  return createSuccessResponse(newAction);
}

export const POST = requestMiddleware(async (request) => {
  const body = await validateRequestBody(request);
  const adminToken = await generateAdminUserToken();
  const action = body?.action;

  if (action === "execute_action") {
    return handleExecuteAction(body, adminToken);
  }

  if (action === "reject_action") {
    return handleRejectAction(body, adminToken);
  }

  if (action === "propose_action") {
    return handleProposeAction(body, adminToken);
  }

  return createErrorResponse({
    errorMessage: "Invalid action type",
    status: 400,
  });
}, false);
