import { z } from "zod";
const km = z
  .number()
  .finite()
  .min(0)
  .max(9999999.99)
  .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.000001);
export const shiftDeclaration = z
  .object({
    request_id: z.string().uuid(),
    shift_id: z.string().uuid(),
    action: z.enum(["start", "record", "end"]),
    expected_version: z.number().int().min(0).max(2147483646),
    odometer: km,
    passenger_km: km,
    work_status: z.enum([
      "available",
      "driving_empty",
      "with_passenger",
      "break",
    ]),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (
      v.action === "start" &&
      (v.expected_version !== 0 || v.passenger_km !== 0)
    )
      ctx.addIssue({ code: "custom", message: "Invalid start" });
  });
export const shiftStatusChange = z
  .object({
    action: z.literal("status"),
    request_id: z.string().uuid(),
    shift_id: z.string().uuid(),
    expected_version: z.number().int().min(1),
    work_status: z.enum(["available", "break", "with_passenger"]),
  })
  .strict();
export interface ShiftActivity {
  id: string;
  kind: "declaration" | "status" | "trip_start" | "trip_end" | "trip_cancel";
  recorded_at: string;
  occurred_at: string;
  work_status: ShiftStatus | null;
  trip_id: number | null;
  source: string | null;
}
export type ShiftStatus = z.infer<typeof shiftDeclaration>["work_status"];
export interface DriverShift {
  id: string;
  driver_id: number;
  company_id: number;
  vehicle_id: number;
  driver_name: string;
  company_name: string;
  plate_number: string;
  started_at: string;
  ended_at: string | null;
  start_odometer: number;
  odometer: number;
  passenger_km: number;
  work_status: ShiftStatus;
  version: number;
}
export interface ShiftEvent {
  version: number;
  action: "start" | "record" | "end";
  recorded_at: string;
  odometer: number;
  passenger_km: number;
  work_status: ShiftStatus;
}
export interface ShiftDetail {
  activity?: ShiftActivity[];
  shift: DriverShift;
  events: ShiftEvent[];
}
export interface ShiftList {
  active: DriverShift | null;
  shifts: DriverShift[];
}
export function shiftKilometres(s: DriverShift) {
  const total =
    Math.round((Number(s.odometer) - Number(s.start_odometer)) * 100) / 100;
  return {
    total,
    passenger: Number(s.passenger_km),
    withoutPassenger: Math.round((total - Number(s.passenger_km)) * 100) / 100,
  };
}
export function shiftTime(value: string) {
  return new Intl.DateTimeFormat("nl-BE", {
    timeZone: "Europe/Brussels",
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  }).format(new Date(value));
}

export function shiftDurations(
  detail: ShiftDetail,
): Record<ShiftStatus, number> {
  const result: Record<ShiftStatus, number> = {
    available: 0,
    driving_empty: 0,
    with_passenger: 0,
    break: 0,
  };
  const timeline = [
    ...detail.events,
    ...(detail.activity || []).filter(
      (a) => a.kind !== "declaration" && a.work_status,
    ),
  ].sort((a, b) => Date.parse(a.recorded_at) - Date.parse(b.recorded_at));
  for (let i = 0; i < timeline.length - 1; i++) {
    const status = timeline[i].work_status;
    if (status)
      result[status] +=
        Math.max(
          0,
          Date.parse(timeline[i + 1].recorded_at) -
            Date.parse(timeline[i].recorded_at),
        ) / 60000;
  }
  return result;
}
