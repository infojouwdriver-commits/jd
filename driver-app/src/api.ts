export const API_ORIGIN = 'https://jouw-driver.duckdns.org';
export interface DriverProfile {
  native_trip_contract_version?: number;
  driver: {id: number; full_name: string; company_id: number; current_vehicle_id: number | null};
  company: {id: number; name: string; chiron_mode: string};
}
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(status === 401 ? 'انتهت الجلسة أو بيانات الدخول غير صحيحة.' : status === 403 ? 'ليس لديك صلاحية لهذا الإجراء.' : 'تعذّر الاتصال بالخادم. حاول مجدداً.');
    this.status = status;
  }
}
// Uses the OS cookie store with the existing HttpOnly session contract.
// Native cookie persistence/refresh must pass device acceptance before release.
export function createDriverApi(transport: typeof fetch = fetch) {
  async function request<T>(path: string, body?: object): Promise<T> {
    if (!/^\/next_api\/[a-z0-9/-]+$/.test(path)) throw new Error('Invalid API path');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await transport(API_ORIGIN + path, {
        method: body ? 'POST' : 'GET', credentials: 'include', redirect: 'error',
        headers: {Origin: API_ORIGIN, Accept: 'application/json', ...(body ? {'Content-Type': 'application/json'} : {})},
        ...(body ? {body: JSON.stringify(body)} : {}), signal: controller.signal,
      });
      if (!response.ok) throw new ApiError(response.status);
      const result = await response.json();
      if (result.success !== true) throw new ApiError(502);
      return result.data as T;
    } finally { clearTimeout(timer); }
  }
  let refresh: Promise<unknown> | null = null;
  const refreshOnce = () => refresh ?? (refresh = request('/next_api/auth/refresh', {}).finally(() => {refresh = null;}));
  async function profile(): Promise<DriverProfile> {
    try {return await request<DriverProfile>('/next_api/drivers/me');}
    catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      await refreshOnce();
      return request<DriverProfile>('/next_api/drivers/me');
    }
  }
  return {
    profile,
    async login(identity: string, password: string, otp = '') {
      const value = identity.trim();
      await request(value.includes('@') ? '/next_api/auth/login' : '/next_api/auth/driver-login',
        value.includes('@') ? {email: value, password, ...(otp ? {otp} : {})} : {phone: value, password});
      return profile();
    },
    async completeTrip(payload: Record<string, unknown>) {
      const current = await profile();
      if ((current.native_trip_contract_version ?? 0) < 1) throw new ApiError(409);
      const {_native_company_id, _native_vehicle_id, _native_environment, ...body} = payload;
      return request<{id: number; warning?: string}>('/next_api/trips/end', {...body, expected_company_id: _native_company_id, expected_vehicle_id: _native_vehicle_id, expected_chiron_environment: _native_environment});
    },
    // Do not clear the session UI when server revocation fails.
    logout: () => request('/next_api/auth/logout', {}),
  };
}
