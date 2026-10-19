"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { tripJournal } from "@/lib/trip-journal";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { OperationForm } from "@/components/operations/OperationForm";
import { operationsCopy } from "@/components/operations/operations-copy";
import { shiftCopy } from "./shift-copy";
import type { DriverShift, ShiftList } from "@/lib/driver-shifts";

export default function DriverShiftWorkspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage(),
    c = shiftCopy[language];
  const { user } = useAuth();
  const pathname = usePathname();
  const [data, setData] = useState<ShiftList | null>(null);
  const [localActive, setLocalActive] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const flight = useRef(false),
    generation = useRef(0);
  const retry = useRef<{
    request_id: string;
    shift_id: string;
    expected_version: number;
    action: "status";
    work_status: "break" | "available";
  } | null>(null);
  const load = useCallback(async () => {
    const gen = ++generation.current;
    try {
      if (user?.sub) {
        const local = await tripJournal().list(user.sub, "active");
        if (gen === generation.current) setLocalActive(local.length > 0);
      }
      const result = await api.get<ShiftList>("/drivers/shifts");
      if (!result || !Array.isArray(result.shifts))
        throw new Error("Invalid shift response");
      if (gen === generation.current) {
        setData(result);
        if (!retry.current) setError("");
      }
    } catch {
      if (gen === generation.current) setError(c.failed);
    }
  }, [c.failed, user?.sub]);
  useEffect(() => {
    const epoch = generation;
    void load();
    const refresh = () => void load();
    const timer = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    window.addEventListener("driver-shift-updated", refresh);
    return () => {
      ++epoch.current;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("driver-shift-updated", refresh);
    };
  }, [load]);
  async function toggle() {
    if (!data?.active || flight.current) return;
    flight.current = true;
    setBusy(true);
    setError("");
    const active = data.active;
    retry.current ||= {
      action: "status",
      request_id: crypto.randomUUID(),
      shift_id: active.id,
      expected_version: active.version,
      work_status: active.work_status === "break" ? "available" : "break",
    };
    try {
      const shift = await api.post<DriverShift>(
        "/drivers/shifts",
        retry.current,
      );
      retry.current = null;
      setData({ ...data, active: shift });
      window.dispatchEvent(new Event("driver-shift-updated"));
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        retry.current = null;
        setError(c.conflict);
        void load();
      } else setError(c.failed);
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }
  const active = data?.active;
  const isSheet = pathname === "/driver/shifts";
  // Profile and history remain reachable to select a vehicle or inspect old services.
  const needsStart =
    pathname === "/driver/taximeter" && !active && !localActive;
  return (
    <>
      {!isSheet && (
        <section
          className="shift-controls dp-card mx-4 mt-4 space-y-3 border-2 p-4"
          style={{ borderColor: "var(--dp-accent)" }}
          aria-label={c.title}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="dp-text text-lg font-bold">
                {active ? `${c.title} · ${c[active.work_status]}` : c.start}
              </h2>
              <p className="dp-text-soft text-sm">
                {active
                  ? `${active.plate_number} · ${c.keepOpen}`
                  : c.firstStep}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data &&
                (!active ? (
                  <Button
                    onClick={() => setStarting(true)}
                    disabled={busy || localActive}
                  >
                    {c.start}
                  </Button>
                ) : (
                  <Button
                    onClick={() => void toggle()}
                    disabled={busy || active.work_status === "with_passenger"}
                    aria-busy={busy}
                  >
                    {busy
                      ? operationsCopy[language].loading
                      : retry.current
                        ? operationsCopy[language].retry
                        : active.work_status === "break"
                          ? c.resume
                          : c.pause}
                  </Button>
                ))}
              <Link
                className="dp-text underline underline-offset-4 py-2 text-sm"
                href="/driver/shifts"
              >
                {c.open}
              </Link>
            </div>
          </div>
          {!data && !error && (
            <p role="status">{operationsCopy[language].loading}</p>
          )}
          {error && (
            <div role="alert">
              <p>{error}</p>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void (retry.current ? toggle() : load())}
              >
                {operationsCopy[language].retry}
              </Button>
            </div>
          )}
        </section>
      )}
      <div hidden={needsStart}>{children}</div>
      {starting && (
        <OperationForm
          title={c.start}
          description={c.firstStep}
          c={operationsCopy[language]}
          submitLabel={c.start}
          intentKey={`driver-shift-${user?.sub}-start-start`}
          fields={[
            {
              key: "odometer",
              label: c.odometer,
              type: "number",
              min: 0,
              max: 9999999.99,
              step: 0.01,
            },
          ]}
          initial={{ odometer: "" }}
          onClose={() => setStarting(false)}
          errorMessage={(e) =>
            e instanceof ApiError && e.status === 409 ? c.conflict : c.invalid
          }
          onSubmit={async (values, requestId) => {
            const shift = await api.post<DriverShift>("/drivers/shifts", {
              action: "start",
              request_id: requestId,
              shift_id: requestId,
              expected_version: 0,
              odometer: Number(values.odometer),
              passenger_km: 0,
              work_status: values.work_status || "available",
            });
            retry.current = null;
            setData({ active: shift, shifts: [shift] });
            window.dispatchEvent(new Event("driver-shift-updated"));
          }}
        />
      )}
    </>
  );
}
