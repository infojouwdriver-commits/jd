"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { tripJournal } from "@/lib/trip-journal";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { OperationForm } from "@/components/operations/OperationForm";
import { operationsCopy } from "@/components/operations/operations-copy";
import { shiftCopy } from "./shift-copy";
import {DriverReceiptContext,DriverShiftContext} from "./DriverShiftContext";
import {ExperienceFrame,HomeInstruments,experienceWords} from "./DriverExperience";
import { Power, Gauge } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ignition, setIgnition] = useState<"on" | "off" | null>(null);
  const [form, setForm] = useState<{ action: "record" | "end"; shift: DriverShift } | null>(null);
  useEffect(() => () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); }, []);
  const [lastReceiptTrip,setLastReceiptTrip]=useState<number|null>(null);
  const [data, setData] = useState<ShiftList | null>(null);
  const [startPending, setStartPending] = useState(false);
  const [localActive, setLocalActive] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
        const local = (await Promise.all([tripJournal().list(user.sub, "active"), tripJournal().list(user.sub, "completed")])).flat();
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
  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, [pathname]);
  const active = data?.active;
  const blocked = localActive || startPending || active?.work_status === "with_passenger";
  // Profile and history remain reachable to select a vehicle or inspect old services.
  const needsStart =
    pathname === "/driver/taximeter" && !active && !localActive;
  return (
    <DriverReceiptContext.Provider value={{tripId:lastReceiptTrip,remember:setLastReceiptTrip}}><DriverShiftContext.Provider value={active||null}>
      {pathname === "/driver/home" && (
        <ExperienceFrame screen="home" on={!!active} ignition={ignition}><section
          className="shift-controls driver-cockpit jd-panel space-y-5"
          data-engine={ignition || (active ? "on" : "off")}
          aria-label={c.title}
        >
          <HomeInstruments active={!!active} odometer={active?.odometer} status={active?c[active.work_status]:experienceWords[language].ready}/>
          {ignition && <p role="status">{c.saved}</p>}
          {active && <div className="flex flex-wrap items-center justify-between gap-3">
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
            <div className="jd-service-actions">
              {data &&
                (!active ? (
                  null
                ) : (
                  <Button
                    onClick={() => void toggle()}
                    disabled={busy || !!blocked || !!ignition}
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
              {active && <>
                <Button variant="outline" disabled={busy || !!blocked || !!ignition} onClick={() => setForm({action:"record", shift:active})}>{c.record}</Button>
                <Button variant="outline" disabled={busy || !!blocked || !!ignition} onClick={() => setForm({action:"end", shift:active})}><Power size={16}/>{c.end}</Button>
              </>}
              <Link
                className="jd-sub underline underline-offset-4 py-2 text-sm"
                href="/driver/shifts"
              >
                {c.open}
              </Link>
            </div>
          </div>}
          {blocked && <p role="status">{c.endNotice}</p>}
          {data && (!active || startPending) && !localActive && !ignition && (
        <OperationForm inline
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
          onClose={() => {}}
          errorMessage={(e) =>
            e instanceof ApiError && e.status === 409 ? c.conflict : c.invalid
          }
          onSubmit={async (values, requestId) => {
            setStartPending(true);
            let shift: DriverShift;
            try {
              shift = await api.post<DriverShift>("/drivers/shifts", {
              action: "start",
              request_id: requestId,
              shift_id: requestId,
              expected_version: 0,
              odometer: Number(values.odometer),
              passenger_km: 0,
              work_status: values.work_status || "available",
            });
              if (!shift?.id || shift.ended_at) throw new ApiError(503, c.failed);
            } catch (error) {
              if (error instanceof ApiError && error.status > 0 && error.status < 500) setStartPending(false);
              throw error;
            }
            ++generation.current;
            setStartPending(false);
            retry.current = null;
            setData({ active: shift, shifts: [shift] });
            window.dispatchEvent(new Event("driver-shift-updated"));
            setIgnition("on");
            transitionTimer.current = setTimeout(() => { setIgnition(null); router.push("/driver/taximeter"); }, reduceMotion ? 0 : 850);
          }}
        />
      )}
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
          {!active && <Link className="jd-sub underline block text-center" href="/driver/shifts">{c.open}</Link>}
          {active && <Link className="jd-btn jd-gold flex items-center justify-center gap-2" href="/driver/taximeter"><Gauge size={20}/>{language === "ar" ? "فتح التاكسيميتر" : language === "fr" ? "Ouvrir le taximètre" : "Taximeter openen"}</Link>}
        </section></ExperienceFrame>
      )}
      {needsStart && <section className="dp-card m-4 space-y-3 p-5" role="status"><p>{error || (data ? c.firstStep : operationsCopy[language].loading)}</p><Link className="dp-text underline" href="/driver/home">{c.start}</Link></section>}
      <div hidden={needsStart}>{children}</div>
      {form && <OperationForm
        title={c[form.action]} description={form.action === "end" ? c.endNotice : c.intro}
        c={operationsCopy[language]} submitLabel={c[form.action]}
        intentKey={`driver-shift-${user?.sub}-${form.action}-${form.shift.id}`}
        fields={[
          {key:"odometer",label:c.odometer,type:"number",min:Number(form.shift.odometer),max:9999999.99,step:.01},
          {key:"passenger_km",label:c.passenger,type:"number",min:Number(form.shift.passenger_km),max:9999999.99,step:.01},
          ...(form.action === "record" ? [{key:"work_status",label:c.status,options:(["available","driving_empty","with_passenger","break"] as const).map(value=>({value,label:c[value]}))}] : [])
        ]}
        initial={{_shift_id:form.shift.id,_version:String(form.shift.version),odometer:"",passenger_km:"",work_status:form.shift.work_status}}
        errorMessage={e => e instanceof ApiError && e.status === 409 ? c.conflict : e instanceof ApiError && e.status === 400 ? c.invalid : operationsCopy[language].failure}
        onClose={() => setForm(null)}
        onSubmit={async (values,requestId) => {
          // Recheck local trip protection before the existing authoritative server declaration.
          if (user?.sub && (await Promise.all([tripJournal().list(user.sub, "active"), tripJournal().list(user.sub, "completed")])).some(rows => rows.length > 0)) throw new Error(c.endNotice);
          const shift = await api.post<DriverShift>("/drivers/shifts",{action:form.action,request_id:requestId,shift_id:values._shift_id,expected_version:Number(values._version),odometer:Number(values.odometer),passenger_km:Number(values.passenger_km),work_status:values.work_status});
          ++generation.current;
          setData({active:shift.ended_at ? null : shift,shifts:[shift]});
          if (shift.ended_at) {
            setIgnition("off");
            transitionTimer.current = setTimeout(() => setIgnition(null), reduceMotion ? 0 : 850);
          }
          window.dispatchEvent(new Event("driver-shift-updated"));
        }}
      />}

    </DriverShiftContext.Provider></DriverReceiptContext.Provider>
  );
}
