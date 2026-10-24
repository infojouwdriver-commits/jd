import { APP_ORIGIN } from "./app-origin.ts";
import {
  MAX_WELCOME_JSON_BYTES,
  parseWelcome,
  type WelcomeSettings,
} from "./welcome-config.ts";

export async function fetchWelcome(
  transport: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<WelcomeSettings> {
  const response = await transport(`${APP_ORIGIN}/next_api/app-experience`, {
    method: "GET",
    credentials: "omit",
    redirect: "error",
    headers: { Accept: "application/json" },
    signal,
  });
  if (
    !response.ok ||
    Number(response.headers.get("content-length") || 0) > MAX_WELCOME_JSON_BYTES
  )
    throw Error("Welcome unavailable");
  const raw = await response.text();
  if (raw.length > MAX_WELCOME_JSON_BYTES) throw Error("Welcome too large");
  const body = JSON.parse(raw);
  const value = body.success === true ? parseWelcome(body.data) : null;
  if (!value) throw Error("Invalid welcome");
  return value;
}
