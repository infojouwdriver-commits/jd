"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { OperationForm, type OperationField } from "./OperationForm";
import { operationsCopy } from "./operations-copy";
type RecordRow = {
  id: number;
  status: string;
  [key: string]: string | number | undefined;
};
export default function FleetRecordsTab({
  rows,
  entity,
  companyId,
  onRefresh,
}: {
  rows: RecordRow[];
  entity: "driver" | "vehicle";
  companyId: number;
  onRefresh: () => void;
}) {
  const { language } = useLanguage(),
    c = operationsCopy[language];
  const [target, setTarget] = useState<RecordRow | null | undefined>(undefined),
    [deactivate, setDeactivate] = useState(false);
  const fields: OperationField[] =
    entity === "driver"
      ? [
          { key: "full_name", label: c.name, maxLength: 200 },
          { key: "phone", label: c.phone, maxLength: 32 },
          {
            key: "password",
            label: c.password,
            type: "password" as const,
            maxLength: 72,
            optional: !!target,
          },
          { key: "national_id", label: c.national_id, optional: true },
          { key: "driver_license", label: c.driver_license, optional: true },
        ]
      : [
          { key: "brand", label: c.brand },
          { key: "model", label: c.model },
          { key: "plate_number", label: c.plate_number },
          { key: "vin", label: c.vin, optional: true },
        ];
  return (
    <section className="space-y-4">
      <p className="rounded-xl border bg-muted/30 p-4 text-sm">
        {c.approvalNotice}
      </p>
      <Button
        onClick={() => {
          setDeactivate(false);
          setTarget(null);
        }}
      >
        {c.create} · {c[entity]}
      </Button>
      {!rows.length && <p className="text-muted-foreground">{c.empty}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <article
            key={row.id}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            <p className="font-semibold">
              {entity === "driver"
                ? row.full_name
                : `${row.brand} ${row.model}`}
            </p>
            <p dir="ltr" className="text-sm text-muted-foreground">
              {entity === "driver" ? row.phone : row.plate_number}
            </p>
            <Badge variant="outline">
              {c[row.status as "active"] || row.status}
            </Badge>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeactivate(false);
                  setTarget(row);
                }}
              >
                {c.edit}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDeactivate(true);
                  setTarget(row);
                }}
              >
                {c.deactivate}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {target !== undefined && (
        <OperationForm
          key={String(target?.id) + deactivate}
          intentKey={`${companyId}:${entity}:${target?.id || "new"}:${deactivate}`}
          title={
            (deactivate ? c.deactivate : target ? c.edit : c.create) +
            " · " +
            c[entity]
          }
          description={c.approvalNotice}
          fields={deactivate ? [] : fields}
          initial={Object.fromEntries(
            fields.map((f) => [f.key, String(target?.[f.key] || "")]),
          )}
          c={c}
          onClose={() => setTarget(undefined)}
          onSubmit={async (v, requestId) => {
            const base = `/company-portal/${entity}s?company_id=${companyId}&request_id=${requestId}`;
            if (deactivate) await api.delete(base + "&id=" + target!.id);
            else if (target)
              await api.put(
                base + "&id=" + target.id,
                Object.fromEntries(
                  Object.entries(v).filter(
                    ([key, value]) => key !== "password" || value,
                  ),
                ),
              );
            else await api.post(base, v);
            toast.success(c.submitted);
            onRefresh();
          }}
        />
      )}
    </section>
  );
}
