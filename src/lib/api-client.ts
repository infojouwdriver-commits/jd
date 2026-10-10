
import { AUTH_ENABLED, authConfig } from "../config/auth-config";
import { AUTH_CODE } from "@/constants/auth";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorMessage?: string;
  errorCode?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public errorMessage: string,
    public errorCode?: string
  ) {
    super(errorMessage);
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

function trimValue(value?: string): string {
  return value?.trim() || "";
}

function normalizeBaseUrl(value?: string): string {
  const trimmed = trimValue(value);

  if (!trimmed) {
    return "";
  }

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const shouldUseHttp =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(trimmed) ||
    /^localhost:\d+(\/|$)/i.test(trimmed);

  const normalized = hasProtocol
    ? trimmed
    : `${shouldUseHttp ? "http" : "https"}://${trimmed}`;

  try {
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function getBrowserOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin?.trim() || "";
}

function getServerApiBaseUrl(): string {
  const zoerHost = normalizeBaseUrl(process.env.NEXT_PUBLIC_ZOER_HOST);
  if (zoerHost) {
    return zoerHost;
  }

  const directApiUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  if (directApiUrl) {
    return directApiUrl;
  }

  return "http://localhost:3000";
}

function buildApiUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/next_api${path}`;
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const rawText = await response.text();

  if (!rawText) {
    return {
      success: response.ok,
      data: undefined,
      errorMessage: response.ok ? undefined : "Empty response body",
    };
  }

  if (!isJson) {
    return {
      success: false,
      errorMessage: rawText,
    };
  }

  try {
    return JSON.parse(rawText) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      errorMessage: "Invalid JSON response",
    };
  }
}

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(buildApiUrl("/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const result: ApiResponse = await parseApiResponse(response);
    return result.success === true;
  } catch {
    return false;
  }
}

function getLoginPath(): string {
  if (typeof window === "undefined") {
    return authConfig.loginPath;
  }

  const pathname = window.location.pathname;

  if (pathname.startsWith("/driver")) {
    return "/driver-login";
  }

  return authConfig.loginPath;
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  const currentPath = window.location.pathname;
  const loginPath = getLoginPath();

  if (currentPath === loginPath || currentPath === `${loginPath}/`) {
    return;
  }

  const loginUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
  window.location.href = loginUrl;
}

async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
  isRetry = false
): Promise<T> {
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
      cache: "no-store",
      ...options,
    });

    const result = await parseApiResponse<T>(response);

    if (
      AUTH_ENABLED &&
      [AUTH_CODE.TOKEN_MISSING].includes(result.errorCode || "")
    ) {
      throw new ApiError(401, "need login", AUTH_CODE.TOKEN_MISSING);
    }

    if (
      AUTH_ENABLED &&
      response.status === 401 &&
      result.errorCode === AUTH_CODE.TOKEN_EXPIRED &&
      !isRetry
    ) {
      if (isRefreshing && refreshPromise) {
        const refreshSuccess = await refreshPromise;

        if (refreshSuccess) {
          return apiRequest<T>(endpoint, options, true);
        }

        throw new ApiError(401, "need login", AUTH_CODE.TOKEN_EXPIRED);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken();

        try {
          const refreshSuccess = await refreshPromise;

          if (refreshSuccess) {
            return apiRequest<T>(endpoint, options, true);
          }

          throw new ApiError(401, "need login", AUTH_CODE.TOKEN_EXPIRED);
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }
    }

    if (!response.ok || !result.success) {
      throw new ApiError(
        response.status,
        result.errorMessage || "API request failed",
        result.errorCode
      );
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 && typeof window !== "undefined") {
        const loginPath = getLoginPath();
        const currentPath = window.location.pathname;
        const isOnLoginPage =
          currentPath === loginPath ||
          currentPath === "/" ||
          currentPath === "/trial" ||
          currentPath === "/login" ||
          currentPath === "/driver-login";

        if (endpoint.split("?")[0] !== "/auth/user" && !isOnLoginPage && error.errorCode === AUTH_CODE.TOKEN_MISSING) {
          redirectToLogin();
        }
      }

      throw error;
    }

    console.error("Operation failed");
    throw new ApiError(500, "Network error or invalid response");
  }
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string>) => {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;

    return apiRequest<T>(url, { method: "GET" });
  },

  post: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};

export { ApiError };
export type { ApiResponse };
