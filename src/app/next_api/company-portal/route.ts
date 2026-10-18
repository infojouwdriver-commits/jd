import { createPostgrestClient } from "@/lib/postgrest";
import { companyMembership, companyCapability } from "@/lib/company-membership";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/create-response";
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from "@/lib/auth";
import { operationFailure } from "@/lib/operations-access";
export const GET = requestMiddleware(async (request, context) => {
  try {
    const token = await generateAdminUserToken(),
      client = createPostgrestClient(token),
      selected = request.nextUrl.searchParams.get("company_id");
    const membership = await companyMembership(
        token,
        Number(context.payload?.sub),
        "overview",
        selected === null ? undefined : Number(selected),
      ),
      companyId = membership.company_id;
    const company = await client
      .from("companies")
      .select(
        "id,name,email,phone,address,vat_number,kbo_number,subscription_status,is_test,archived_at",
      )
      .eq("id", companyId)
      .single();
    if (company.error) throw company.error;
    const offsets = ["drivers_offset", "vehicles_offset"].map((key) =>
      Number(request.nextUrl.searchParams.get(key) || 0),
    );
    if (offsets.some((x) => !Number.isInteger(x) || x < 0 || x > 100000))
      return createErrorResponse({ status: 400, errorMessage: "Invalid page" });
    const q = (request.nextUrl.searchParams.get("q") || "").trim(),
      state = request.nextUrl.searchParams.get("state") || "all";
    if (
      q.length > 100 ||
      !["all", "active", "inactive", "suspended", "maintenance"].includes(state)
    )
      return createErrorResponse({
        status: 400,
        errorMessage: "Invalid filters",
      });
    const fleet = companyCapability(membership.role, "fleet");
    async function page(table: string, fields: string, index: number) {
      if (!fleet) return { data: [], count: 0, error: null };
      let query = client
        .from(table)
        .select(fields, { count: "exact" })
        .eq("company_id", companyId)
        .is("archived_at", null);
      if (q)
        query = query.ilike(
          table === "drivers" ? "full_name" : "plate_number",
          "%" + q.replace(/[\\%_]/g, "\\$&") + "%",
        );
      if (state !== "all") query = query.eq("status", state);
      return query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offsets[index], offsets[index] + 24);
    }
    const [drivers, vehicles, driverCount, vehicleCount, activeCount, links] =
      await Promise.all([
        page(
          "drivers",
          "id,full_name,phone,national_id,driver_license,status",
          0,
        ),
        page("vehicles", "id,brand,model,plate_number,vin,status", 1),
        fleet
          ? client
              .from("drivers")
              .select("id", { count: "exact", head: true })
              .eq("company_id", companyId)
              .is("archived_at", null)
          : Promise.resolve({ count: 0, error: null }),
        fleet
          ? client
              .from("vehicles")
              .select("id", { count: "exact", head: true })
              .eq("company_id", companyId)
              .is("archived_at", null)
          : Promise.resolve({ count: 0, error: null }),
        fleet
          ? client
              .from("vehicles")
              .select("id", { count: "exact", head: true })
              .eq("company_id", companyId)
              .is("archived_at", null)
              .eq("status", "active")
          : Promise.resolve({ count: 0, error: null }),
        client
          .from("company_users")
          .select("company_id,role")
          .eq("user_id", Number(context.payload?.sub))
          .eq("is_active", true)
          .order("id")
          .limit(100),
      ]);
    for (const r of [
      drivers,
      vehicles,
      driverCount,
      vehicleCount,
      activeCount,
      links,
    ])
      if (r.error) throw r.error;
    const companies = links.data?.length
      ? await client
          .from("companies")
          .select("id,name,is_test")
          .in(
            "id",
            links.data
              .filter((l) => companyCapability(l.role, "overview"))
              .map((l) => l.company_id),
          )
          .is("archived_at", null)
          .order("name")
      : { data: [], error: null };
    if (companies.error) throw companies.error;
    return createSuccessResponse({
      company: company.data,
      companies: companies.data,
      membership_role: membership.role,
      can_manage_fleet: fleet,
      can_view_billing: companyCapability(membership.role, "billing"),
      can_manage_staff: companyCapability(membership.role, "staff"),
      drivers: drivers.data,
      vehicles: vehicles.data,
      drivers_total: drivers.count,
      vehicles_total: vehicles.count,
      summary: {
        drivers: driverCount.count,
        vehicles: vehicleCount.count,
        active_vehicles: activeCount.count,
      },
    });
  } catch (error) {
    return operationFailure(error);
  }
}, true);
