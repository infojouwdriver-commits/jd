import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  DEFAULT_WELCOME,
  parseWelcomeSave,
} from "../src/lib/app-experience.ts";
import { welcomePayload } from "../driver-app/src/welcome-config.ts";
import { publicEndpoint, memberEndpoint } from "../src/lib/security-policy.ts";
const { PGlite } = await import(
  process.env.PGLITE_MODULE_PATH || "@electric-sql/pglite"
);
test("welcome allows anonymous GET only; company and driver sessions cannot publish", () => {
  assert.equal(publicEndpoint("/next_api/app-experience", "GET"), true);
  for (const method of ["POST", "PUT", "DELETE"]) {
    assert.equal(publicEndpoint("/next_api/app-experience", method), false);
    for (const role of ["driver", "owner", "company", "manager", "distributor"])
      assert.equal(
        memberEndpoint("/next_api/app-experience", method, role),
        false,
      );
  }
});
test("poster upload checks actual raster magic and canonical bounded base64", () => {
  const header = Buffer.alloc(32);
  header.write("RIFF");
  header.write("WEBP", 8);
  const good = {
    ...DEFAULT_WELCOME,
    poster_data: "data:image/webp;base64," + header.toString("base64"),
  };
  assert.ok(parseWelcomeSave(good));
  for (const value of [
    "data:image/webp;base64," +
      Buffer.from("<svg>" + "a".repeat(40)).toString("base64"),
    good.poster_data + "A",
    "data:image/png;base64," + header.toString("base64"),
  ])
    assert.equal(
      parseWelcomeSave({ ...DEFAULT_WELCOME, poster_data: value }),
      null,
    );
});
test("welcome migration keeps one public config, serializes changes, records actor, and denies browser SQL", async () => {
  const db = new PGlite();
  await db.waitReady;
  try {
    await db.exec(
      "CREATE ROLE browser;CREATE ROLE service;CREATE TABLE users(id bigint PRIMARY KEY,is_active boolean);INSERT INTO users VALUES(1,true),(2,false);",
    );
    const sql = fs
      .readFileSync("migrations/20261023_app_experience.sql", "utf8")
      .replaceAll(':"schema"', "public")
      .replaceAll(':"user_role"', "browser")
      .replaceAll(':"admin_role"', "service");
    await db.exec(sql);
    await db.exec(sql);
    const save = (actor, version, data) =>
      db.query("SELECT security_save_app_experience($1,$2,$3) AS value", [
        actor,
        version,
        data,
      ]);
    const result = await save(
      1,
      0,
      welcomePayload({ ...DEFAULT_WELCOME, motion: false }),
    );
    assert.equal(result.rows[0].value.version, 1);
    assert.equal(result.rows[0].value.motion, false);
    assert.ok(!("updated_by" in result.rows[0].value));
    await assert.rejects(
      save(1, 0, welcomePayload(DEFAULT_WELCOME)),
      (e) => e.code === "40001",
    );
    await assert.rejects(
      save(2, 1, welcomePayload(DEFAULT_WELCOME)),
      (e) => e.code === "42501",
    );
    await assert.rejects(
      save(1, 1, { ...welcomePayload(DEFAULT_WELCOME), api_origin: "bad" }),
      (e) => e.code === "22023",
    );
    await assert.rejects(
      save(1, 1, {
        ...welcomePayload(DEFAULT_WELCOME),
        title: { fr: "missing locales" },
      }),
      (e) => e.code === "22023",
    );
    assert.equal(
      (await db.query("SELECT count(*)::integer n FROM app_experience_events"))
        .rows[0].n,
      1,
    );
    await db.exec("SET ROLE browser");
    await assert.rejects(
      db.query("SELECT * FROM app_experience_settings"),
      (e) => e.code === "42501",
    );
    await assert.rejects(
      save(1, 1, welcomePayload(DEFAULT_WELCOME)),
      (e) => e.code === "42501",
    );
    await db.exec("RESET ROLE");
    assert.equal(
      (
        await db.query(
          "SELECT count(*)::integer n FROM app_experience_settings",
        )
      ).rows[0].n,
      1,
    );
  } finally {
    await db.close();
  }
});
