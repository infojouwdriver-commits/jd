import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
const output = process.env.MARKETING_QA_DIR || "/tmp/jd-cinematic-qa";
fs.mkdirSync(output, { recursive: true });
const { chromium } = await import(
  pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href
);
const base = "http://127.0.0.1:3024",
  portal = process.env.PORTAL_QA_ORIGIN || "";
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
const report = [];
async function consent(context) {
  await context.addInitScript(() =>
    localStorage.setItem(
      "gdpr_cookie_consent",
      JSON.stringify({
        version: "1.0",
        timestamp: new Date().toISOString(),
        categories: { essential: true, analytics: false, marketing: false },
      }),
    ),
  );
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      ready = (await fetch(base)).ok;
    } catch {}
    if (ready) break;
    await new Promise((r) => setTimeout(r, 400));
  }
  assert.ok(ready, "Production server ready");
  browser = await chromium.launch({
    headless: true,
    ...(process.env.UI_CHROMIUM_PATH
      ? { executablePath: process.env.UI_CHROMIUM_PATH }
      : {}),
    args: [
      "--enable-webgl",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  // Capture a poster candidate for visual review without mutating release sources.
  const moving = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    ...(process.env.CINEMA_VIDEO
      ? { recordVideo: { dir: output, size: { width: 1280, height: 900 } } }
      : {}),
  });
  await consent(moving);
  const page = await moving.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/fr");
  await page.waitForSelector(".jd-scene[data-ready=true]", { timeout: 60000 });
  const travel = await page
    .locator("#experience")
    .evaluate((e) => e.offsetHeight - innerHeight + document.querySelector(".jd-header").getBoundingClientRect().height);
  for (const [name, p] of [
    ["ignition", 0],
    ["shift", 0.18],
    ["taxi", 0.43],
    ["cockpit", 0.68],
    ["completed", 0.735],
    ["printer", 0.85],
    ["receipt", 0.99],
    ["reverse-cockpit", 0.68],
    ["reverse-taxi", 0.43],
    ["reverse-phone", 0],
  ]) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), travel * p);
    console.log("Scene", name, p);
    try {
      await page.waitForFunction(
        (p) =>
          Math.abs(
            Number(document.querySelector(".jd-scene").dataset.progress) - p,
          ) < 0.015,
        p,
      );
    } catch (error) {
      await page.screenshot({ path: output + "/failed-" + name + ".png" });
      fs.writeFileSync(
        output + "/failed-state.json",
        JSON.stringify(
          await page.evaluate(() => ({
            scrollY,
            innerHeight,
            progress: document.querySelector(".jd-scene").dataset.progress,
            ancestors: [
              document.documentElement,
              document.body,
              document.querySelector(".jd"),
              document.querySelector("main"),
              document.querySelector("#experience"),
              document.querySelector(".jd-stage"),
            ].map((e) => ({
              tag: e.tagName,
              cls: e.className,
              rect: e.getBoundingClientRect().toJSON(),
              overflow: getComputedStyle(e).overflow,
              position: getComputedStyle(e).position,
              transform: getComputedStyle(e).transform,
            })),
          })),
          null,
          2,
        ),
      );
      throw error;
    }
    await page.waitForTimeout(450);
    await page.screenshot({ path: output + "/" + name + ".png" });
    assert.ok(
      await page.locator(".jd-scene canvas").isVisible(),
      "Real WebGL canvas visible",
    );
    const overlap = await page.evaluate(() => {
      const a = document.querySelector(".jd-narrative").getBoundingClientRect(),
        b = document.querySelector(".jd-scene").getBoundingClientRect();
      return (
        a.right > b.left + 1 &&
        b.right > a.left + 1 &&
        a.bottom > b.top + 1 &&
        b.bottom > a.top + 1
      );
    });
    assert.equal(overlap, false, "Narrative never overlaps the scene");
    if (name === "taxi") {
      await page
        .locator(".jd-scene")
        .screenshot({ path: output + "/poster.png", style: ".jd-motion, .jd-scene-label { visibility: hidden !important; }" });
      const require = createRequire(import.meta.url);
      const sharp = require(
        require.resolve("sharp", {
          paths: [require.resolve("next/package.json")],
        }),
      );
      await sharp(output + "/poster.png")
        .resize(1200, 1000, { fit: "contain", background: "#060B12" })
        .webp({ quality: 88 })
        .toFile(output + "/poster.webp");
    }
    report.push({ stage: name, progress: p, pass: true });
  }
  assert.deepEqual(errors, [], "No scene JavaScript errors");
  await moving.close();
  for (const lang of ["ar", "fr", "nl"])
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
        serviceWorkers: "block",
      });
      await consent(context);
      if (portal)
        await context.route(portal + "/**", (route) => {
          assert.equal(route.request().method(), "GET");
          return route.fulfill({
            contentType: "text/html",
            body: "<h1>Isolated registration handoff</h1>",
          });
        });
      const p = await context.newPage();
      const failures = [];
      p.on("pageerror", (e) => failures.push(e.message));
      const response = await p.goto(base + "/" + lang);
      assert.equal(response.status(), 200);
      const initialHtml = await response.text();
      assert.ok(initialHtml.includes('class="jd-cinema '), "Localized homepage content is rendered before hydration");
      assert.ok(initialHtml.includes('type="application/ld+json"'), "Structured data is rendered before hydration");
      await p.waitForSelector(".jd-static");
      await p.waitForFunction(() => {
        const image = document.querySelector(".jd-poster img");
        return image?.complete && image.naturalWidth > 0;
      });
      const fallbackOverlap = await p.evaluate(() => {
        const a = document.querySelector(".jd-poster p").getBoundingClientRect();
        const b = document.querySelector(".jd-scene-label").getBoundingClientRect();
        return a.right > b.left + 1 && b.right > a.left + 1 && a.bottom > b.top + 1 && b.bottom > a.top + 1;
      });
      assert.equal(fallbackOverlap, false, "Fallback caption and scene label remain separate");
      assert.equal(await p.locator(".jd").getAttribute("lang"), lang);
      assert.equal(
        await p.locator("html").getAttribute("dir"),
        lang === "ar" ? "rtl" : "ltr",
      );
      assert.equal(
        await p.locator(".jd-scene canvas").count(),
        0,
        "Reduced motion loads no WebGL",
      );
      const fits = await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      );
      if (!fits) {
        await p.screenshot({
          path: output + "/overflow-" + lang + "-" + width + ".png",
          fullPage: true,
        });
        fs.writeFileSync(
          output + "/overflow.json",
          JSON.stringify(
            await p.evaluate(() => ({
              width: innerWidth,
              scrollWidth: document.documentElement.scrollWidth,
              nodes: [...document.querySelectorAll("body *")]
                .map((e) => ({
                  tag: e.tagName,
                  cls: e.className,
                  rect: e.getBoundingClientRect().toJSON(),
                }))
                .filter(
                  (e) => e.rect.right > innerWidth + 1 || e.rect.left < -1,
                )
                .slice(0, 50),
            })),
            null,
            2,
          ),
        );
      }
      assert.ok(fits, "No horizontal overflow");
      // Clipping an ancestor must never conceal an overflowing control or label.
      const clipped = await p.locator(".jd-header a, .jd-header button, .jd-button, .jd-faq summary").evaluateAll((nodes) =>
        nodes.filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 1);
        }).map((e) => ({ text: e.textContent, rect: e.getBoundingClientRect().toJSON(), scroll: e.scrollWidth, client: e.clientWidth })),
      );
      assert.deepEqual(clipped, [], "Controls and labels fit without clipping");

      await p.screenshot({ path: output + "/header-" + lang + "-" + width + ".png" });
      assert.equal(await p.locator("h1").count(), 1);
      assert.equal(
        await p.locator("link[rel=canonical]").getAttribute("href"),
        "https://jouww.com/" + lang,
      );
      assert.equal(await p.locator("link[rel=alternate][hreflang]").count(), 4);
      assert.ok(
        (
          await p.locator('script[type="application/ld+json"]').textContent()
        ).includes("FAQPage"),
      );
      const structured = JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());
      const logo = structured["@graph"].find((entry) => entry["@type"] === "Organization").logo;
      const logoResponse = await p.request.get(base + new URL(logo).pathname);
      assert.equal(logoResponse.status(), 200, "Organization logo resolves publicly");
      assert.ok(logoResponse.headers()["content-type"].startsWith("image/"));
      for (const href of await p
        .locator('.jd a[href^="#"]')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href"))))
        assert.ok(await p.locator(href).count(), "Anchor resolves " + href);
      assert.equal(
        await p.locator(".jd-feature-list a").getAttribute("href"),
        portal + "/driver-login",
      );
      assert.equal(
        await p.locator(".jd-company>.jd-text-link").getAttribute("href"),
        portal + "/login?portal=company",
      );
      await p.locator(".jd-faq summary").first().click();
      assert.ok(
        await p
          .locator(".jd-faq details")
          .first()
          .evaluate((e) => e.open),
      );
      await p.locator(".jd-faq summary").first().press("Enter");
      assert.equal(
        await p
          .locator(".jd-faq details")
          .first()
          .evaluate((e) => e.open),
        false,
      );
      const register = p.locator(".jd-price button");
      await register.click();
      if (portal) {
        await p.waitForURL(portal + "/register-company?lang=" + lang);
      } else {
        const dialog = p.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        assert.ok(await dialog.locator("input").count());
        const bounds = await dialog.evaluate((e) => {
          const r = e.getBoundingClientRect();
          return r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1 && e.scrollWidth <= e.clientWidth + 1;
        });
        assert.ok(bounds, "Registration fits the mobile viewport");
        const stepNumbersFit = await dialog.locator(".cr-steps li > span").evaluateAll((steps) => {
          const box = document.querySelector(".cr-dialog").getBoundingClientRect();
          const rects = steps.map((step) => step.getBoundingClientRect());
          return rects.length === 5 && rects.every((r, i) => r.left >= box.left && r.right <= box.right && rects.every((other, j) => i === j || r.right <= other.left + 1 || other.right <= r.left + 1));
        });
        assert.ok(stepNumbersFit, "All five registration steps remain visible and separate");
        await p.screenshot({ path: output + "/registration-" + lang + "-" + width + ".png" });
        await p.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        await p.waitForFunction(
          (button) => document.activeElement === button,
          await register.elementHandle(),
        );
      }
      assert.deepEqual(failures, []);
      await p.screenshot({
        path: output + "/" + lang + "-" + width + ".png",
        fullPage: width === 1440,
      });
      report.push({ locale: lang, width, reducedMotion: true, pass: true });
      await context.close();
    }
  for (const lang of ["ar", "fr", "nl"])
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "no-preference",
    });
    await consent(context);
    const p = await context.newPage();
    await p.goto(base + "/" + lang);
    await p.waitForSelector(".jd-scene[data-ready=true]");
    const distance = await p.locator("#experience").evaluate((e) => e.offsetHeight - innerHeight + document.querySelector(".jd-header").getBoundingClientRect().height);
    for (const [stage, progress] of [["phone", 0], ["taxi", .43], ["cockpit", .68], ["printer", .85], ["receipt", .99], ["reverse-cockpit", .68], ["reverse-taxi", .43], ["reverse-phone", 0]]) {
      await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), distance * progress);
      await p.waitForFunction((value) => Math.abs(Number(document.querySelector(".jd-scene").dataset.progress) - value) < .015, progress);
      await p.waitForTimeout(450);
      const overlaps = await p.evaluate(() => {
        const a = document.querySelector(".jd-narrative").getBoundingClientRect();
        const b = document.querySelector(".jd-scene").getBoundingClientRect();
        return a.right > b.left + 1 && b.right > a.left + 1 && a.bottom > b.top + 1 && b.bottom > a.top + 1;
      });
      assert.equal(overlaps, false, "Mobile narrative stays outside scene");
      const textOverScene = await p.evaluate(() => {
        const scene = document.querySelector(".jd-scene").getBoundingClientRect();
        return [...document.querySelectorAll(".jd-narrative h1, .jd-narrative h2, .jd-lead, .jd-narrative .jd-button, .jd-skip")].some((e) => {
          const r = e.getBoundingClientRect();
          return r.right > scene.left + 1 && scene.right > r.left + 1 && r.bottom > scene.top + 1 && scene.bottom > r.top + 1;
        });
      });
      assert.equal(textOverScene, false, "Copy and actions never cover the model");
      if (!stage.startsWith("reverse")) await p.screenshot({ path: output + "/animated-" + lang + "-" + width + "-" + stage + ".png" });
    }
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await p.screenshot({ path: output + "/animated-" + lang + "-" + width + ".png" });
    await p.locator(".jd-motion").click();
    await p.waitForSelector(".jd-static");
    assert.equal(
      await p.locator("canvas").count(),
      0,
      "Toggle disposes canvas",
    );
    await context.close();
    report.push({ locale: lang, width, animated: true, reverse: true, toggle: true, pass: true });
  }
  const fail = await browser.newContext();
  await fail.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  const p = await fail.newPage();
  await p.goto(base + "/nl");
  await p.waitForSelector(".jd-static");
  assert.ok(await p.locator(".jd-price button").isVisible());
  await fail.close();
  report.push({ webglFailure: true, pass: true });
  fs.writeFileSync(output + "/report.json", JSON.stringify(report, null, 2));
  console.log(
    "PASS cinematic stages, reverse scroll, 3 locales × 4 widths, keyboard, registration, SEO, reduced motion, WebGL fallback",
  );
} finally {
  fs.writeFileSync(output + "/report.json", JSON.stringify(report, null, 2));
  await browser?.close();
  server.kill("SIGTERM");
}
