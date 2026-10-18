import { requestMiddleware } from "./api-utils";
import {
  operationsAccess,
  operationFailure,
  pageRange,
} from "./operations-access";
import { createSuccessResponse, createErrorResponse } from "./create-response";
const sections = {
  drivers: {
    table: "drivers",
    fields: "id,full_name,phone,status,archived_at,created_at",
  },
  vehicles: {
    table: "vehicles",
    fields: "id,plate_number,brand,model,status,archived_at,created_at",
  },
  trips: {
    table: "trips",
    fields:
      "id,driver_id,start_time,end_time,start_address,end_address,status,price,chiron_sync_state,is_test,created_at",
  },
  invoices: {
    table: "invoices",
    fields:
      "id,invoice_number,invoice_date,due_date,total_tvac,payment_status,status,invoice_category,created_at",
  },
  contracts: {
    table: "company_contracts",
    fields:
      "id,contract_number,contract_status,contract_start_date,contract_end_date,signed_at,created_at",
  },
  audit: {
    table: "company_lifecycle_events",
    fields: "id,action,reason,actor_id,created_at",
  },
} as const;
export const workspaceGET = requestMiddleware(async (request, context) => {
  try {
    const section = request.nextUrl.searchParams.get("section") || "profile";
    const access = await operationsAccess(request, context, "fleet");
    if (!access.admin && !["drivers", "vehicles"].includes(section))
      return createErrorResponse({
        status: 403,
        errorMessage: "Administrator required",
      });
    const { client, companyId } = access;
    const company = await client
      .from("companies")
      .select(
        "id,name,email,phone,address,vat_number,kbo_number,subscription_status,is_test,archived_at",
      )
      .eq("id", companyId)
      .maybeSingle();
    if (company.error) throw company.error;
    if (!company.data)
      return createErrorResponse({
        status: 404,
        errorMessage: "Company missing",
      });
    if (section === "profile")
      return createSuccessResponse({ company: company.data });
    if (!(section in sections))
      return createErrorResponse({
        status: 400,
        errorMessage: "Invalid section",
      });
    const spec = sections[section as keyof typeof sections],
      { offset, limit } = pageRange(request);
    let query = client
      .from(spec.table as string)
      .select(spec.fields as string, { count: "exact" })
      .eq("company_id", companyId);
    if (!access.admin) query = query.is("archived_at", null);
    const q = (request.nextUrl.searchParams.get("q") || "").trim();
    if (q.length > 100)
      return createErrorResponse({
        status: 400,
        errorMessage: "Search too long",
      });
    if (q && ["drivers", "vehicles"].includes(section))
      query = query.ilike(
        section === "drivers" ? "full_name" : "plate_number",
        "%" + q.replace(/[\%_]/g, "\\$&") + "%",
      );
    const result = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);
    if (result.error) throw result.error;
    return createSuccessResponse({
      company: company.data,
      rows: result.data,
      total: result.count,
      offset,
      limit,
    });
  } catch (error) {
    return operationFailure(error);
  }
}, true);
