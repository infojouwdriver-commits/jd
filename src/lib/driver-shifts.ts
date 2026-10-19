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
