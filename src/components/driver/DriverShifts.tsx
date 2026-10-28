"use client";
import {shiftReference, shiftDocumentUrl} from "@/lib/shift-document";
import Link from "next/link";
import DocumentQr from "./DocumentQr";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { operationsCopy } from "@/components/operations/operations-copy";
import { shiftCopy } from "./shift-copy";
import {
  shiftDurations,
  shiftKilometres,
  shiftTime,
} from "@/lib/driver-shifts";
import type {
  ShiftList,
  ShiftDetail,
} from "@/lib/driver-shifts";
const statuses = ["available", "driving_empty", "with_passenger", "break"] as const;
export default function DriverShifts() {
  const { language, isRtl } = useLanguage(),
    c = shiftCopy[language];
  const [list, setList] = useState<ShiftList | null>(null),
    [detail, setDetail] = useState<ShiftDetail | null>(null),
    [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const downloadFlight = useRef(false);
  const generation = useRef(0);
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
    const id = new URLSearchParams(window.location.search).get("id");
    void load(0, id && /^[0-9a-f-]{36}$/i.test(id) ? id : undefined);
    return () => {
      ++epoch.current;
    };
  }, [load]);
  const active = list?.active;
  const metrics = detail ? shiftKilometres(detail.shift) : null;
  const durations = detail
    ? shiftDurations(detail)
    : { available: 0, driving_empty: 0, with_passenger: 0, break: 0 };
  async function downloadPdf() {
    if (!detail || downloadFlight.current) return;
    downloadFlight.current = true;
    setDownloading(true);
    setError("");
    try {
      const { driverShiftPdf } = await import("@/lib/driver-shift-pdf");
      const pdf = driverShiftPdf(detail);
      const url = URL.createObjectURL(pdf.output("blob"));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Dienststaat-${detail.shift.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Safari needs the object URL to remain alive while starting the download.
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError(c.downloadFailed);
    } finally {
      downloadFlight.current = false;
      setDownloading(false);
    }
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
        {busy && <p role="status">{operationsCopy[language].loading}</p>}
        {list && (
          <section className="dp-card space-y-3 p-4">
            <p className="font-semibold">
              {active
                ? `${c.active} · ${active.plate_number} · ${c[active.work_status]}`
                : c.empty}
            </p>
            <Link href="/driver/home" className="dp-text underline">{c.start} / {c.end}</Link>
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
          <p className="dp-text-soft break-all font-mono text-sm" dir="ltr">{shiftReference(detail.shift.id)}</p>
          <DocumentQr url={shiftDocumentUrl(detail.shift.id)} label={c.title} />
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
          {!!detail.activity?.length && (
            <section className="space-y-2">
              <h3 className="font-bold">{c.activity}</h3>
              <ol className="space-y-2">
                {detail.activity
                  .filter((a) => a.kind !== "declaration")
                  .map((a) => (
                    <li key={a.id} className="border-b py-2 text-sm">
                      <p>
                        {shiftTime(a.occurred_at)} ·{" "}
                        {a.kind === "status" ? c.stateChange : c[a.kind]}
                      </p>
                      <p>
                        {a.work_status ? c[a.work_status] : ""}
                        {a.trip_id
                          ? ` · ${c.trip} #${a.trip_id} · ${a.source || ""}`
                          : ""}
                      </p>
                    </li>
                  ))}
              </ol>
            </section>
          )}
          <p className="text-sm">{c.notice}</p>
          <Button
            className="shift-controls"
            disabled={downloading || busy}
            aria-busy={downloading}
            onClick={() => void downloadPdf()}
          >
            {downloading ? c.downloading : c.print}
          </Button>
        </article>
      )}
    </div>
  );
}
