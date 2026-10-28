// Shipped UI, actual migration and synthetic PostgreSQL WASM declarations. No production data.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href
);
const { PGlite } = await import(
  process.env.PGLITE_MODULE_PATH || "@electric-sql/pglite"
);
const base = "http://127.0.0.1:3018";
const qa = process.env.SHIFT_QA_DIR || path.join(os.tmpdir(), "jd-shift-qa");
fs.mkdirSync(qa, { recursive: true });
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3018",
  ],
  {
    env: {
      ...process.env,
      NODE_ENV: "production",
      APP_ORIGIN: base,
      JWT_SECRET: randomBytes(48).toString("hex"),
      POSTGREST_URL: "http://127.0.0.1:39999",
      POSTGREST_SCHEMA: "public",
      SCHEMA_USER: "browser",
      SCHEMA_ADMIN_USER: "service",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "ignore", "ignore"],
  },
);
const copy = {
  ar: {
    title: "كشف الوردية",
    start: "بدء الوردية",
    record: "تسجيل القراءة والحالة",
    end: "إنهاء الوردية",
    open: "عرض الكشف",
    closed: "وردية مغلقة",
    status: "استراحة",
    print: "تنزيل PDF بالهولندية",
  },
  fr: {
    title: "Feuille de service",
    start: "Commencer le service",
    record: "Enregistrer le compteur et l’état",
    end: "Terminer le service",
    open: "Voir la feuille",
    closed: "Service terminé",
    status: "Pause",
    print: "Télécharger le PDF en néerlandais",
  },
  nl: {
    title: "Dienststaat",
    start: "Dienst beginnen",
    record: "Teller en status registreren",
    end: "Dienst beëindigen",
    open: "Dienststaat bekijken",
    closed: "Afgesloten dienst",
    status: "Pauze",
    print: "PDF downloaden (Nederlands)",
  },
};
const checks = [];
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      ready = (await fetch(base + "/login")).ok;
    } catch {}
    if (ready) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(ready);
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.UI_CHROMIUM_PATH || undefined,
  });
  for (const lang of ["ar", "fr", "nl"])
    for (const theme of ["light", "dark"]) {
      const db = new PGlite();
      await db.waitReady;
      const sql = (file) =>
        fs
          .readFileSync(new URL("../" + file, import.meta.url), "utf8")
          .replaceAll(':"schema"', "public")
          .replaceAll(':"user_role"', "browser")
          .replaceAll(':"admin_role"', "service");
      await db.exec(
        "CREATE ROLE browser;CREATE ROLE service;" +
          sql("schema/reconstructed-staging.sql"),
      );
      for (const file of [
        "migrations/20261010_release.sql",
        "migrations/20261010_trip_invoice.sql",
        "migrations/20261019_driver_shifts.sql",
        "migrations/20261019_shift_activity.sql",
        "migrations/20261027_shift_conflict_retry.sql",
      ])
        await db.exec(sql(file));
      await db.exec(
        "INSERT INTO companies(id,name) VALUES(1,'Synthetic company');INSERT INTO vehicles(id,company_id,plate_number,status) VALUES(1,1,'TEST-1','active');INSERT INTO drivers(id,user_id,company_id,current_vehicle_id,full_name,status) VALUES(1,2,1,1,'Synthetic Driver','active');",
      );
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        serviceWorkers: "block",
        reducedMotion: "reduce",
      });
      await context.addInitScript(
        ({ lang, theme }) => {
          localStorage.setItem("driver_language", lang);
          localStorage.setItem("theme", theme);
          localStorage.setItem(
            "gdpr_cookie_consent",
            JSON.stringify({
              version: "1.0",
              timestamp: new Date().toISOString(),
              categories: {
                essential: true,
                analytics: false,
                marketing: false,
              },
            }),
          );
        },
        { lang, theme },
      );
      let failAfterCommit = lang === "fr" && theme === "dark",
        writes = [];
      await context.route("**/*", async (route) => {
        const r = route.request(),
          u = new URL(r.url());
        if (u.origin !== base) return route.abort();
        if (!u.pathname.startsWith("/next_api/")) return route.continue();
        let data = [];
        if (u.pathname === "/next_api/auth/user")
          data = {
            sub: "2",
            email: "synthetic@example.invalid",
            isAdmin: false,
            userType: "driver",
          };
        else if (u.pathname === "/next_api/drivers/me")
          data = {
            driver: { id: 1, full_name: "Synthetic Driver" },
            company: { id: 1, name: "Synthetic company" },
          };
        else if (u.pathname === "/next_api/drivers/pricing")
          data = {
            company_id: 1,
            company_name: "Synthetic company",
            pricing: {
              base_fee: 3,
              km_rate: 2,
              minute_rate: 0.3,
              minimum_fare: 10,
            },
            chiron_mode: "TEST",
          };
        else if (u.pathname === "/next_api/drivers/vehicles")
          data = {
            vehicles: [{ id: 1, plate_number: "TEST-1" }],
            current_vehicle_id: 1,
            driver_id: 1,
          };
        else if (u.pathname === "/next_api/drivers/shifts") {
          if (r.method() === "POST") {
            const b = r.postDataJSON();
            writes.push(b);
            try {
              if (b.action === "status")
                data = (
                  await db.query(
                    "SELECT security_shift_status($1,$2,$3,$4,$5) v",
                    [
                      2,
                      b.request_id,
                      b.shift_id,
                      b.expected_version,
                      b.work_status,
                    ],
                  )
                ).rows[0].v;
              else
                data = (
                  await db.query(
                    "SELECT security_record_driver_shift($1,$2,$3,$4,$5,$6,$7,$8) v",
                    [
                      2,
                      b.request_id,
                      b.action,
                      b.shift_id,
                      b.expected_version,
                      b.odometer,
                      b.passenger_km,
                      b.work_status,
                    ],
                  )
                ).rows[0].v;
            } catch (e) {
              return route.fulfill({
                status: e.code === "23505" ? 409 : 400,
                contentType: "application/json",
                body: JSON.stringify({
                  success: false,
                  errorMessage: "Invalid declaration",
                  errorCode: "SHIFT_READINGS",
                }),
              });
            }
            if (failAfterCommit) {
              failAfterCommit = false;
              return route.fulfill({
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({
                  success: false,
                  errorMessage: "Request failed",
                }),
              });
            }
          } else
            data = (
              await db.query("SELECT security_driver_shifts($1,$2,$3) v", [
                2,
                u.searchParams.get("id"),
                Number(u.searchParams.get("offset") || 0),
              ])
            ).rows[0].v;
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data }),
        });
      });
      const page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const c = copy[lang];
      console.log("Testing shift cockpit",lang,theme);
      page.setDefaultTimeout(15000);
      await page.goto(base + "/driver/taximeter");
      await page.getByRole("link", {name:c.start,exact:true}).waitFor();
      assert.equal(await page.locator("#operation-odometer").count(),0);
      await page.getByRole("link", {name:c.start,exact:true}).click();
      await page.getByRole("form", {name:c.start,exact:true}).waitFor();
      if (lang === "ar" && theme === "light")
        await page.screenshot({
          path: path.join(qa, "shift-first-start-ar.png"),
          fullPage: true,
        });
      assert.equal(await page.getByRole("dialog").count(),0,"Start reading is inline in the shift card");
      await page.locator("#operation-odometer").fill("100.10");
      await page.getByRole("form",{name:c.start,exact:true}).getByRole("button",{name:c.start,exact:true}).click();
      if (lang === "fr" && theme === "dark") {
        const startForm=page.getByRole("form",{name:c.start,exact:true});
        await startForm.getByRole("alert").waitFor();
        assert.equal(await page.locator("#operation-odometer").isDisabled(),true);
        // Ambiguous inline submission keeps the exact original identity and readings.
        await startForm.getByRole("button", {name:/Réessayer/}).click();
      }
      console.log("Shift start confirmed", lang, theme);
      await page.waitForURL(base + "/driver/taximeter");
      assert.equal(await page.locator(".shift-controls").count(),0,"No shift controls above taximeter");
      assert.equal(await page.getByTestId("fleet-sharing-indicator").count(),1,"GPS sharing stays mounted");
      assert.equal(
        (await db.query("SELECT count(*) n FROM driver_shift_events")).rows[0]
          .n,
        1,
      );
      await page.goto(base + "/driver/trips");
      assert.equal(await page.locator(".shift-controls").count(),0);
      await page.goto(base + "/driver/home");
      const pause = { ar: "استراحة", fr: "Pause", nl: "Pauze" }[lang];
      const resume = {
        ar: "استئناف العمل",
        fr: "Reprendre le travail",
        nl: "Werk hervatten",
      }[lang];
      await page.getByRole("button", { name: pause, exact: true }).click();
      await page.getByRole("button", { name: resume, exact: true }).waitFor();
      await page.reload();
      await page.getByRole("button", { name: resume, exact: true }).waitFor();
      if (lang === "ar" && theme === "dark")
        await page.screenshot({
          path: path.join(qa, "shift-first-break-ar.png"),
          fullPage: true,
        });
      await page.getByRole("button", { name: resume, exact: true }).click();
      await page.getByRole("button", { name: pause, exact: true }).waitFor();
      assert.equal(
        (await db.query("SELECT count(*) n FROM driver_shifts")).rows[0].n,
        1,
      );
      assert.equal(
        Number(
          (await db.query("SELECT odometer FROM driver_shifts")).rows[0]
            .odometer,
        ),
        100.1,
      );
      await page.goto(base + "/driver/home");
      await page.getByRole("button", { name: c.record, exact: true }).click();
      await page.locator("#operation-odometer").fill("110.50");
      await page.locator("#operation-passenger_km").fill("5.25");
      await page.locator("#operation-work_status").click();
      await page.getByRole("option", { name: c.status, exact: true }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: c.record, exact: true })
        .click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.reload();
      await page.getByRole("button", { name: c.end, exact: true }).waitFor();
      await page.getByRole("button", { name: c.end, exact: true }).click();
      await page.locator("#operation-odometer").fill("120.35");
      await page.locator("#operation-passenger_km").fill("10.25");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: c.end, exact: true })
        .click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.goto(base + "/driver/shifts");
      assert.equal(await page.getByRole("button", {name:c.end,exact:true}).count(),0);
      await page.getByRole("button", {name:c.open,exact:true}).first().click();
      await page
        .locator(".shift-print-sheet")
        .getByText(c.closed, { exact: false })
        .waitFor();
      await page.getByText("20.25 km", { exact: true }).waitFor();
      await page.getByText("10.00 km", { exact: true }).waitFor();
      assert.equal(
        (await db.query("SELECT count(*) n FROM driver_shift_events")).rows[0].n, 3,
      );
      assert.equal(
        await page.locator("html").getAttribute("dir"),
        lang === "ar" ? "rtl" : "ltr",
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
        false,
      );
      if (lang === "ar" && theme === "dark") {
        await page.screenshot({
          path: path.join(qa, "shift-qa-ar.png"),
          fullPage: true,
        });
      }
      if (lang === "fr" && theme === "light") {
        await page.screenshot({
          path: path.join(qa, "shift-qa-fr.png"),
          fullPage: true,
        });
      }
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: c.print, exact: true }).click(),
      ]);
      assert.match(download.suggestedFilename(), /^Dienststaat-.*\.pdf$/);
      const pdfPath = path.join(qa, `dienststaat-${lang}-${theme}.pdf`);
      await download.saveAs(pdfPath);
      assert.equal(fs.readFileSync(pdfPath).subarray(0, 5).toString(), "%PDF-");
      await page.emulateMedia({ media: "print" });
      assert.equal(await page.locator(".dp-app-header").isVisible(), false);
      assert.equal(await page.locator(".dp-tab-bar").isVisible(), false);
      assert.equal(await page.locator(".shift-print-sheet").isVisible(), true);
      assert.deepEqual(errors, []);
      checks.push(
        `${lang}/${theme}: explicit decimal readings, state change, durable reload, closed report, real Dutch PDF download, printable sheet, narrow layout`,
      );
      await context.close();
      await db.close();
    }
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
