"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, api } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { OperationForm } from "@/components/operations/OperationForm";
import { operationsCopy } from "@/components/operations/operations-copy";
import { shiftCopy } from "./shift-copy";
import { shiftKilometres, shiftTime } from "@/lib/driver-shifts";
import type {
  DriverShift,
  ShiftList,
  ShiftDetail,
  ShiftStatus,
} from "@/lib/driver-shifts";
const statuses: ShiftStatus[] = [
  "available",
  "driving_empty",
  "with_passenger",
  "break",
];
export default function DriverShifts() {
  const { language, isRtl } = useLanguage(),
    c = shiftCopy[language];
  const { user } = useAuth();
  const [list, setList] = useState<ShiftList | null>(null),
    [detail, setDetail] = useState<ShiftDetail | null>(null),
    [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const [form, setForm] = useState<{
    action: "start" | "record" | "end";
    shift: DriverShift | null;
    id: string;
  } | null>(null);
  const generation = useRef(0),
    flight = useRef(false);
  const load = useCallback(
    async (page = 0, id?: string) => {
      const gen = ++generation.current;
      setBusy(true);
      setError("");
      try {
        const [rows, report] = await Promise.all([
          api.get<ShiftList>(`/drivers/shifts?offset=${page}`),
          id
            ? api.get<ShiftDetail>(`/drivers/shifts?id=${id}`)
            : Promise.resolve(null),
        ]);
        if (gen !== generation.current) return;
        setList(rows);
        setOffset(page);
        setDetail(report);
      } catch {
        if (gen === generation.current) setError(c.failed);
      } finally {
        if (gen === generation.current) setBusy(false);
      }
    },
    [c.failed],
  );
  useEffect(() => {
    const epoch = generation;
    void load();
    return () => {
      ++epoch.current;
    };
  }, [load]);
  const active = list?.active;
  const metrics = detail ? shiftKilometres(detail.shift) : null;
  const durations = Object.fromEntries(statuses.map((s) => [s, 0])) as Record<
    ShiftStatus,
    number
  >;
  if (detail)
    for (let i = 0; i < detail.events.length - 1; i++) {
      const a = detail.events[i],
        b = detail.events[i + 1];
      durations[a.work_status] +=
        (Date.parse(b.recorded_at) - Date.parse(a.recorded_at)) / 60000;
    }
  function begin(action: "start" | "record" | "end") {
    setSaved(false);
    setForm({
      action,
      shift: active || null,
      id: active?.id || crypto.randomUUID(),
    });
  }
  return (
    <div
      className="dp-text mx-auto max-w-3xl space-y-5 p-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="shift-controls space-y-3">
        <h1 className="text-2xl font-bold">{c.title}</h1>
        <p className="dp-text-soft text-sm">{c.intro}</p>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void load(offset, detail?.shift.id)}
        >
          {c.refresh}
        </Button>
        {error && <p role="alert">{error}</p>}
        {saved && <p role="status">{c.saved}</p>}
        {busy && <p role="status">{operationsCopy[language].loading}</p>}
        {list && (
          <section className="dp-card space-y-3 p-4">
            <p className="font-semibold">
              {active
                ? `${c.active} · ${active.plate_number} · ${c[active.work_status]}`
                : c.empty}
            </p>
            <div className="flex flex-wrap gap-3">
              {!active ? (
                <Button disabled={busy} onClick={() => begin("start")}>
                  {c.start}
                </Button>
              ) : (
                <>
                  <Button disabled={busy} onClick={() => begin("record")}>
                    {c.record}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => begin("end")}
                  >
                    {c.end}
                  </Button>
                </>
              )}
            </div>
          </section>
        )}
        <section className="dp-card space-y-3 p-4">
          <h2 className="font-bold">{c.history}</h2>
          {list?.shifts.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b py-3"
            >
              <div>
                <p>
                  {s.plate_number} · {shiftTime(s.started_at)}
                </p>
                <p className="dp-text-soft text-sm">
                  {s.ended_at ? c.closed : c.active}
                </p>
              </div>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void load(offset, s.id)}
              >
                {c.open}
              </Button>
            </div>
          ))}
          <div className="flex gap-3">
            {offset > 0 && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void load(Math.max(0, offset - 25))}
              >
                {c.back}
              </Button>
            )}
            {list?.shifts.length === 25 && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void load(offset + 25)}
              >
                {c.more}
              </Button>
            )}
          </div>
        </section>
      </div>
      {detail && metrics && (
        <article className="shift-print-sheet dp-card space-y-4 p-4">
          <h2 className="text-xl font-bold">
            {c.title} · {detail.shift.ended_at ? c.closed : c.active}
          </h2>
          <p className="break-all text-xs">{detail.shift.id}</p>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              [c.company, detail.shift.company_name],
              [c.driver, detail.shift.driver_name],
              [c.vehicle, detail.shift.plate_number],
              [c.begin, shiftTime(detail.shift.started_at)],
              [
                c.finish,
                detail.shift.ended_at ? shiftTime(detail.shift.ended_at) : "—",
              ],
              [
                c.odometer,
                `${detail.shift.start_odometer} → ${detail.shift.odometer}`,
              ],
              [c.total, `${metrics.total.toFixed(2)} km`],
              [c.passenger, `${metrics.passenger.toFixed(2)} km`],
              [c.without, `${metrics.withoutPassenger.toFixed(2)} km`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="dp-text-soft text-sm">{label}</dt>
                <dd className="font-semibold">
                  <bdi dir={label === c.odometer ? "ltr" : undefined}>
                    {value}
                  </bdi>
                </dd>
              </div>
            ))}
          </dl>
          <h3 className="font-bold">{c.duration}</h3>
          <dl className="grid grid-cols-2 gap-3">
            {statuses.map((s) => (
              <div key={s}>
                <dt>{c[s]}</dt>
                <dd>{durations[s].toFixed(2)} min</dd>
              </div>
            ))}
          </dl>
          <h3 className="font-bold">{c.readings}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr>
                  {[c.version, c.time, c.odometer, c.passenger, c.status].map(
                    (t) => (
                      <th key={t} className="p-2 text-start">
                        {t}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {detail.events.map((e) => (
                  <tr key={e.version} className="border-t">
                    <td className="p-2">
                      {e.version} ·{" "}
                      {e.action === "start"
                        ? c.start
                        : e.action === "end"
                          ? c.end
                          : c.record}
                    </td>
                    <td className="p-2">{shiftTime(e.recorded_at)}</td>
                    <td className="p-2">{e.odometer}</td>
                    <td className="p-2">{e.passenger_km}</td>
                    <td className="p-2">{c[e.work_status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm">{c.notice}</p>
          <Button className="shift-controls" onClick={() => window.print()}>
            {c.print}
          </Button>
        </article>
      )}
      {form && (
        <OperationForm
          title={c[form.action]}
          description={form.action === "end" ? c.endNotice : c.intro}
          c={operationsCopy[language]}
          submitLabel={c[form.action]}
          intentKey={`driver-shift-${user?.sub}-${form.action}-${form.shift?.id || "start"}`}
          fields={[
            {
              key: "odometer",
              label: c.odometer,
              type: "number",
              min: Number(form.shift?.odometer || 0),
              max: 9999999.99,
              step: 0.01,
            },
            ...(form.action === "start"
              ? []
              : [
                  {
                    key: "passenger_km",
                    label: c.passenger,
                    type: "number" as const,
                    min: Number(form.shift?.passenger_km || 0),
                    max: 9999999.99,
                    step: 0.01,
                  },
                ]),
            {
              key: "work_status",
              label: c.status,
              options: statuses.map((value) => ({ value, label: c[value] })),
            },
          ]}
          initial={{
            _shift_id: form.id,
            _version: String(form.shift?.version || 0),
            odometer:
              form.action === "start" ? "" : String(form.shift?.odometer || 0),
            passenger_km:
              form.action === "start"
                ? "0"
                : String(form.shift?.passenger_km || 0),
            work_status: form.shift?.work_status || "available",
          }}
          errorMessage={(error) =>
            error instanceof ApiError && error.status === 409
              ? c.conflict
              : error instanceof ApiError && error.status === 400
                ? c.invalid
                : operationsCopy[language].failure
          }
          onClose={() => setForm(null)}
          onSubmit={async (values, requestId) => {
            if (flight.current) return;
            flight.current = true;
            try {
              const s = await api.post<DriverShift>("/drivers/shifts", {
                request_id: requestId,
                shift_id:
                  form.action === "start" ? requestId : values._shift_id,
                action: form.action,
                expected_version: Number(values._version),
                odometer: Number(values.odometer),
                passenger_km: Number(values.passenger_km),
                work_status: values.work_status,
              });
              setSaved(true);
              await load(0, s.id);
            } finally {
              flight.current = false;
            }
          }}
        />
      )}
    </div>
  );
}
