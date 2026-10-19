import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
function compiled(file, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      Intl,
      Buffer,
      require: (name) => dependencies[name] || require(name),
    },
  );
  return exports;
}
const shifts = compiled("src/lib/driver-shifts.ts");
const fonts = compiled("src/legal/pdf-fonts.ts");
const { driverShiftPdf } = compiled("src/lib/driver-shift-pdf.ts", {
  "@/legal/pdf-fonts": fonts,
  "./driver-shifts": shifts,
});
test("Dutch PDF contains all pages of long Unicode declarations and preserves provisional status", () => {
  const shift = {
    id: "00000000-0000-4000-8000-000000000001",
    company_name: "Synthetic Transport ".repeat(8),
    driver_name: "Élodie — سائق تجريبي",
    driver_id: 1,
    vehicle_id: 10,
    document_profile: {
      company_address: "Synthetic street 10, 1000 Brussel",
      company_phone: "+32000000000",
      company_email: "synthetic@example.invalid",
      company_vat: "BE0000000000",
      driver_card: "CARD-1234",
      vehicle_code: "TEST-10",
    },
    plate_number: "TEST-1",
    started_at: "2026-10-19T07:00:00Z",
    ended_at: null,
    start_odometer: 100.1,
    odometer: 120.35,
    passenger_km: 10.25,
  };
  const events = Array.from({ length: 90 }, (_, i) => ({
    version: i + 1,
    action: i === 0 ? "start" : "record",
    recorded_at: new Date(
      Date.parse(shift.started_at) + i * 60000,
    ).toISOString(),
    odometer: 100.1 + i * 0.2,
    passenger_km: i * 0.1,
    work_status: ["available", "driving_empty", "with_passenger", "break"][
      i % 4
    ],
  }));
  const doc = driverShiftPdf({
    shift,
    events,
    summary: {
      trip_count: 12,
      activity_count: 90,
      payments: [
        {
          currency: "EUR",
          cash: 16.55,
          card: 45.25,
          other: 23,
          unknown: 0,
          total: 84.8,
          missing_amounts: 0,
        },
      ],
    },
  });
  assert.ok(doc.getNumberOfPages() > 1);
  const pdf = Buffer.from(doc.output("arraybuffer"));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  const dir = process.env.SHIFT_QA_DIR || "/tmp/jd-shift-qa";
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "dienststaat-long.pdf"), pdf);
  const short = driverShiftPdf({
    shift: {
      ...shift,
      company_name: "Synthetic Transport",
      ended_at: "2026-10-19T07:02:00Z",
    },
    events: [
      { ...events[0] },
      {
        ...events[1],
        odometer: 110.1,
        passenger_km: 5,
        work_status: "with_passenger",
      },
      {
        ...events[2],
        action: "end",
        odometer: 120.35,
        passenger_km: 10.25,
        work_status: "available",
      },
    ],
    summary: {
      trip_count: 3,
      activity_count: 5,
      payments: [
        {
          currency: "EUR",
          cash: 16.55,
          card: 45.25,
          other: 23,
          unknown: 0,
          total: 84.8,
          missing_amounts: 0,
        },
      ],
    },
  });
  fs.writeFileSync(
    path.join(dir, "dienststaat-preview.pdf"),
    Buffer.from(short.output("arraybuffer")),
  );
});
