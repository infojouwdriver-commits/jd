import { originAllowed, publicEndpoint, disabledEndpoint } from "./security-policy";
import { authorizeEndpoint } from "./security-guard";
import { rateLimit, consumeRateLimit } from "./rate-limit";

import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "./create-response";
import { AUTH_ENABLED, authConfig } from "../config/auth-config";
import { AUTH_CODE } from "@/constants/auth";
import { User } from "@/types/auth";

export interface JWTPayload extends User {
  amr?: string;
  iat: number;
  exp: number;
}

export interface ApiParams {
  token?: string;
  payload?: JWTPayload | null;
}

function trimEnvValue(value?: string): string {
  return value?.trim() || "";
}

function normalizeHttpUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("POSTGREST_URL is empty");
  }

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const shouldUseHttp =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(trimmed) ||
    /^localhost:\d+(\/|$)/i.test(trimmed);

  const normalized = hasProtocol
    ? trimmed
    : `${shouldUseHttp ? "http" : "https"}://${trimmed}`;

  return new URL(normalized).toString().replace(/\/$/, "");
}

function normalizePublicUrl(input?: string): string {
  const trimmed = trimEnvValue(input);

  if (!trimmed) {
    return "";
  }

  try {
    return normalizeHttpUrl(trimmed);
  } catch {
    return "";
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  const result: Record<string, string> = {};
  const parts = cookieHeader.split(";");

  for (const part of parts) {
    const [rawName, ...rawValueParts] = part.split("=");
    const name = rawName?.trim();

    if (!name) {
      continue;
    }

    result[name] = safeDecode(rawValueParts.join("=").trim());
  }

  return result;
}

function getCookieValueFromRequest(
  request: NextRequest,
  name: string
): string | undefined {
  const directCookie = request.cookies.get(name)?.value;

  if (directCookie) {
    return directCookie;
  }

  const parsedCookies = parseCookieHeader(request.headers.get("cookie"));
  return parsedCookies[name];
}

function getJwtSecretCandidate(): string {
  const jwtSecret = trimEnvValue(process.env.JWT_SECRET);
  const nextAuthSecret = trimEnvValue(process.env.NEXTAUTH_SECRET);
  return jwtSecret || nextAuthSecret;
}

function getHostname(value?: string): string {
  const normalized = normalizePublicUrl(value);

  if (!normalized) {
    return "";
  }

  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function getRootDomain(hostname: string): string {
  const parts = hostname.split(".").filter(Boolean);

  if (parts.length < 2) {
    return hostname;
  }

  return parts.slice(-2).join(".");
}

function getConfiguredOrigins(): string[] {
  const values = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_ZOER_HOST,
    process.env.NEXT_PUBLIC_STRIPE_URL,
  ];

  return values
    .map((value) => normalizePublicUrl(value))
    .filter(Boolean);
}

function getConfiguredHostnames(): string[] {
  return getConfiguredOrigins()
    .map((origin) => getHostname(origin))
    .filter(Boolean);
}

function isZoerCloudHostname(hostname: string): boolean {
  return hostname.endsWith(".zoer.cloud") || hostname.endsWith(".zoer.ai");
}

function getCookieDomainOverride(): string | undefined {
  const value = trimEnvValue(process.env.AUTH_COOKIE_DOMAIN);
  return value || undefined;
}

function getSharedCookieDomain(): string | undefined {
  const overrideDomain = getCookieDomainOverride();

  if (overrideDomain) {
    return overrideDomain;
  }

  return undefined;
}

function getAllowedOrigin(originHeader: string | null, fallbackOrigin?: string): string {
  return originAllowed(originHeader, process.env.APP_ORIGIN || fallbackOrigin || '', process.env.TRUSTED_ORIGINS) ? originHeader! : '';
}

function appendCorsHeaders(response: Response, request: NextRequest): Response {
  const allowedOrigin = getAllowedOrigin(
    request.headers.get("origin"),
    request.nextUrl.origin
  );

  if (allowedOrigin && allowedOrigin !== "*") {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set("Vary", "Origin");

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export function normalizeServerEnv(): void {
  const postgrestUrl = trimEnvValue(process.env.POSTGREST_URL);
  const postgrestSchema = trimEnvValue(process.env.POSTGREST_SCHEMA);
  const postgrestApiKey = trimEnvValue(process.env.POSTGREST_API_KEY);
  const schemaUser = trimEnvValue(process.env.SCHEMA_USER);
  const schemaAdminUser = trimEnvValue(process.env.SCHEMA_ADMIN_USER);
  const jwtSecret = getJwtSecretCandidate();
  const hashSaltKey = trimEnvValue(process.env.HASH_SALT_KEY);

  if (postgrestUrl) {
    process.env.POSTGREST_URL = normalizeHttpUrl(postgrestUrl);
  }

  if (postgrestSchema) {
    process.env.POSTGREST_SCHEMA = postgrestSchema;
  }

  if (postgrestApiKey) {
    process.env.POSTGREST_API_KEY = postgrestApiKey;
  }

  if (schemaUser) {
    process.env.SCHEMA_USER = schemaUser;
  }

  if (schemaAdminUser) {
    process.env.SCHEMA_ADMIN_USER = schemaAdminUser;
  }

  if (jwtSecret) {
    process.env.JWT_SECRET = jwtSecret;
    process.env.NEXTAUTH_SECRET = jwtSecret;
  }

  if (hashSaltKey) {
    process.env.HASH_SALT_KEY = hashSaltKey;
  }

  normalizePublicUrl(process.env.NEXT_PUBLIC_ZOER_HOST);
  normalizePublicUrl(process.env.NEXT_PUBLIC_STRIPE_URL);
  normalizePublicUrl(process.env.NEXT_PUBLIC_API_URL);
}

export function getCookies(request: NextRequest, names: string[]): string[] {
  const values: string[] = [];

  for (const name of names) {
    const value = getCookieValueFromRequest(request, name);
    if (value) {
      values.push(value);
    }
  }

  return values;
}

export function validateEnv(): void {
  normalizeServerEnv();

  const requiredVars = [
    "POSTGREST_URL",
    "POSTGREST_SCHEMA",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  normalizeHttpUrl(process.env.POSTGREST_URL || "");
}

export function parseQueryParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  return {
    limit: Math.max(1, Math.min(500, parseInt(searchParams.get("limit") || "10") || 10)),
    offset: Math.max(0, parseInt(searchParams.get("offset") || "0") || 0),
    id: searchParams.get("id"),
    search: searchParams.get("search"),
    type: searchParams.get("type"),
    company_id: searchParams.get("company_id"),
    trip_id: searchParams.get("trip_id"),
    signature_token: searchParams.get("signature_token"),
    contract_id: searchParams.get("contract_id"),
    platform_name: searchParams.get("platform_name"),
    period: searchParams.get("period"),
    platform: searchParams.get("platform"),
    start_date: searchParams.get("start_date"),
    end_date: searchParams.get("end_date"),
    language: searchParams.get("language"),
    target_company_id: searchParams.get("target_company_id"),
    status: searchParams.get("status"),
    distributor_id: searchParams.get("distributor_id"),
    message_id: searchParams.get("message_id"),
  };
}

export async function validateRequestBody(request: NextRequest): Promise<any> {
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Response(null, {status: 400});
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 262144) { await reader.cancel(); throw new Response(null, {status: 413}); }
      chunks.push(value);
    }
    const joined = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    const body = JSON.parse(new TextDecoder().decode(joined));

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Response(null, { status: 400 });
    }

    const path = request.nextUrl.pathname;
    if (path.startsWith('/next_api/auth/') || path.endsWith('/login') || path === '/next_api/driver-profile') {
      const account = typeof body.email === 'string' ? body.email.trim().toLowerCase() : typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : null;
      if (account) {
        if (account.length > 254) throw new Response(null, {status:400});
        const limited = await consumeRateLimit(`account:${account}`, 10);
        if (limited) throw limited;
      }
    }
    return body;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Response(null, { status: 400 });
    }

    throw error;
  }
}

export function getSenderEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}

function extractBearerToken(request: NextRequest): string {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.trim() || "";
}

function getEffectiveRequestToken(request: NextRequest): string {
  const [cookieToken] = getCookies(request, [authConfig.tokenCookieName]);
  return cookieToken || extractBearerToken(request);
}

export function requestMiddleware(
  handler: (request: NextRequest, params: ApiParams) => Promise<Response>,
  checkToken: boolean = true
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      normalizeServerEnv();

      if (request.method === "OPTIONS") {
        return appendCorsHeaders(new Response(null, { status: 204 }), request);
      }

      const params: ApiParams = {};

      const path = request.nextUrl.pathname;
      if (disabledEndpoint(path)) return appendCorsHeaders(createErrorResponse({errorMessage: 'Feature disabled pending security review', status: 503}), request);
      const origin = request.headers.get('origin');
      const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
      const bearer = /^Bearer\s+\S+$/i.test(request.headers.get('authorization') || '');
      if ((origin && !originAllowed(origin, process.env.APP_ORIGIN || request.nextUrl.origin, process.env.TRUSTED_ORIGINS)) || (isMutation && !origin && (!bearer || request.headers.has('cookie')))) {
        return appendCorsHeaders(createErrorResponse({errorMessage: 'Origin verification failed', status: 403}), request);
      }
      if (Number(request.headers.get('content-length') || 0) > 262144) return appendCorsHeaders(createErrorResponse({errorMessage: 'Request too large', status: 413}), request);
      if (isMutation && request.headers.get('content-type')?.split(';')[0] !== 'application/json') return appendCorsHeaders(createErrorResponse({errorMessage: 'JSON content type required', status: 415}), request);
      const limited = await rateLimit(request, path);
      if (limited) return appendCorsHeaders(limited, request);
      // Only the reviewed allowlist grants anonymous access. Handler flags cannot bypass auth.
      if (!publicEndpoint(path, request.method)) {
        const { verifyToken } = await import("./auth");
        const effectiveToken = getEffectiveRequestToken(request);
        const tokenResult = await verifyToken(effectiveToken);

        if (tokenResult.code === AUTH_CODE.TOKEN_EXPIRED) {
          return appendCorsHeaders(
            createErrorResponse({
              errorCode: AUTH_CODE.TOKEN_EXPIRED,
              errorMessage: "need login",
              status: 401,
            }),
            request
          );
        }

        if (tokenResult.code === AUTH_CODE.TOKEN_MISSING) {
          return appendCorsHeaders(
            createErrorResponse({
              errorCode: AUTH_CODE.TOKEN_MISSING,
              errorMessage: "need login",
              status: 401,
            }),
            request
          );
        }

        params.token = effectiveToken || undefined;
        params.payload = tokenResult.payload;
      }

      if (params.payload) {
        await authorizeEndpoint(request, params.payload);
        const {generateAdminUserToken} = await import('./auth');
        params.token = await generateAdminUserToken();
      }
      const response = await handler(request, params);

      if (response instanceof Response) {
        return appendCorsHeaders(response, request);
      }

      return appendCorsHeaders(
        createErrorResponse({
          errorMessage: "Invalid API response from server handler",
          status: 500,
        }),
        request
      );
    } catch (error: unknown) {
      if (error instanceof Response) {
        return appendCorsHeaders(error, request);
      }

      console.error("Operation failed");

      const anyError = error as any;
      const errorMessage =
        typeof anyError?.message === "string" ? anyError.message : "Request failed";
      const status =
        typeof anyError?.status === "number"
          ? anyError.status
          : typeof anyError?.statusCode === "number"
            ? anyError.statusCode
            : 500;
      const errorCode =
        typeof anyError?.code === "string" ? anyError.code : undefined;

      return appendCorsHeaders(
        createErrorResponse({
          errorCode,
          errorMessage: status >= 500 ? "Request failed" : errorMessage,
          status,
        }),
        request
      );
    }
  };
}

export function responseRedirect(url: string, callbackUrl?: string) {
  const redirectUrl = new URL(url);

  if (callbackUrl) {
    redirectUrl.searchParams.set("redirect", callbackUrl);
  }

  return NextResponse.redirect(redirectUrl);
}

export function getRequestIp(request: NextRequest): string {
  return process.env.TRUST_PROXY === 'true' ? (request.headers.get('x-real-ip') || 'unknown').slice(0, 45) : 'unknown';
}

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  const htmlTemplate = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Email Verification</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background-color:#f3f4f6;"><span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f3f4f6;max-height:0;max-width:0;opacity:0;overflow:hidden;">Enter the verification code to continue signing up.</span><table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3f4f6;"><tr><td align="center" style="padding:20px;"><table width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;max-width:600px;background-color:#ffffff;border-collapse:collapse;"><tr><td align="center" style="background-color:#6b46c1;padding:36px 24px;"><h1 style="margin:0;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:600;">🔐 Email Verification</h1></td></tr><tr><td align="center" style="padding:28px 24px 20px 24px;"><table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;"><tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937;font-size:15px;line-height:22px;text-align:center;padding-bottom:18px;">Continue signing up by entering the code below:</td></tr><tr><td align="center" style="padding:0 0 18px 0;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;"><tr><td style="background-color:#f1f5f9;border:2px solid #d1d5db;border-style:solid;border-radius:8px;padding:16px 28px;font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:700;letter-spacing:4px;color:#0f172a;text-align:center;">${code}</td></tr></table></td></tr><tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#374151;font-size:14px;line-height:20px;text-align:center;padding-bottom:18px;">This code will expire in <strong>3 minutes</strong> for security purposes.</td></tr><tr><td align="center" style="padding:0 0 8px 0;"><table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;"><tr><td style="background-color:#fffbeb;border-left:4px solid #f59e0b;color:#92400e;padding:12px 14px;border-radius:0 8px 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:18px;"><strong style="display:block;margin-bottom:6px;">Security Notice:</strong>If you didn't request this verification, please ignore this email. Never share this code with anyone.</td></tr></table></td></tr><tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#6b7280;font-size:12px;line-height:18px;text-align:center;padding-top:12px;padding-bottom:20px;">If you need help, contact our support.</td></tr></table></td></tr></table></td></tr></table></body></html>`;

  if (process.env.RESEND_KEY) {
    const resend = new Resend(process.env.RESEND_KEY);
    await resend.emails.send({
      from: getSenderEmail(),
      to: email,
      subject: "Email Verification Code",
      html: htmlTemplate,
    });

    return true;
  }

  const url = `${process.env.NEXT_PUBLIC_ZOER_HOST}/zapi/app/email/send`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Postgrest-API-Key": process.env.POSTGREST_API_KEY || "",
    },
    body: JSON.stringify({
      to: email,
      subject: "Email Verification Code",
      html: htmlTemplate,
    }),
  });

  return true;
}

function shouldUseSecureCookies(): boolean {
  if (process.env.NODE_ENV === "production") {
    return true;
  }

  if (process.env.NEXT_PUBLIC_ZOER_HOST?.trim()?.startsWith("https://")) {
    return true;
  }

  if (process.env.NEXT_PUBLIC_STRIPE_URL?.trim()?.startsWith("https://")) {
    return true;
  }

  if (process.env.NEXT_PUBLIC_API_URL?.trim()?.startsWith("https://")) {
    return true;
  }

  return false;
}

function shouldUseCrossSiteCookies(): boolean {
  const configuredOrigins = getConfiguredOrigins();

  if (configuredOrigins.length < 2) {
    return false;
  }

  const normalizedHostnames = configuredOrigins
    .map((origin) => getHostname(origin))
    .filter(Boolean);

  if (normalizedHostnames.length < 2) {
    return false;
  }

  return new Set(normalizedHostnames).size > 1;
}

function getSameSiteValue(): "Lax" { return "Lax"; }

export function setCookie(
  response: Response,
  name: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
  } = {}
): void {
  const { path = "/", maxAge, httpOnly = true } = options;
  const pieces = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`];

  if (httpOnly) {
    pieces.push("HttpOnly");
  }

  if (shouldUseSecureCookies()) {
    pieces.push("Secure");
  }

  pieces.push(`SameSite=${getSameSiteValue()}`);

  const domain = undefined;
  if (domain) {
    pieces.push(`Domain=${domain}`);
  }

  if (typeof maxAge === "number") {
    pieces.push(`Max-Age=${maxAge}`);
  }

  response.headers.append("Set-Cookie", `${pieces.join("; ")};`);
}

export function clearCookie(
  response: Response,
  name: string,
  path: string = "/"
): void {
  setCookie(response, name, "", { path, maxAge: 0 });
}
