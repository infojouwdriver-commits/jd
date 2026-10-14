import type {MeterPoint} from './trip-meter';
export const API_ORIGIN = 'https://jouw-driver.duckdns.org';
export interface DriverProfile {
  native_trip_contract_version?: number;
  driver: {id: number; full_name: string; company_id: number; current_vehicle_id: number | null};
  company: {id: number; name: string; chiron_mode: string};
}
export interface DriverVehicle {id: number; company_id: number; plate_number: string; status: string; brand?: string; model?: string}
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
  async function request<T>(path: string, body?: object, method: 'GET' | 'POST' | 'PUT' = body ? 'POST' : 'GET'): Promise<T> {
    if (!/^\/next_api\/[a-z0-9/-]+$/.test(path)) throw new Error('Invalid API path');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await transport(API_ORIGIN + path, {
        method, credentials: 'include', redirect: 'error',
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
  async function vehicles(owner: number) {
    const current = await profile();
    if (current.driver.id !== owner) throw new ApiError(403);
    const result = await request<{driver_id: number; current_vehicle_id: number | null; vehicles: DriverVehicle[]}>('/next_api/drivers/vehicles');
    if (result.driver_id !== owner || !Array.isArray(result.vehicles)
      || result.vehicles.some(vehicle => !Number.isSafeInteger(vehicle.id) || vehicle.id <= 0 || vehicle.company_id !== current.driver.company_id || vehicle.status !== 'active' || typeof vehicle.plate_number !== 'string')) throw new ApiError(502);
    return {profile: current, vehicles: result.vehicles};
  }
  return {
    profile,
    vehicles,
    async selectVehicle(owner: number, vehicleId: number) {
      if (!Number.isSafeInteger(vehicleId) || vehicleId <= 0) throw new ApiError(400);
      const listed = await vehicles(owner);
      if (!listed.vehicles.some(vehicle => vehicle.id === vehicleId)) throw new ApiError(403);
      // A failed/ambiguous mutation is never retried automatically.
      const receipt = await request<{driver_id: number; current_vehicle_id: number; vehicle: DriverVehicle}>('/next_api/drivers/vehicles', {vehicle_id: vehicleId}, 'PUT');
      if (receipt.driver_id !== owner || receipt.current_vehicle_id !== vehicleId || receipt.vehicle?.id !== vehicleId || receipt.vehicle.company_id !== listed.profile.driver.company_id || receipt.vehicle.status !== 'active') throw new ApiError(502);
      const current = await profile();
      if (current.driver.id !== owner || current.driver.company_id !== listed.profile.driver.company_id || current.driver.current_vehicle_id !== vehicleId) throw new ApiError(409);
      return current;
    },
    async tripAssignment(owner: number) {
      const current = await vehicles(owner);
      if ((current.profile.native_trip_contract_version ?? 0) < 1) throw Error('يتطلب بدء رحلة التطبيق تحديث حماية الرحلات على الخادم.');
      if (!current.vehicles.some(vehicle => vehicle.id === current.profile.driver.current_vehicle_id)) throw Error('اختر مركبة نشطة من سيارات شركتك قبل بدء الرحلة.');
      return current.profile;
    },
    async login(identity: string, password: string, otp = '') {
      const value = identity.trim();
      await request(value.includes('@') ? '/next_api/auth/login' : '/next_api/auth/driver-login',
        value.includes('@') ? {email: value, password, ...(otp ? {otp} : {})} : {phone: value, password});
      return profile();
    },
    async completeTrip(payload: Record<string, unknown>) {
      const current = await profile();
      if ((current.native_trip_contract_version ?? 0) < 1) throw new ApiError(409);
      const {_native_driver_id, _native_company_id, _native_vehicle_id, _native_environment, ...body} = payload;
      if (_native_driver_id !== undefined && current.driver.id !== _native_driver_id) throw new ApiError(409);
      return request<{id: number; completion_request_key: string; warning?: string; chiron_environment?: string; chiron_sync_state?: string}>('/next_api/trips/end', {...body, expected_company_id: _native_company_id, expected_vehicle_id: _native_vehicle_id, expected_chiron_environment: _native_environment});
    },
    async reportFleet(owner: number, point: MeterPoint) {
      if (![point.lat, point.lon, point.timestamp, point.accuracy].every(Number.isFinite)
        || Math.abs(point.lat) > 90 || Math.abs(point.lon) > 180 || point.accuracy! < 0 || point.accuracy! > 50
        || Date.now() - point.timestamp > 30000 || point.timestamp - Date.now() > 5000) throw new ApiError(400);
      const current = await profile();
      if (current.driver.id !== owner) throw new ApiError(403);
      const receipt = await request<{driver_id: number; sharing_enabled: boolean; shift_active: boolean; recorded_at: string}>('/next_api/fleet/location', {
        shift_active: true, sharing_enabled: true, latitude: point.lat, longitude: point.lon,
        accuracy_m: point.accuracy, recorded_at: new Date(point.timestamp).toISOString(),
      });
      if (receipt.driver_id !== owner || !receipt.sharing_enabled || !receipt.shift_active || Date.parse(receipt.recorded_at) !== point.timestamp) throw new ApiError(502);
      return receipt;
    },
    clearFleet: () => request('/next_api/fleet/location', {shift_active: false, sharing_enabled: false}),
    // Do not clear the session UI when server revocation fails.
    logout: () => request('/next_api/auth/logout', {}),
  };
}

// Shared refresh flight for the OS cookie jar across all native screens.
export const driverApi = createDriverApi();
