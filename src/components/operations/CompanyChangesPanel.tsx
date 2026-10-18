"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { operationsCopy } from "./operations-copy";
import { OperationForm } from "./OperationForm";
import { useOperationData } from "./useOperationData";
interface Change {
  id: number;
  company_id: number;
  entity_type: string;
  entity_id: number | null;
  action: string;
  summary: Record<string, unknown>;
  status: string;
  review_notes: string | null;
  created_at: string;
}
export default function CompanyChangesPanel({
  companyId,
  admin = false,
}: {
  companyId?: number;
  admin?: boolean;
}) {
  const { language } = useLanguage(),
    c = operationsCopy[language];
  const [offset, setOffset] = useState(0),
    [target, setTarget] = useState<{
      row: Change;
      decision: "approved" | "rejected";
    } | null>(null);
  const { data, loading, error, reload } = useOperationData<{
    rows: Change[];
    total: number;
  }>(
    `${admin ? "/company-changes" : "/company-portal/changes"}?offset=${offset}&limit=25${companyId ? "&company_id=" + companyId : ""}`,
  );
  return (
    <section className="space-y-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{c.changes}</h2>
        <Button variant="outline" disabled={loading} onClick={reload}>
          {c.refresh}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{c.approvalNotice}</p>
      {loading && <p role="status">{c.loading}</p>}
      {error && <p role="alert">{c.error}</p>}
      {data?.rows.map((r) => (
        <article key={r.id} className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <h3 className="font-semibold">
              #{r.id} · {c[r.action as "create"]} ·{" "}
              {
                c[
                  r.entity_type === "staff"
                    ? "staffMember"
                    : (r.entity_type as "driver")
                ]
              }{" "}
              {r.entity_id ? "#" + r.entity_id : ""}
            </h3>
            <Badge variant="outline">
              {r.status === "pending"
                ? c.pendingReview
                : c[r.status as "approved"]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {c.profile} #{r.company_id} ·{" "}
            {new Intl.DateTimeFormat(language + "-BE", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/Brussels",
            }).format(new Date(r.created_at))}
          </p>
          <dl className="grid gap-2 sm:grid-cols-2">
            {Object.entries(r.summary)
              .filter(([key]) => !["membership_id"].includes(key))
              .map(([key, val]) => (
                <div key={key} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">
                    {key === "full_name"
                      ? c.name
                      : key === "is_active"
                        ? c.active
                        : key === "password_change"
                          ? c.password
                          : c[key as "phone"] || key}
                  </dt>
                  <dd className="break-words text-sm">
                    {typeof val === "boolean"
                      ? val
                        ? "✓"
                        : "—"
                      : String(val ?? "—")}
                  </dd>
                </div>
              ))}
          </dl>
          {r.review_notes && (
            <p className="text-sm">
              {c.reason}: {r.review_notes}
            </p>
          )}
          {admin && r.status === "pending" && (
            <div className="flex gap-2">
              <Button
                onClick={() => setTarget({ row: r, decision: "approved" })}
              >
                {c.approve}
              </Button>
              <Button
                variant="outline"
                onClick={() => setTarget({ row: r, decision: "rejected" })}
              >
                {c.reject}
              </Button>
            </div>
          )}
        </article>
      ))}
      {data && !data.rows.length && <p>{c.empty}</p>}
      {data && (
        <div className="flex justify-between gap-2">
          <span>
            {c.total}: {data.total}
          </span>
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
      {target && (
        <OperationForm
          title={
            (target.decision === "approved" ? c.approve : c.reject) +
            " #" +
            target.row.id
          }
          description={c.approvalNotice}
          fields={[
            {
              key: "notes",
              label: c.reason,
              optional: target.decision === "approved",
              maxLength: 1000,
            },
          ]}
          initial={{ notes: "" }}
          c={c}
          onClose={() => setTarget(null)}
          onSubmit={async (v) => {
            await api.put("/company-changes", {
              id: target.row.id,
              decision: target.decision,
              notes: v.notes,
            });
            reload();
          }}
        />
      )}
    </section>
  );
}
