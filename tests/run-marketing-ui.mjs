import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
const output = process.env.MARKETING_QA_DIR || "/workspace/scratch";
const portal = process.env.PORTAL_QA_ORIGIN || "";
assert.ok(["", "https://app.jouww.com"].includes(portal));
fs.mkdirSync(output, { recursive: true });
const { chromium } = await import(
  pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href
);
const base = "http://127.0.0.1:3024";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3024",
  ],
  {
    env: {
      ...process.env,
      NODE_ENV: "production",
      APP_ORIGIN: base,
      JWT_SECRET: randomBytes(48).toString("hex"),
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "ignore",
  },
);
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      ready = (await fetch(base)).ok;
    } catch {}
    if (ready) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(ready, "Production preview ready");
  browser = await chromium.launch({
    headless: true,
    ...(process.env.UI_CHROMIUM_PATH
      ? { executablePath: process.env.UI_CHROMIUM_PATH }
      : {}),
  });
  for (const language of ["ar", "fr", "nl"])
    for (const width of [320, 390, 1280]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
        serviceWorkers: "block",
      });
      await context.addInitScript((l) => {
        localStorage.setItem("driver_language", l);
        localStorage.setItem(
          "gdpr_cookie_consent",
          JSON.stringify({
            version: "1.0",
            timestamp: new Date().toISOString(),
            categories: { essential: true, analytics: false, marketing: false },
          }),
        );
      }, language);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base);
      await page.waitForSelector(".pm");
      await page.waitForFunction(
        (l) =>
          document.querySelector(".pm").getAttribute("dir") ===
          (l === "ar" ? "rtl" : "ltr"),
        language,
      );
      assert.equal(
        await page.locator(".pm").getAttribute("dir"),
        language === "ar" ? "rtl" : "ltr",
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        "No horizontal overflow",
      );
      for (let i = 0; i < 4; i++) {
        await page.locator(`#journey-${i}`).click();
        assert.equal(
          await page.locator(`#journey-${i}`).getAttribute("aria-selected"),
          "true",
        );
        assert.equal(
          await page.locator("#journey-panel").getAttribute("aria-labelledby"),
          `journey-${i}`,
        );
      }
      for (let i = 0; i < 3; i++) {
        await page.locator(`#role-${i}`).click();
        assert.equal(
          await page.locator("#role-panel a").getAttribute("href"),
          portal + ["/driver-login", "/login?portal=company", "/login"][i],
        );
      }
      await page.locator("#role-0").click();
      await page.locator("#role-0").press("ArrowRight");
      assert.equal(
        await page.locator("#role-1").getAttribute("aria-selected"),
        "true",
      );
      for (const selector of [".pm-car", ".pm-orbit-one", ".pm-phone"])
        assert.equal(
          await page
            .locator(selector)
            .first()
            .evaluate((el) => getComputedStyle(el).animationName),
          "none",
        );
      for (const anchor of await page
        .locator(".pm-links a, .pm-hero-index a, .pm-secondary")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))))
        assert.equal(await page.locator(anchor).count(), 1, "Anchor resolves");
      if (portal) {
        assert.equal(await page.getByRole("dialog").count(), 0);
        await context.route(portal + "/**", route => {
          assert.equal(route.request().method(), "GET");
          return route.fulfill({contentType: "text/html", body: "<h1>Isolated portal handoff fixture</h1>"});
        });
        await page.locator(".pm-hero-copy .pm-button").first().click();
        await page.waitForURL(portal + "/register-company?lang=" + language);
        await page.goto(base);
        await page.waitForSelector(".pm");
      } else {
      await page.locator(".pm-hero-copy .pm-button").first().click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor({ state: "visible" });
      assert.ok(
        (await dialog.locator("input").count()) > 0,
        "Registration opens the real company form",
      );
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      await page.waitForFunction(
        () =>
          document.querySelector(".pm-hero-copy .pm-button") ===
          document.activeElement,
      );
      }
      await page
        .locator(".pm-languages button")
        .filter({ hasText: "NL" })
        .click();
      assert.equal(
        await page
          .locator(".pm-languages button[aria-pressed=true]")
          .textContent(),
        "NL",
      );
      await page
        .locator(".pm-languages button")
        .filter({ hasText: language.toUpperCase() })
        .click();
      assert.equal(
        await page.locator(".pm-contact form").count(),
        0,
        "No simulated request submission",
      );
      assert.equal(await page.locator(".pm-integrations article").count(), 3);
      assert.deepEqual(errors, []);
      await page.evaluate(() => scrollTo(0, 0));
      if (language === "ar" && width === 390)
        await page.screenshot({
          path: `${output}/marketing-redesign-mobile.png`,
          fullPage: true,
        });
      if (language === "fr" && width === 1280)
        await page.screenshot({
          path: `${output}/marketing-redesign-desktop.png`,
          fullPage: true,
        });
      if (width === 1280)
        await page.screenshot({ path: `${output}/hero-${language}.png` });
      console.log(
        `PASS ${language} ${width}: journey, audience, keyboard, links, RTL, overflow, reduced motion`,
      );
      await context.close();
    }
  const motion = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "no-preference",
  });
  const moving = await motion.newPage();
  await moving.goto(base);
  await moving.waitForSelector(".pm-orbit-one");
  assert.equal(
    await moving
      .locator(".pm-orbit-one")
      .evaluate((el) => getComputedStyle(el).animationName),
    "pm-orbit",
  );
  await motion.close();
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
