"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { operationsCopy } from "./operations-copy";
import { OperationForm } from "./OperationForm";
import { useOperationData } from "./useOperationData";
interface Staff {
  id: number;
  role: string;
  is_active: boolean;
  identity: { email: string; display_name: string } | null;
}
export default function StaffPanel({
  companyId,
  admin = false,
  archived = false,
}: {
  companyId: number;
  admin?: boolean;
  archived?: boolean;
}) {
  const { language } = useLanguage(),
    c = operationsCopy[language],
    base = admin ? "/company-staff" : "/company-portal/staff";
  const [offset, setOffset] = useState(0),
    [target, setTarget] = useState<Staff | null | undefined>(undefined);
  const { data, error, loading, reload } = useOperationData<{
    rows: Staff[];
    total: number;
  }>(
    base +
      "?" +
      new URLSearchParams({
        company_id: String(companyId),
        offset: String(offset),
        limit: "25",
      }),
  );
  const roles = ["owner", "fleet_manager", "accountant"] as const;
  return (
    <section className="space-y-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="text-xl font-semibold">{c.staff}</h2>
        <div className="flex gap-2">
          <Button variant="outline" disabled={loading} onClick={reload}>
            {c.refresh}
          </Button>
          <Button disabled={archived} onClick={() => setTarget(null)}>
            {c.newStaff}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{c.staffNotice}</p>
      {loading && <p role="status">{c.loading}</p>}
      {error && <p role="alert">{c.error}</p>}
      {data?.rows.map((s) => (
        <article
          key={s.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4"
        >
          <div>
            <p className="font-medium">
              {s.identity?.display_name || s.identity?.email || "#" + s.id}
            </p>
            <p className="text-sm text-muted-foreground" dir="ltr">
              {s.identity?.email}
            </p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline">{c[s.role as "owner"] || s.role}</Badge>
              <Badge variant="outline">
                {s.is_active ? c.active : c.inactive}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            disabled={archived}
            onClick={() => setTarget(s)}
          >
            {c.edit}
          </Button>
        </article>
      ))}
      {data && !data.rows.length && <p>{c.empty}</p>}
      {data && (
        <div className="flex justify-between gap-2">
          <p>
            {c.total}: {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!offset}
              onClick={() => setOffset(Math.max(0, offset - 25))}
            >
              {c.previous}
            </Button>
            <Button
              variant="outline"
              disabled={offset + 25 >= data.total}
              onClick={() => setOffset(offset + 25)}
            >
              {c.next}
            </Button>
          </div>
        </div>
      )}
      {target !== undefined && (
        <OperationForm
          title={target ? c.edit : c.newStaff}
          description={c.staffNotice}
          c={c}
          initial={{
            role:
              target?.role === "portal_owner"
                ? "owner"
                : target?.role === "manager"
                  ? "fleet_manager"
                  : target?.role || "fleet_manager",
            is_active: target?.is_active ?? true,
            email: "",
            password: "",
            reason: "",
          }}
          fields={[
            ...(!target
              ? [
                  { key: "email", label: c.email, type: "email" as const },
                  {
                    key: "password",
                    label: c.password,
                    type: "password" as const,
                    maxLength: 72,
                  },
                ]
              : []),
            {
              key: "role",
              label: c.role,
              options: roles.map((value) => ({ value, label: c[value] })),
            },
            { key: "is_active", label: c.active, type: "checkbox" },
            { key: "reason", label: c.reason },
          ]}
          onClose={() => setTarget(undefined)}
          onSubmit={async (v) => {
            await api.post(base + "?company_id=" + companyId, {
              membership_id: target?.id ?? null,
              role: v.role,
              is_active: v.is_active,
              reason: v.reason,
              ...(!target ? { email: v.email, password: v.password } : {}),
            });
            reload();
          }}
        />
      )}
    </section>
  );
}
