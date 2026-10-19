import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import {
  shiftDeclaration,
  shiftKilometres,
  shiftTime,
} from "../src/lib/driver-shifts.ts";
import { memberEndpoint } from "../src/lib/security-policy.ts";
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
  await db.exec(sql("migrations/20261019_driver_shifts.sql"));
  await db.exec(
    `INSERT INTO companies(id,name) VALUES(1,'Synthetic Company'),(2,'Other Company');INSERT INTO vehicles(id,company_id,plate_number,status) VALUES(1,1,'TEST-1','active'),(2,2,'TEST-2','active');INSERT INTO drivers(id,user_id,company_id,current_vehicle_id,full_name,status) VALUES(1,10,1,1,'Synthetic Driver','active'),(2,20,2,2,'Other Driver','active'),(3,30,1,1,'Second Driver','active');`,
  );
  return db;
}
const save = (
  db,
  {
    user = 10,
    request = randomUUID(),
    id,
    action = "start",
    version = 0,
    odo = 100,
    passenger = 0,
    status = "available",
  },
) =>
  db
    .query(
      "SELECT security_record_driver_shift($1,$2,$3,$4,$5,$6,$7,$8) AS value",
      [user, request, action, id, version, odo, passenger, status],
    )
    .then((r) => r.rows[0].value);
const read = (db, user, id = null) =>
  db
    .query("SELECT security_driver_shifts($1,$2) AS value", [user, id])
    .then((r) => r.rows[0].value);
const bad = (promise, code) => assert.rejects(promise, (e) => e.code === code);
test("declarations accept explicit zero and decimal kilometres, reject GPS/owner fields and invalid values", () => {
  const b = {
    request_id: randomUUID(),
    shift_id: randomUUID(),
    action: "start",
    expected_version: 0,
    odometer: 0,
    passenger_km: 0,
    work_status: "available",
  };
  assert.equal(shiftDeclaration.safeParse(b).success, true);
  for (const patch of [
    { odometer: null },
    { odometer: "" },
    { odometer: -1 },
    { odometer: 1.001 },
    { odometer: NaN },
    { odometer: Infinity },
    { passenger_km: 1 },
    { expected_version: 1 },
    { latitude: 50 },
    { user_id: 20 },
    { work_status: "invented" },
  ])
    assert.equal(shiftDeclaration.safeParse({ ...b, ...patch }).success, false);
  assert.equal(
    shiftDeclaration.safeParse({ ...b, odometer: 217000.35 }).success,
    true,
  );
  assert.deepEqual(
    shiftKilometres({
      start_odometer: 100.1,
      odometer: 150.35,
      passenger_km: 20.15,
    }),
    { total: 50.25, passenger: 20.15, withoutPassenger: 30.1 },
  );
  assert.match(shiftTime("2026-10-25T01:30:00Z"), /02:30:00/);
  assert.equal(
    memberEndpoint("/next_api/drivers/shifts", "GET", "driver"),
    true,
  );
  assert.equal(
    memberEndpoint("/next_api/drivers/shifts", "POST", "driver"),
    true,
  );
  assert.equal(
    memberEndpoint("/next_api/drivers/shifts", "DELETE", "driver"),
    false,
  );
  assert.equal(
    memberEndpoint("/next_api/drivers/shifts", "POST", "manager"),
    false,
  );
});
test("service stores explicit readings and timestamps; idempotency, ownership, closed history and no historical backfill", async () => {
  const db = await setup();
  try {
    const id = randomUUID(),
      request = randomUUID();
    const s = await save(db, { id, request, odo: 100.1 });
    assert.equal(s.version, 1);
    assert.equal(s.ended_at, null);
    await save(db, { id, request, odo: 100.1 });
    assert.equal((await read(db, 10, id)).events.length, 1);
    await bad(save(db, { id, request, odo: 101 }), "40001");
    await bad(save(db, { id: randomUUID() }), "40001");
    await bad(save(db, { user: 30, id: randomUUID() }), "40001");
    await bad(
      save(db, { user: 20, id, action: "record", version: 1, odo: 101 }),
      "42501",
    );
    await bad(read(db, 20, id), "42501");
    await bad(read(db, 999), "42501");
    const r = await save(db, {
      id,
      action: "record",
      version: 1,
      odo: 110.5,
      passenger: 5.25,
      status: "driving_empty",
    });
    assert.equal(r.version, 2);
    for (const [odo, passenger] of [
      [110, 5.25],
      [111, 5],
      [111, 6],
      [111, -1],
    ])
      await bad(
        save(db, { id, action: "record", version: 2, odo, passenger }),
        "22023",
      );
    await bad(
      save(db, { id, action: "record", version: 1, odo: 120, passenger: 6 }),
      "40001",
    );
    await db.exec(
      "INSERT INTO trips(id,driver_id,status) VALUES(1,1,'in_progress')",
    );
    await bad(
      save(db, { id, action: "end", version: 2, odo: 120, passenger: 6 }),
      "40001",
    );
    await db.exec("UPDATE trips SET status='completed' WHERE id=1");
    const endRequest = randomUUID();
    const closed = await save(db, {
      id,
      request: endRequest,
      action: "end",
      version: 2,
      odo: 120.35,
      passenger: 10.25,
      status: "break",
    });
    assert.ok(closed.ended_at);
    await save(db, {
      id,
      request: endRequest,
      action: "end",
      version: 2,
      odo: 120.35,
      passenger: 10.25,
      status: "break",
    });
    await bad(
      save(db, { id, action: "record", version: 3, odo: 121, passenger: 11 }),
      "40001",
    );
    assert.equal((await read(db, 10)).active, null);
    const detail = await read(db, 10, id);
    assert.equal(detail.events.length, 3);
    assert.equal(detail.shift.plate_number, "TEST-1");
    assert.ok(detail.events.every((e) => e.recorded_at && !("latitude" in e)));
    await db.exec("UPDATE vehicles SET plate_number='CHANGED' WHERE id=1");
    assert.equal((await read(db, 10, id)).shift.plate_number, "TEST-1");
    await save(db, { id: randomUUID(), odo: 130 });
    assert.equal((await read(db, 10)).shifts.length, 2);
    assert.equal((await read(db, 20)).shifts.length, 0);
    await db.exec(sql("migrations/20261019_driver_shifts.sql"));
    assert.equal((await read(db, 10, id)).events.length, 3);
    await db.exec("SET ROLE browser");
    await bad(db.query("SELECT * FROM driver_shifts"), "42501");
    await bad(read(db, 10, id), "42501");
    await db.exec("RESET ROLE;SET ROLE service");
    await bad(db.query("DELETE FROM driver_shift_events"), "42501");
    await db.exec("RESET ROLE");
  } finally {
    await db.close();
  }
});
