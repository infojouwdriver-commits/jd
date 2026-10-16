import type {MeterPoint} from './trip-meter';
export const API_ORIGIN = 'https://jouw-driver.duckdns.org';
export interface DriverProfile {
  native_trip_contract_version?: number;
  driver: {id: number; status?: string; full_name: string; company_id: number; current_vehicle_id: number | null};
  company: {id: number; name: string; chiron_mode: string};
}
export interface DriverVehicle {id: number; company_id: number; plate_number: string; status: string; brand?: string; model?: string}
export interface DriverTripSummary {id:number; driver_id:number; start_time:string|null; end_time:string|null; start_address:string|null; end_address:string|null; price:number; currency:string; distance:number|null; duration:number|null; chiron_environment:string|null; chiron_sync_state:string|null}
export interface DriverMessage {id:number;subject:string;message_body:string;sender_name?:string;sender_type?:string;is_read:boolean;is_locked?:boolean;created_at?:string;last_activity_at?:string}
export interface DriverReply {id:number;reply_body:string;sender_name?:string;sender_type?:string;created_at?:string}
export interface DriverNotification {id:number;title:string;message:string;notification_type?:string;is_read:boolean;created_at?:string}
export interface AccountInfo {id:number;email:string;display_name?:string;email_verification_available:boolean}
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
  async function request<T>(path: string, body?: object, method: 'GET' | 'POST' | 'PUT' = body ? 'POST' : 'GET', query?: Record<string, number>): Promise<T> {
    if (!/^\/next_api\/[a-z0-9/-]+$/.test(path)) throw new Error('Invalid API path');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const params = new URLSearchParams();
      for (const [key,value] of Object.entries(query ?? {})) {if (!/^[a-z_]+$/.test(key) || !Number.isSafeInteger(value) || value < 0) throw new ApiError(400); params.set(key,String(value));}
      const response = await transport(API_ORIGIN + path + (params.size ? `?${params}` : ''), {
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
    async pushRegistration(owner:number,installation_id:string,enabled:boolean,token?:string,language='ar') {
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      const receipt=await request<{enabled:boolean}>('/next_api/push/devices',{installation_id,enabled,...(token?{token}:{}),language});
      if(receipt.enabled!==enabled)throw new ApiError(502);return receipt;
    },
    async pushTest(owner:number,installation_id:string) {
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      return request<{job_id:string;state:string}>('/next_api/push/test',{installation_id});
    },
    async pushReceipt(owner:number,job_id:string) {
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      return request<{recorded:boolean}>('/next_api/push/receipt',{job_id});
    },
    async history(owner:number, offset=0) {
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000) throw new ApiError(400);
      const current = await profile(); if (current.driver.id !== owner) throw new ApiError(403);
      const page = await request<{driver_id:number;trips:DriverTripSummary[];next_offset:number|null}>('/next_api/drivers/trips',undefined,'GET',{limit:25,offset});
      if (page.driver_id !== owner || !Array.isArray(page.trips) || page.trips.length > 25
        || (page.next_offset !== null && page.next_offset !== offset + 25)
        || page.trips.some(trip=>!Number.isSafeInteger(trip.id) || trip.id < 1 || trip.driver_id !== owner || (trip.start_address !== null && typeof trip.start_address !== 'string') || (trip.end_address !== null && typeof trip.end_address !== 'string') || (trip.start_time !== null && !Number.isFinite(Date.parse(trip.start_time))) || (trip.end_time !== null && !Number.isFinite(Date.parse(trip.end_time))) || !Number.isFinite(trip.price) || trip.price < 0 || (trip.distance !== null && (!Number.isFinite(trip.distance) || trip.distance < 0)) || (trip.duration !== null && (!Number.isFinite(trip.duration) || trip.duration < 0)) || trip.currency !== 'EUR')) throw new ApiError(502);
      return page;
    },
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
      if (current.profile.driver.status !== 'active') throw Error('حساب السائق غير نشط لبدء رحلة.');
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
    async messages(owner:number) {
      if ((await profile()).driver.id !== owner) throw new ApiError(403);
      const rows=await request<DriverMessage[]>('/next_api/messages/driver');
      if(!Array.isArray(rows)||rows.length>100||rows.some(row=>!Number.isSafeInteger(row.id)||row.id<1||typeof row.subject!=='string'||typeof row.message_body!=='string'||row.message_body.length>10000))throw new ApiError(502);
      return rows;
    },
    async sendMessage(owner:number,subject:string,message:string,parent?:number) {
      if ((await profile()).driver.id !== owner) throw new ApiError(403);
      if(!message.trim()||message.length>10000||(!parent&&(!subject.trim()||subject.length>200))||(parent!==undefined&&(!Number.isSafeInteger(parent)||parent<1)))throw new ApiError(400);
      return parent?request('/next_api/messages/replies',{parent_message_id:parent,reply_body:message.trim()}):request('/next_api/messages',{subject:subject.trim(),message_body:message.trim()});
    },
    async replies(owner:number,id:number) {
      if(!Number.isSafeInteger(id)||id<1)throw new ApiError(400);
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      const rows=await request<DriverReply[]>('/next_api/messages/replies',undefined,'GET',{message_id:id});
      if(!Array.isArray(rows)||rows.length>500||rows.some(row=>!Number.isSafeInteger(row.id)||typeof row.reply_body!=='string'))throw new ApiError(502);
      return rows;
    },
    async readMessage(owner:number,id:number) {
      if(!Number.isSafeInteger(id)||id<1)throw new ApiError(400);
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      return request('/next_api/messages/mark-read',{message_id:id});
    },
    async notifications(owner:number) {
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      const rows=await request<DriverNotification[]>('/next_api/notifications/driver');
      if(!Array.isArray(rows)||rows.length>100||rows.some(row=>!Number.isSafeInteger(row.id)||row.id<1||typeof row.title!=='string'||typeof row.message!=='string'))throw new ApiError(502);
      return rows;
    },
    async readNotification(owner:number,id:number) {
      if(!Number.isSafeInteger(id)||id<1)throw new ApiError(400);
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      return request('/next_api/notifications/mark-read',{notification_id:id});
    },
    account:()=>request<AccountInfo>('/next_api/auth/account'),
    async changeAccount(owner:number,body:{action:'request_email_code'|'update_email'|'update_password';current_password:string;email?:string;passcode?:string;password?:string}) {
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      return request<{sent?:boolean;updated?:boolean;sign_in_required?:boolean}>('/next_api/auth/account',body);
    },
    async invoice(owner:number,id:number) {
      if(!Number.isSafeInteger(id)||id<1)throw new ApiError(400);
      if((await profile()).driver.id!==owner)throw new ApiError(403);
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
      try {
        const response=await transport(API_ORIGIN+'/next_api/trips/generate-invoice?id='+id,{method:'POST',credentials:'include',redirect:'error',headers:{Origin:API_ORIGIN,Accept:'application/pdf'},signal:controller.signal});
        if(!response.ok)throw new ApiError(response.status);
        if(!response.headers.get('content-type')?.toLowerCase().startsWith('application/pdf')||Number(response.headers.get('content-length'))>8000000)throw new ApiError(502);
        const bytes=new Uint8Array(await response.arrayBuffer());
        if(bytes.length<5||bytes.length>8000000||String.fromCharCode(...bytes.subarray(0,5))!=='%PDF-')throw new ApiError(502);
        return bytes;
      }finally{clearTimeout(timer);}
    },
    clearFleet: () => request('/next_api/fleet/location', {shift_active: false, sharing_enabled: false}),
    // Do not clear the session UI when server revocation fails.
    logout: () => request('/next_api/auth/logout', {}),
  };
}

// Shared refresh flight for the OS cookie jar across all native screens.
export const driverApi = createDriverApi();
