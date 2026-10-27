import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { shiftDurations, shiftStatusChange } from "../src/lib/driver-shifts.ts";
const { PGlite } = await import(
  process.env.PGLITE_MODULE_PATH || "@electric-sql/pglite"
);
const sql = (file) =>
  fs
    .readFileSync(new URL("../" + file, import.meta.url), "utf8")
    .replaceAll(':"schema"', "public")
    .replaceAll(':"user_role"', "browser")
    .replaceAll(':"admin_role"', "service");
async function setup() {
  const db = new PGlite();
  await db.waitReady;
  await db.exec(
    "CREATE ROLE browser; CREATE ROLE service;" +
      sql("schema/reconstructed-staging.sql"),
  );
  await db.exec(sql("migrations/20261010_release.sql"));
  await db.exec(sql("migrations/20261010_trip_invoice.sql"));
  await db.exec(sql("migrations/20261019_driver_shifts.sql"));
  await db.exec(sql("migrations/20261019_shift_activity.sql"));
  await db.exec(sql("migrations/20261027_shift_conflict_retry.sql"));
  await db.exec(
    `ALTER TABLE trips ADD COLUMN is_test boolean DEFAULT false;INSERT INTO companies(id,name) VALUES(1,'Synthetic');INSERT INTO vehicles(id,company_id,plate_number,status) VALUES(1,1,'TEST-1','active'),(2,1,'TEST-2','active');INSERT INTO drivers(id,user_id,company_id,current_vehicle_id,full_name,status) VALUES(1,10,1,1,'Synthetic Driver','active');`,
  );
  return db;
}
async function open(db) {
  const id = randomUUID();
  return (
    await db.query(
      "SELECT security_record_driver_shift(10,$1,'start',$2,0,100,0,'available') s",
      [randomUUID(), id],
    )
  ).rows[0].s;
}
const read = async (db, id) =>
  (await db.query("SELECT security_driver_shifts(10,$1) s", [id])).rows[0].s;
test("pause/resume, all submitted trip sources, shift summaries and immutable activity preserve explicit readings", async () => {
  const db = await setup();
  try {
    await db.exec(
      "UPDATE companies SET address='Synthetic street',vat_number='BE0000000000',phone='+32000000000',email='synthetic@example.invalid' WHERE id=1;UPDATE drivers SET bestuurderspas_number='CARD-TEST' WHERE id=1;",
    );
    const s = await open(db),
      pause = randomUUID();
    assert.equal(s.document_profile.company_address, "Synthetic street");
    assert.equal(s.document_profile.driver_card, "CARD-TEST");
    await db.exec("UPDATE companies SET address='Changed later' WHERE id=1");
    assert.equal(
      (await read(db, s.id)).shift.document_profile.company_address,
      "Synthetic street",
    );
    const change = (request, version, status, user = 10) =>
      db.query("SELECT security_shift_status($1,$2,$3,$4,$5) s", [
        user,
        request,
        s.id,
        version,
        status,
      ]);
    await change(pause, 1, "break");
    await change(pause, 1, "break");
    let detail = await read(db, s.id);
    assert.equal(detail.shift.work_status, "break");
    assert.equal(detail.shift.version, 2);
    assert.equal(detail.events.length, 1);
    assert.equal(detail.shift.odometer, 100);
    assert.equal(detail.activity.length, 2);
    await assert.rejects(
      change(randomUUID(), 2, "available", 20),
      (e) => e.code === "42501",
    );
    await assert.rejects(
      change(randomUUID(), 1, "available"),
      (e) => e.code === "23505",
    );
    await change(randomUUID(), 2, "available");
    await db.exec(
      `INSERT INTO trips(id,user_id,driver_id,company_id,vehicle_id,status,start_time,external_source,distance_km) VALUES(1,10,1,1,1,'in_progress',clock_timestamp(),'Uber',15);`,
    );
    detail = await read(db, s.id);
    assert.equal(detail.shift.work_status, "with_passenger");
    assert.equal(
      detail.activity.filter((a) => a.kind === "trip_start").length,
      1,
    );
    assert.equal(
      (await db.query("SELECT shift_id FROM trips WHERE id=1")).rows[0]
        .shift_id,
      s.id,
    );
    await assert.rejects(
      change(randomUUID(), detail.shift.version, "break"),
      (e) => e.code === "23505",
    );
    await db.exec(
      "UPDATE trips SET status='completed',end_time=clock_timestamp(),price=25 WHERE id=1;UPDATE trips SET sync_error_message='retry' WHERE id=1;",
    );
    detail = await read(db, s.id);
    assert.equal(detail.shift.work_status, "available");
    assert.equal(detail.shift.odometer, 100);
    assert.equal(detail.shift.passenger_km, 0);
    assert.equal(
      detail.activity.filter((a) => a.kind === "trip_end").length,
      1,
    );
    await db.exec(
      `INSERT INTO trips(id,user_id,driver_id,company_id,vehicle_id,status,start_time,end_time,external_source,price) VALUES(2,10,1,1,1,'completed',clock_timestamp(),clock_timestamp(),'Bolt',20),(3,10,1,1,2,'completed',clock_timestamp(),clock_timestamp(),'meter',10),(4,10,1,1,1,'completed','2020-01-01','2020-01-01','Heetch',10),(5,10,1,1,1,'completed',clock_timestamp(),clock_timestamp(),'meter',10);`,
    );
    const links = (await db.query("SELECT id,shift_id FROM trips ORDER BY id"))
      .rows;
    assert.equal(links[1].shift_id, s.id);
    assert.equal(links[2].shift_id, null);
    assert.equal(links[3].shift_id, null);
    assert.equal(links[4].shift_id, s.id);
    detail = await read(db, s.id);
    assert.equal(detail.summary.trip_count, 3);
    assert.equal(detail.summary.payments[0].total, 55);
    assert.equal(detail.summary.payments[0].unknown, 55);
    await db.exec(
      "INSERT INTO trips(id,user_id,driver_id,company_id,vehicle_id,status,start_time,end_time,price,currency,payment_method) VALUES(7,10,1,1,1,'completed',clock_timestamp(),clock_timestamp(),12.50,'EUR','cash'),(8,10,1,1,1,'completed',clock_timestamp(),clock_timestamp(),8.25,'EUR','card'),(9,10,1,1,1,'completed',clock_timestamp(),clock_timestamp(),4.50,'USD','app');",
    );
    const payments = (await read(db, s.id)).summary.payments;
    assert.equal(payments.find((p) => p.currency === "EUR").total, 20.75);
    assert.equal(payments.find((p) => p.currency === "EUR").cash, 12.5);
    assert.equal(payments.find((p) => p.currency === "EUR").card, 8.25);
    assert.equal(payments.find((p) => p.currency === "USD").other, 4.5);
    // The shift migration must not change customer invoice snapshots.
    const receipt = { trip: { ritnummer: "TEST" } };
    const invoice = (
      await db.query("SELECT security_create_trip_invoice(1,10,$1,$2) i", [
        { client_name: "Synthetic" },
        receipt,
      ])
    ).rows[0].i;
    assert.deepEqual(invoice.receipt_snapshot.trip, receipt.trip);
    detail = await read(db, s.id);
    await db.query(
      "SELECT security_record_driver_shift(10,$1,'end',$2,$3,120,10,'available')",
      [randomUUID(), s.id, detail.shift.version],
    );
    const closedSummary=(await read(db,s.id)).summary;
    await db.exec("UPDATE trips SET price=999 WHERE id=7");
    assert.deepEqual((await read(db,s.id)).summary,closedSummary);
    const count = (await read(db, s.id)).activity.length;
    assert.equal(closedSummary.activity_count,count);
    await db.exec(
      "INSERT INTO trips(id,user_id,driver_id,company_id,vehicle_id,status,start_time) VALUES(6,10,1,1,1,'in_progress',clock_timestamp());",
    );
    assert.equal((await read(db, s.id)).activity.length, count);
    await db.exec(
      "GRANT UPDATE,DELETE ON driver_shift_activity TO service;SET ROLE service;",
    );
    await assert.rejects(
      db.exec("DELETE FROM driver_shift_activity"),
      (e) => e.code === "55000",
    );
  } finally {
    await db.close();
  }
});
test("status input rejects invented counters and durations include real status events", () => {
  assert.equal(
    shiftStatusChange.safeParse({
      action: "status",
      request_id: randomUUID(),
      shift_id: randomUUID(),
      expected_version: 1,
      work_status: "break",
      odometer: 0,
    }).success,
    false,
  );
  const result = shiftDurations({
    events: [
      { recorded_at: "2026-10-19T08:00:00Z", work_status: "available" },
      { recorded_at: "2026-10-19T09:00:00Z", work_status: "available" },
    ],
    activity: [
      {
        kind: "status",
        recorded_at: "2026-10-19T08:15:00Z",
        work_status: "break",
      },
      {
        kind: "status",
        recorded_at: "2026-10-19T08:45:00Z",
        work_status: "available",
      },
    ],
  });
  assert.equal(result.break, 30);
  assert.equal(result.available, 30);
});

test("durable local meter status replays after reload, blocks break/closure and completes without inferred counters", async () => {
  const db = await setup();
  try {
    const s = await open(db),
      key = randomUUID();
    await db.query(
      "SELECT security_shift_status(10,$1,$2,1,'with_passenger')",
      [key, s.id],
    );
    await db.query(
      "SELECT security_shift_status(10,$1,$2,2,'with_passenger')",
      [key, s.id],
    );
    let d = await read(db, s.id);
    assert.equal(d.shift.version, 2);
    await assert.rejects(
      db.query("SELECT security_shift_status(10,$1,$2,2,'break')", [
        randomUUID(),
        s.id,
      ]),
      (e) => e.code === "23505",
    );
    await assert.rejects(
      db.query(
        "SELECT security_record_driver_shift(10,$1,'end',$2,2,110,5,'available')",
        [randomUUID(), s.id],
      ),
      (e) => e.code === "23505",
    );
    await db.query(
      "INSERT INTO trips(user_id,driver_id,company_id,vehicle_id,status,start_time,end_time,price,completion_request_key) VALUES(10,1,1,1,'completed',clock_timestamp(),clock_timestamp(),25,$1)",
      [key],
    );
    d = await read(db, s.id);
    assert.equal(d.shift.work_status, "available");
    assert.equal(d.shift.odometer, 100);
    assert.equal(d.shift.passenger_km, 0);
    await db.query(
      "SELECT security_shift_status(10,$1,$2,$3,'with_passenger')",
      [key, s.id, d.shift.version],
    );
    assert.equal((await read(db, s.id)).shift.work_status, "available");
  } finally {
    await db.close();
  }
});

test("completion RPC conflict retry does not emit phantom trip activity", async () => {
  const db = await setup();
  try {
    const s = await open(db),
      key = randomUUID();
    const body = {
      driver_id: 1,
      company_id: 1,
      vehicle_id: 1,
      status: "completed",
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      price: 25,
      external_source: "Bolt",
    };
    const first = (
      await db.query("SELECT security_save_completed_trip($1,10,$2) s", [
        body,
        key,
      ])
    ).rows[0].s;
    const second = (
      await db.query("SELECT security_save_completed_trip($1,10,$2) s", [
        body,
        key,
      ])
    ).rows[0].s;
    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(first.trip.id, second.trip.id);
    const activity = (await read(db, s.id)).activity.filter((a) => a.trip_id);
    assert.equal(activity.length, 2);
    assert.ok(activity.every((a) => a.trip_id === first.trip.id));
  } finally {
    await db.close();
  }
});
