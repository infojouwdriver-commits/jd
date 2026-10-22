import {addMeterPoint, emptyMeter, type MeterPoint, type MeterState} from './trip-meter';
export interface NativeTrip {
  shiftId?:string;
  key: string; revision: number; owner: string; companyId: number; vehicleId: number; environment: string;
  startTime: string; start: MeterPoint; startAddress: string; endAddress: string;
  proposedPrice: number; paymentMethod: string; meter: MeterState; navigationDestination?: {lat:number;lon:number}; platform?: 'INTERNAL' | 'UBER' | 'BOLT' | 'HEETCH'; externalReference?: string;
}
export interface TripSyncReceipt {id: number; chiron: 'production' | 'test' | 'unconfirmed'}
function durableReceipt(value: unknown, key: string, owner: string, expectedEnvironment: unknown): TripSyncReceipt | null {
  if (!value || typeof value !== 'object') return null;
  const receipt = value as Record<string, unknown>;
  if (!Number.isSafeInteger(receipt.id) || Number(receipt.id) < 1 || typeof receipt.completion_request_key !== 'string' || receipt.completion_request_key.toLowerCase() !== key.toLowerCase() || receipt.driver_id !== Number(owner)) return null;
  const environment = typeof receipt.chiron_environment === 'string' ? receipt.chiron_environment.toLowerCase() : '';
  const confirmed = receipt.chiron_sync_state === 'COMPLETED' && !receipt.warning && typeof expectedEnvironment === 'string' && environment === expectedEnvironment.toLowerCase();
  return {id: Number(receipt.id), chiron: confirmed && (environment === 'production' || environment === 'test') ? environment : 'unconfirmed'};
}
export interface TripStore {
  active(owner: string): Promise<NativeTrip | null>;
  create(trip: NativeTrip): Promise<void>;
  update(trip: NativeTrip): Promise<void>;
  complete(trip: NativeTrip, payload: Record<string, unknown>): Promise<void>;
  pending(owner: string): Promise<{key: string; payload: Record<string, unknown>}[]>;
  acknowledge(owner: string, key: string): Promise<void>;
}
export function validPoint(point: MeterPoint, now = Date.now()): boolean {
  return [point.lat, point.lon, point.timestamp, point.accuracy].every(Number.isFinite)
    && Math.abs(point.lat) <= 90 && Math.abs(point.lon) <= 180
    && point.accuracy! >= 0 && point.accuracy! <= 50
    && now - point.timestamp >= -5000 && now - point.timestamp <= 30000;
}
function address(value: string) {
  const result = value.trim();
  if (!result || result.length > 500) throw Error('أدخل عنواناً صحيحاً.');
  return result;
}
export function tripDurationSeconds(trip: NativeTrip, now = Date.now()) {
  const start = Date.parse(trip.startTime);
  if (!Number.isFinite(start) || now < start) throw Error('تغيّر وقت الهاتف. تحقق من الساعة.');
  return Math.floor((now - start) / 1000);
}
// Writes are serialized. UI may only mark a transition successful after persistence succeeds.
export function createTripEngine(owner: string, store: TripStore, uuid: () => string, clock: () => number = Date.now) {
  if (!/^[1-9]\d*$/.test(owner)) throw Error('ملف السائق مطلوب.');
  let sequence: Promise<unknown> = Promise.resolve();
  const serial = <T>(operation: () => Promise<T>): Promise<T> => {
    const task = sequence.then(operation); sequence = task.catch(() => {}); return task;
  };
  let syncing: Promise<{sent: number; remaining: number; receipts: TripSyncReceipt[]}> | null = null;
  return {
    restore: () => serial(() => store.active(owner)),
    start: (input: {shiftId?:string;companyId: number; vehicleId: number; environment: string; point: MeterPoint; startAddress: string; endAddress: string; proposedPrice: number; paymentMethod: string; navigationDestination?: {lat:number;lon:number}; platform?: 'INTERNAL' | 'UBER' | 'BOLT' | 'HEETCH'; externalReference?: string}) => serial(async () => {
      if (await store.active(owner)) throw Error('توجد رحلة نشطة. استأنفها أولاً.');
      if (!validPoint(input.point, clock())) throw Error('انتظر موقع GPS حديثاً ودقيقاً.');
      if (![input.companyId, input.vehicleId].every(n => Number.isSafeInteger(n) && n > 0)) throw Error('الشركة والمركبة مطلوبتان.');
      if (!Number.isFinite(input.proposedPrice) || input.proposedPrice <= 0 || input.proposedPrice > 100000) throw Error('السعر غير صالح.');
      if (!['TEST', 'PRODUCTION'].includes(input.environment.toUpperCase())) throw Error('بيئة الشركة غير صالحة.');
      if (!['cash', 'card'].includes(input.paymentMethod)) throw Error('طريقة الدفع غير صالحة.');
      if (input.platform && !['INTERNAL','UBER','BOLT','HEETCH'].includes(input.platform)) throw Error('Invalid platform');
      if (input.externalReference && (input.externalReference.length > 100 || /[\r\n]/.test(input.externalReference))) throw Error('Invalid platform reference');
      if(input.navigationDestination && (!Number.isFinite(input.navigationDestination.lat)||!Number.isFinite(input.navigationDestination.lon)||Math.abs(input.navigationDestination.lat)>90||Math.abs(input.navigationDestination.lon)>180))throw Error('Invalid destination');
      const key = uuid();
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(key)) throw Error('Trip key invalid');
      const trip: NativeTrip = {key, revision: 0, owner, companyId: input.companyId, vehicleId: input.vehicleId, environment: input.environment,
        ...(input.shiftId?{shiftId:input.shiftId}:{}),startTime: new Date(clock()).toISOString(), start: input.point,
        startAddress: address(input.startAddress), endAddress: address(input.endAddress),
        proposedPrice: input.proposedPrice, paymentMethod: input.paymentMethod, ...(input.platform ? {platform: input.platform, externalReference: input.externalReference?.trim() || undefined} : {}),
        ...(input.navigationDestination?{navigationDestination:{...input.navigationDestination}}:{}),
        meter: addMeterPoint(emptyMeter(), input.point)};
      await store.create(trip); return trip;
    }),
    point: (point: MeterPoint, expectedKey?: string) => serial(async () => {
      const trip = await store.active(owner); if (!trip || (expectedKey && trip.key !== expectedKey)) return null;
      if (!validPoint(point, clock())) return trip;
      const next = {...trip, revision: trip.revision + 1, meter: addMeterPoint(trip.meter, point)};
      await store.update(next); return next;
    }),
    end: (point: MeterPoint, price: number) => serial(async () => {
      const trip = await store.active(owner); if (!trip) throw Error('لا توجد رحلة نشطة.');
      if (!validPoint(point, clock())) throw Error('موقع نهاية الرحلة غير متاح. أبقِ الرحلة مفتوحة.');
      if (!Number.isFinite(price) || price <= 0 || price > 100000) throw Error('السعر غير صالح.');
      const meter = addMeterPoint(trip.meter, point);
      const duration = tripDurationSeconds(trip, clock());
      const payload = {completion_request_key: trip.key, start_time: trip.startTime, end_time: new Date(clock()).toISOString(),
        start_lat: trip.start.lat, start_lon: trip.start.lon, end_lat: point.lat, end_lon: point.lon,
        start_address: trip.startAddress, end_address: trip.endAddress,
        distance_km: Number(meter.distanceKm.toFixed(2)), duration_minutes: Math.floor(duration / 60),
        actual_distance_km: Number(meter.distanceKm.toFixed(2)), actual_duration_minutes: Math.floor(duration / 60),
        price, initial_proposed_price: trip.proposedPrice, driver_adjusted_price: price !== trip.proposedPrice ? price : null,
        payment_method: trip.paymentMethod, ride_type: trip.platform && trip.platform !== 'INTERNAL' ? 'EXTERNAL' : 'INTERNAL', currency: 'EUR',
        ...(trip.platform && trip.platform !== 'INTERNAL' ? {external_source: trip.platform, external_ride_number: trip.externalReference || null} : {}),
        _native_company_id: trip.companyId, _native_vehicle_id: trip.vehicleId, _native_environment: trip.environment};
      await store.complete(trip, payload); return payload;
    }),
    sync(send: (payload: Record<string, unknown>) => Promise<unknown>) {
      return syncing ?? (syncing = serial(async () => {
        let sent = 0; const receipts: TripSyncReceipt[] = [];
        for (const item of await store.pending(owner)) {
          try {
            const receipt = durableReceipt(await send({...item.payload, _native_driver_id: Number(owner)}), item.key, owner, item.payload._native_environment);
            if (!receipt) break;
            await store.acknowledge(owner, item.key); sent++; receipts.push(receipt);
          } catch {break;}
        }
        return {sent, remaining: (await store.pending(owner)).length, receipts};
      }).finally(() => {syncing = null;}));
    },
  };
}
