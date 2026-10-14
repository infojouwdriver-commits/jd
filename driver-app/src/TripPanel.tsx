import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import * as Location from 'expo-location';
import {nativeEngine} from './native-runtime';
import {enableBackgroundMeter, stopBackgroundMeter} from './background-meter';
import {nativeJournal} from './native-journal';
import {tripDurationSeconds, validPoint, type TripSyncReceipt, type NativeTrip} from './trip-engine';
import type {MeterPoint} from './trip-meter';
import {driverApi, type DriverProfile, type DriverVehicle} from './api';
import type {ActionGate} from './action-gate';
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
export default function TripPanel({profile, onProfile, sessionBusy, actionGate, onBlockLogout, onLocation}: {profile: DriverProfile; onProfile: (profile: DriverProfile) => void; sessionBusy: boolean; actionGate: ActionGate; onBlockLogout: (blocked: boolean) => void; onLocation: (point: MeterPoint | null) => void}) {
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
        environment: current.company.chiron_mode, point, startAddress, endAddress, proposedPrice: Number(price.replace(',', '.')), paymentMethod: payment});
      updateTrip(next);
      try {setBackground(await enableBackgroundMeter(next, true));} catch {setBackground(false); setError('تعذّر تشغيل القياس الخلفي. أبقِ التطبيق مفتوحاً.');}
    } catch(error) {setError(error instanceof Error ? error.message : 'تعذّر بدء الرحلة.');}
    finally {setBusy(false); actionGate.release();}
  }
  async function synchronize() {
    if (!engine.current) return;
    const result = await engine.current.sync(payload => api.completeTrip(payload));
    if (!disposed.current) {setPending(result.remaining); if (result.receipts.length) setReceipt(result.receipts[result.receipts.length - 1]); if (result.remaining) setError('بقيت رحلة محفوظة على الهاتف تنتظر الإرسال.');}
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
    } catch(error) {setError(error instanceof Error ? error.message : 'تعذّر إنهاء الرحلة.');}
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
  const time = `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds / 60 % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  return <View style={styles.panel}>
    <Text style={styles.heading}>الرحلة</Text>
    {receipt && <Text accessibilityRole="text" style={styles.note}>حُفظت الرحلة رقم {receipt.id} على الخادم · {receipt.chiron === 'production' ? 'الخادم أكد إقرار Chiron في الإنتاج' : receipt.chiron === 'test' ? 'إقرار Chiron في بيئة الاختبار' : 'إقرار Chiron لم يتأكد'}</Text>}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {trip ? <>
      <Text style={styles.timer}>{time}</Text><Text style={styles.distance}>{trip.meter.distanceKm.toFixed(2)} كم</Text>
      <Text style={styles.text}>السعر المتفق عليه: {trip.proposedPrice.toFixed(2)} €</Text>
      <Text style={styles.note}>{background ? 'خدمة القياس الخلفي مسجلة · قبول الهاتف قيد الاختبار.' : 'القياس أمامي فقط · أبقِ التطبيق مفتوحاً.'}</Text>
      <Pressable disabled={busy || sessionBusy} accessibilityRole="button" onPress={end} style={styles.button}>{busy ? <ActivityIndicator/> : <Text>إنهاء الرحلة وحفظها</Text>}</Pressable>
    </> : <>
      <Text style={styles.text}>المركبة الحالية: {vehicles?.find(vehicle => vehicle.id === profile.driver.current_vehicle_id)?.plate_number ?? (profile.driver.current_vehicle_id ? `رقم ${profile.driver.current_vehicle_id}` : 'لم تُحدد')}</Text>
      <Pressable accessibilityRole="button" disabled={!ready || busy || sessionBusy || pending > 0} onPress={() => changeVehicle()} style={styles.method}><Text style={styles.text}>تحميل سيارات الشركة / تحديث القائمة</Text></Pressable>
      {pending > 0 && <Text style={styles.note}>أرسل الرحلات المحفوظة قبل تغيير المركبة.</Text>}
      {vehicles && <View style={{gap:8}}>{vehicles.length ? vehicles.map(vehicle => <Pressable key={vehicle.id} accessibilityRole="radio" accessibilityState={{checked: vehicle.id === profile.driver.current_vehicle_id, disabled: busy || sessionBusy || pending > 0}} disabled={busy || sessionBusy || pending > 0} onPress={() => changeVehicle(vehicle.id)} style={[styles.method, vehicle.id === profile.driver.current_vehicle_id && styles.selected]}><Text style={styles.text}>{vehicle.plate_number} · {[vehicle.brand, vehicle.model].filter(Boolean).join(' ')}</Text></Pressable>) : <Text style={styles.note}>لا توجد مركبة نشطة متاحة لشركتك.</Text>}</View>}
      <TextInput accessibilityLabel="عنوان الانطلاق" placeholder="عنوان الانطلاق" placeholderTextColor="#8294a6" style={styles.input} value={startAddress} onChangeText={setStartAddress} editable={ready && !busy && !sessionBusy}/>
      <TextInput accessibilityLabel="عنوان الوصول" placeholder="عنوان الوصول" placeholderTextColor="#8294a6" style={styles.input} value={endAddress} onChangeText={setEndAddress} editable={ready && !busy && !sessionBusy}/>
      <TextInput accessibilityLabel="السعر المتفق عليه باليورو" placeholder="السعر المتفق عليه €" placeholderTextColor="#8294a6" style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" editable={ready && !busy && !sessionBusy}/>
      <View style={styles.methods}>{(['card', 'cash'] as const).map(method => <Pressable key={method} accessibilityRole="radio" accessibilityState={{checked: payment === method}} disabled={busy || sessionBusy} onPress={() => setPayment(method)} style={[styles.method, payment === method && styles.selected]}><Text style={styles.text}>{method === 'cash' ? 'نقداً' : 'بطاقة'}</Text></Pressable>)}</View>
      {!profile.driver.current_vehicle_id && <Text style={styles.note}>حدد مركبتك قبل بدء الرحلة.</Text>}
      <Pressable disabled={!ready || busy || sessionBusy || !profile.driver.current_vehicle_id} accessibilityRole="button" onPress={start} style={[styles.button, (!ready || busy || sessionBusy || !profile.driver.current_vehicle_id) && {opacity: 0.5}]}>{busy ? <ActivityIndicator/> : <Text>بدء الرحلة</Text>}</Pressable>
    </>}
    {!trip && <Text style={styles.note}>عند بدء الرحلة نطلب إذن الموقع في الخلفية لقياس المسافة أثناء قفل الشاشة. إن رفضته يبقى القياس أمامياً. إنهاء الرحلة يوقف الخدمة.</Text>}
    {pending > 0 && <Pressable disabled={busy || sessionBusy} accessibilityRole="button" onPress={retrySync}><Text style={styles.note}>رحلات تنتظر الإرسال: {pending} · إعادة المحاولة</Text></Pressable>}
  </View>;
}
const styles = StyleSheet.create({panel:{backgroundColor:'#15212c',padding:20,borderRadius:24,gap:12},heading:{color:'#fff',fontSize:22,fontWeight:'700',textAlign:'right'},text:{color:'#dbe5ee',textAlign:'right',fontSize:15},input:{backgroundColor:'#0c141d',padding:14,borderRadius:12,color:'#fff',textAlign:'right',fontSize:16},button:{backgroundColor:'#a8e86c',alignItems:'center',padding:16,borderRadius:14},methods:{flexDirection:'row',gap:12},method:{flex:1,padding:12,borderRadius:10,borderWidth:1,borderColor:'#334655'},selected:{borderColor:'#a8e86c'},timer:{fontSize:42,color:'#fff',fontWeight:'700',textAlign:'center',fontVariant:['tabular-nums']},distance:{fontSize:22,color:'#a8e86c',textAlign:'center'},note:{color:'#a6b5c4',textAlign:'right',lineHeight:22},error:{color:'#ffc9c9',textAlign:'right',lineHeight:22}});
