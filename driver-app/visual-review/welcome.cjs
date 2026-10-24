const assert = require("node:assert/strict"),
  path = require("node:path");
exports.run = async (page, origin, output) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/next_api/app-experience", (route) =>
    route.fulfill({ status: 503, body: "{}", contentType: "application/json" }),
  );
  for (const [locale, language, action] of [
    ["ar", "العربية", "ابدأ"],
    ["fr", "Français", "Commencer"],
    ["nl", "Nederlands", "Beginnen"],
    ["en", "English", "Get started"],
  ]) {
    await page.goto(origin + "/?screen=settings");
    await page.getByRole("radio", { name: language, exact: true }).click();
    await page.goto(origin + "/?screen=welcome");
    await page.getByTestId("welcome-screen").waitFor();
    const start = page.getByRole("button", { name: action, exact: true });
    await start.waitFor();
    assert.equal(
      await start.isEnabled(),
      true,
      "Remote failure never blocks login",
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Welcome has no horizontal overflow",
    );
    await page.screenshot({ path: path.join(output, `welcome-${locale}.png`) });
  }
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await page.waitForURL("**/?screen=home");
  await page.unroute("**/next_api/app-experience");
  const config = {
    version: 2,
    enabled: true,
    motion: false,
    poster_data: null,
    title: {
      ar: "عنوان منشور",
      fr: "Accueil publié",
      nl: "Gepubliceerd welkom",
      en: "Published welcome",
    },
    subtitle: {
      ar: "نص تجريبي",
      fr: "Texte de test",
      nl: "Testtekst",
      en: "Synthetic text",
    },
  };
  await page.route("**/next_api/app-experience", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: config }),
    }),
  );
  await page.goto(origin + "/?screen=welcome");
  await page.getByText("Published welcome", { exact: true }).waitFor();
  const artwork = page.getByTestId("welcome-artwork");
  const still = await artwork.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(250);
  assert.equal(
    await artwork.evaluate((el) => getComputedStyle(el).transform),
    still,
    "Remote motion off is static",
  );
  await page.screenshot({ path: path.join(output, "welcome-remote.png") });
  config.motion = true;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(origin + "/?screen=welcome");
  await page.getByText("Published welcome", { exact: true }).waitFor();
  await page.waitForTimeout(250);
  const moving = await artwork.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(700);
  assert.notEqual(
    await artwork.evaluate((el) => getComputedStyle(el).transform),
    moving,
    "Camera movement is visible when enabled",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(150);
  const reduced = await artwork.evaluate(
    (el) => getComputedStyle(el).transform,
  );
  await page.waitForTimeout(250);
  assert.equal(
    await artwork.evaluate((el) => getComputedStyle(el).transform),
    reduced,
    "Reduced motion stops the camera",
  );
  await page.unroute("**/next_api/app-experience");
};
