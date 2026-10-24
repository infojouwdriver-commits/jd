import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { DEFAULT_WELCOME } from "../driver-app/src/welcome-config.ts";
const { chromium } = await import(
  process.env.UI_PLAYWRIGHT_PATH || "playwright"
);
const base = "http://127.0.0.1:3027",
  out = process.env.WELCOME_QA_DIR || "/tmp/jd-welcome-qa";
fs.mkdirSync(out, { recursive: true });
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3027",
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
    stdio: "ignore",
  },
);
let browser;
const checks = [];
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
  browser = await chromium.launch({ headless: true });
  for (const language of ["ar", "fr", "nl"])
    for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
        serviceWorkers: "block",
      });
      await context.addInitScript(
        ({ language, theme }) => {
          localStorage.setItem("driver_language", language);
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
        { language, theme },
      );
      let config = structuredClone(DEFAULT_WELCOME),
        writes = 0,
        mode = "success",
        release;
      await context.route("**/*", async (route) => {
        const u = new URL(route.request().url());
        if (u.origin !== base) return route.abort();
        if (!u.pathname.startsWith("/next_api/")) return route.continue();
        let data = [];
        if (u.pathname === "/next_api/auth/user")
          data = { sub: "1", email: "admin@example.invalid", isAdmin: true };
        else if (u.pathname === "/next_api/app-experience") {
          if (route.request().method() === "GET") data = config;
          else {
            writes++;
            const draft = route.request().postDataJSON();
            assert.equal(draft.version, config.version);
            if (mode === "conflict")
              return route.fulfill({
                status: 409,
                contentType: "application/json",
                body: JSON.stringify({ success: false }),
              });
            await new Promise((r) => {
              release = r;
            });
            config = { ...draft, version: config.version + 1 };
            data = config;
          }
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
      await page.goto(base + "/admin/app-experience");
      const form = page.locator("form"),
        title = page.locator("#welcome-title-ar");
      await title.waitFor();
      await title.fill("عنوان ترحيب تجريبي");
      assert.ok(await form.locator('button[type="submit"]').isEnabled());
      await form.locator('button[type="submit"]').click();
      await page.waitForFunction(
        () => document.querySelector('form button[type="submit"]')?.disabled,
      );
      assert.equal(await title.isDisabled(), true);
      while (!release) await new Promise((r) => setTimeout(r, 10));
      release();
      await page.waitForFunction(
        () => !document.querySelector("#welcome-title-ar")?.disabled,
      );
      assert.equal(writes, 1);
      assert.equal(config.title.ar, "عنوان ترحيب تجريبي");
      assert.equal(
        await form.locator('button[type="submit"]').isDisabled(),
        true,
      );
      await page.locator("#welcome-image").setInputFiles({
        name: "bad.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from("<svg/>"),
      });
      await page.locator('#welcome-image[aria-invalid="true"]').waitFor();
      if (language === "fr" && theme === "light")
        await page.evaluate(() => {
          const original = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function (type, quality) {
            return original.call(
              this,
              type === "image/webp" ? "image/png" : type,
              quality,
            );
          };
        });
      await page
        .locator("#welcome-image")
        .setInputFiles("public/app-brand/welcome.jpg");
      await page.waitForFunction(
        () =>
          document
            .querySelector("#welcome-image")
            ?.getAttribute("aria-invalid") === "false" &&
          !document.querySelector("#welcome-image")?.disabled,
      );
      mode = "conflict";
      await form.locator('button[type="submit"]').click();
      await page
        .getByRole("alert")
        .filter({ hasNotText: "SVG" })
        .first()
        .waitFor();
      assert.equal(await title.inputValue(), "عنوان ترحيب تجريبي");
      // Dirty reload uses the shared confirmation; cancelling preserves the draft.
      await form.locator('button[type="button"]').last().click();
      const dialog = page.getByRole("alertdialog");
      await dialog.waitFor();
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert.equal(await title.inputValue(), "عنوان ترحيب تجريبي");
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= 390),
      );
      assert.equal(
        await page
          .locator(".jd-welcome-poster")
          .evaluate((el) => getComputedStyle(el).animationName),
        "none",
      );
      await page.screenshot({
        path: path.join(out, `admin-${language}-${theme}.png`),
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      checks.push(
        language +
          "/" +
          theme +
          ": preview, publish/busy lock, raster processing, invalid type, conflict draft, discard cancel, narrow layout, reduced motion",
      );
      await context.close();
    }
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  fs.writeFileSync(
    path.join(out, "result.json"),
    JSON.stringify({ passed: checks.length, checks }, null, 2),
  );
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
