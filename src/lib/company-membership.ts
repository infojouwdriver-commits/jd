import { createPostgrestClient } from "./postgrest";
export type CompanyCapability = "overview" | "fleet" | "billing" | "staff";
export const companyRoleCapabilities: Record<
  string,
  readonly CompanyCapability[]
> = {
  portal_owner: ["overview", "fleet", "billing", "staff"],
  owner: ["overview", "fleet", "billing", "staff"],
  manager: ["overview", "fleet"],
  fleet_manager: ["overview", "fleet"],
  accountant: ["overview", "billing"],
};
export function companyCapability(role: string, capability: CompanyCapability) {
  return companyRoleCapabilities[role]?.includes(capability) === true;
}
export async function companyMembership(
  token: string,
  userId: number,
  capability: CompanyCapability,
  companyId?: number,
) {
  const client = createPostgrestClient(token);
  let query = client
    .from("company_users")
    .select("id,company_id,role,is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("id", { ascending: true });
  if (companyId !== undefined) query = query.eq("company_id", companyId);
  const links = await query.limit(100);
  if (links.error) throw new Response(null, { status: 503 });
  for (const link of links.data || []) {
    if (!companyCapability(link.role, capability)) continue;
    const company = await client
      .from("companies")
      .select("id,name,archived_at,is_test")
      .eq("id", link.company_id)
      .is("archived_at", null)
      .maybeSingle();
    if (company.error) throw new Response(null, { status: 503 });
    if (company.data) return { ...link, company: company.data };
  }
  throw new Response(null, { status: 403 });
}
