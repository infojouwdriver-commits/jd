import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_WELCOME,
  parseWelcome,
  MAX_WELCOME_JSON_BYTES,
} from "../src/welcome-config.ts";
import { fetchWelcome } from "../src/welcome-loader.ts";
import { APP_ORIGIN } from "../src/app-origin.ts";
test("welcome is public presentation only: reject links, permissions, bad locale, unsafe media and oversized content", () => {
  assert.deepEqual(parseWelcome(DEFAULT_WELCOME), DEFAULT_WELCOME);
  for (const patch of [
    { version: -1 },
    { version: 1.5 },
    { enabled: "true" },
    { title: { fr: "only French" } },
    { title: { ...DEFAULT_WELCOME.title, ar: "a".repeat(121) } },
    { poster_data: "https://tracker.invalid/a.png" },
    { poster_data: "data:image/svg+xml;base64,PHN2Zz4=" },
    { poster_data: "data:image/webp;base64," + "A".repeat(230000) },
    { api_origin: "https://attacker.invalid" },
    { permissions: { driver: true } },
  ])
    assert.equal(parseWelcome({ ...DEFAULT_WELCOME, ...patch }), null);
});
test("welcome read omits credentials, uses only the compiled origin and accepts a valid server publication", async () => {
  let calls = 0;
  const result = await fetchWelcome(async (url, options) => {
    calls++;
    assert.equal(url, APP_ORIGIN + "/next_api/app-experience");
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    assert.deepEqual(options.headers, { Accept: "application/json" });
    return Response.json({
      success: true,
      data: { ...DEFAULT_WELCOME, version: 2, motion: false },
    });
  });
  assert.equal(calls, 1);
  assert.equal(result.version, 2);
  assert.equal(result.motion, false);
});
test("unavailable, malformed and oversized welcome responses reject without retrying or altering session state", async () => {
  for (const response of [
    new Response("", { status: 503 }),
    new Response("<html>"),
    Response.json({ success: false, data: DEFAULT_WELCOME }),
    Response.json({
      success: true,
      data: { ...DEFAULT_WELCOME, api_origin: "bad" },
    }),
    new Response("x".repeat(MAX_WELCOME_JSON_BYTES + 1)),
    new Response("{}", {
      headers: { "content-length": String(MAX_WELCOME_JSON_BYTES + 1) },
    }),
  ])
    await assert.rejects(fetchWelcome(async () => response));
});
