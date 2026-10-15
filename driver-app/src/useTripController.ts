import {useEffect, useRef, useState} from 'react';
import * as Location from 'expo-location';
import {nativeEngine} from './native-runtime';
import {enableBackgroundMeter, stopBackgroundMeter} from './background-meter';
import {nativeJournal} from './native-journal';
import {tripDurationSeconds, validPoint, type TripSyncReceipt, type NativeTrip} from './trip-engine';
import type {MeterPoint} from './trip-meter';
import {driverApi, type DriverProfile, type DriverVehicle} from './api';
import type {ActionGate} from './action-gate';
import {tripError} from './trip-error';
import {completedBatchReceipt} from './completed-batch-receipt';
const api = driverApi;
function pointOf(value: Location.LocationObject): MeterPoint {
  if (value.mocked) throw Error('قياس الموقع المحاكى غير مقبول.');
  const point = {lat: value.coords.latitude, lon: value.coords.longitude, timestamp: value.timestamp, accuracy: value.coords.accuracy ?? Infinity};
  if (!validPoint(point)) throw Error('انتظر موقع GPS حديثاً ودقيقاً.');
  return point;
}
async function currentPoint() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw Error('اسمح بالوصول إلى الموقع لبدء الرحلة.');
  const position = Location.getCurrentPositionAsync({accuracy: Location.Accuracy.High});
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {return pointOf(await Promise.race([position, new Promise<never>((_, reject) => {timer = setTimeout(() => reject(Error('تعذّر تحديد الموقع. حاول مجدداً.')), 15000);})]));}
  finally {clearTimeout(timer);}
}
export function useTripController({profile, onProfile, sessionBusy, actionGate, onBlockLogout, onLocation}: {profile: DriverProfile; onProfile: (profile: DriverProfile) => void; sessionBusy: boolean; actionGate: ActionGate; onBlockLogout: (blocked: boolean) => void; onLocation: (point: MeterPoint | null) => void}) {
  const engine = useRef<Awaited<ReturnType<typeof nativeEngine>> | null>(null);
  const activeRef = useRef<NativeTrip | null>(null);
  const disposed = useRef(false);
  const [trip, setTrip] = useState<NativeTrip | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [price, setPrice] = useState('');
  const [platform, setPlatform] = useState<'INTERNAL' | 'UBER' | 'BOLT' | 'HEETCH'>('INTERNAL');
  const [externalReference, setExternalReference] = useState('');
  const [payment, setPayment] = useState<'cash' | 'card'>('card');
  const [seconds, setSeconds] = useState(0);
  const [pending, setPending] = useState(0);
  const [receipt, setReceipt] = useState<TripSyncReceipt | null>(null);
  const [background, setBackground] = useState(false);
  const [vehicles, setVehicles] = useState<DriverVehicle[] | null>(null);
  const updateTrip = (value: NativeTrip | null) => {activeRef.current = value; if (!disposed.current) setTrip(value);};
  useEffect(() => {
    disposed.current = false;
    nativeJournal().then(async store => {
      if (disposed.current) return;
      const next = await nativeEngine(String(profile.driver.id));
      const restored = await next.restore();
      const waiting = await store.pending(String(profile.driver.id));
      if (disposed.current) return;
      engine.current = next; updateTrip(restored); setPending(waiting.length); setReady(true);
      if (restored) enableBackgroundMeter(restored).then(value => {if (!disposed.current) setBackground(value);}).catch(() => {if (!disposed.current) setBackground(false);});
      else await stopBackgroundMeter();
    }).catch(() => {if (!disposed.current) setError('تعذّر فتح سجل الرحلات. لا تحذف بيانات التطبيق.');});
    return () => {disposed.current = true; engine.current = null;};
  }, [profile.driver.id]);
  useEffect(() => {onBlockLogout(!ready || !!trip || busy);}, [ready, trip, busy, onBlockLogout]);
  useEffect(() => {
    if (!trip) return;
    const tick = () => {try {setSeconds(tripDurationSeconds(trip));} catch {setError('تحقق من ساعة الهاتف قبل إنهاء الرحلة.');}};
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [trip]);
  useEffect(() => {
    if (!trip?.key) return;
    let stopped = false;
    let watcher: Location.LocationSubscription | undefined;
    Location.watchPositionAsync({accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5}, value => {
      if (stopped) return;
      try {
        const point = pointOf(value); onLocation(point);
        engine.current?.point(point, trip.key).then(next => {if (!stopped) {updateTrip(next); setError('');}}).catch(() => {if (!stopped) setError('تعذّر حفظ قياس الموقع. أبقِ الرحلة مفتوحة.');});
      } catch {if (!stopped) setError('قياس الموقع غير دقيق. انتظر إشارة GPS أفضل.');}
    }).then(value => {if (stopped) value.remove(); else watcher = value;}).catch(() => {if (!stopped) setError('تعذّر تشغيل قياس الموقع.');});
    return () => {stopped = true; watcher?.remove();};
  }, [trip?.key, onLocation]);
  useEffect(() => {
    if (!trip?.key) return;
    let stopped = false;
    const timer = setInterval(() => {engine.current?.restore().then(next => {
      if (!stopped && next?.key === trip.key) {updateTrip(next); if (next.meter.lastPoint) onLocation(next.meter.lastPoint);}
    }).catch(() => {if (!stopped) setError('تعذّر استعادة قياس الرحلة.');});}, 2000);
    return () => {stopped = true; clearInterval(timer);};
  }, [trip?.key, onLocation]);
  async function start() {
    if (!engine.current || busy || sessionBusy || !actionGate.acquire()) return;
    setBusy(true); setError(''); setReceipt(null);
    try {
      const point = await currentPoint(); onLocation(point);
      const current = await api.tripAssignment(profile.driver.id);
      onProfile(current);
      const next = await engine.current.start({companyId: current.driver.company_id, vehicleId: current.driver.current_vehicle_id ?? 0,
        environment: current.company.chiron_mode, point, startAddress, endAddress, proposedPrice: Number(price.replace(',', '.')), paymentMethod: payment, platform, externalReference});
      updateTrip(next);
      try {setBackground(await enableBackgroundMeter(next, true));} catch {setBackground(false); setError('تعذّر تشغيل القياس الخلفي. أبقِ التطبيق مفتوحاً.');}
    } catch(error) {setError(tripError(error, 'تعذّر بدء الرحلة. لا تحذف بيانات التطبيق.'));}
    finally {setBusy(false); actionGate.release();}
  }
  async function synchronize() {
    if (!engine.current) return;
    const result = await engine.current.sync(payload => api.completeTrip(payload));
    if (!disposed.current) {setPending(result.remaining); setReceipt(completedBatchReceipt(result)); if (result.remaining) setError('بقيت رحلة محفوظة على الهاتف تنتظر الإرسال.');}
  }
  async function end() {
    if (!engine.current || busy || sessionBusy || !actionGate.acquire()) return;
    setBusy(true); setError('');
    try {
      const current = activeRef.current; if (!current) return;
      await engine.current.end(await currentPoint(), current.proposedPrice);
      updateTrip(null); setPending(count => count + 1); setBackground(false);
      try {await stopBackgroundMeter();} catch {setError('حُفظت الرحلة؛ تعذّر إيقاف خدمة الموقع على الهاتف.');}
      await synchronize();
    } catch(error) {setError(tripError(error, 'تعذّر إنهاء الرحلة أو إرسالها. أبقِ بيانات التطبيق وحاول مجدداً.'));}
    finally {setBusy(false); actionGate.release();}
  }
  async function changeVehicle(vehicleId?: number) {
    if (!ready || activeRef.current || pending > 0 || busy || sessionBusy || !actionGate.acquire()) return;
    setBusy(true); setError('');
    try {
      if (vehicleId !== undefined) {
        const current = await api.selectVehicle(profile.driver.id, vehicleId);
        if (!disposed.current) onProfile(current);
      }
      const listed = await api.vehicles(profile.driver.id);
      if (!disposed.current) {onProfile(listed.profile); setVehicles(listed.vehicles);}
    } catch {if (!disposed.current) {setVehicles(null); setError('تعذّر تأكيد المركبة. حدّث القائمة قبل المحاولة مجدداً.');}}
    finally {if (!disposed.current) setBusy(false); actionGate.release();}
  }
  async function retrySync() {
    if (busy || sessionBusy || !actionGate.acquire()) return;
    setBusy(true); setError('');
    try {await synchronize();} catch {setError('تعذّر إرسال الرحلة. البيانات محفوظة على الهاتف.');}
    finally {setBusy(false); actionGate.release();}
  }
  return {trip, ready, busy, error, startAddress, setStartAddress, endAddress, setEndAddress, price, setPrice, payment, setPayment, seconds, pending, receipt, background, vehicles, start, end, changeVehicle, retrySync, platform, setPlatform, externalReference, setExternalReference};
}
