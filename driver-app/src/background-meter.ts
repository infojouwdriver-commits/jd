import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import {nativeEngine} from './native-runtime';
import {validPoint, type NativeTrip} from './trip-engine';
const TASK = 'jouw-driver-active-trip-meter-v1';
const CONTEXT = 'jd-active-meter-context';
interface Context {owner: string; key: string}
async function context(): Promise<Context | null> {
  const raw = await SecureStore.getItemAsync(CONTEXT);
  if (!raw) return null;
  const value = JSON.parse(raw) as Context;
  if (!/^[1-9]\d*$/.test(value.owner) || !/^[a-f0-9-]{36}$/i.test(value.key)) throw Error('Invalid meter context');
  return value;
}
// Module scope is required for a headless background launch; this module is loaded by _layout.
TaskManager.defineTask<{locations: Location.LocationObject[]}>(TASK, async ({data, error}) => {
  if (error || !data?.locations) return;
  const current = await context();
  if (!current) return;
  const engine = await nativeEngine(current.owner);
  for (const value of [...data.locations].sort((a, b) => a.timestamp - b.timestamp)) {
    if (value.mocked) continue;
    const point = {lat: value.coords.latitude, lon: value.coords.longitude, timestamp: value.timestamp, accuracy: value.coords.accuracy ?? Infinity};
    // Delayed batches are rejected instead of billing an invented gap.
    if (validPoint(point)) await engine.point(point, current.key);
  }
});
export async function enableBackgroundMeter(trip: NativeTrip, askPermission = false): Promise<boolean> {
  const engine = await nativeEngine(trip.owner);
  if ((await engine.restore())?.key !== trip.key) return false;
  if (!await TaskManager.isAvailableAsync()) return false;
  let permission = await Location.getBackgroundPermissionsAsync();
  if (!permission.granted && askPermission) permission = await Location.requestBackgroundPermissionsAsync();
  if (!permission.granted) return false;
  await SecureStore.setItemAsync(CONTEXT, JSON.stringify({owner: trip.owner, key: trip.key}), {keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY});
  try {
    await Location.startLocationUpdatesAsync(TASK, {
      accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5,
      deferredUpdatesInterval: 0, pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.AutomotiveNavigation,
      showsBackgroundLocationIndicator: true,
      foregroundService: {notificationTitle: 'JOUW DRIVER · رحلة نشطة', notificationBody: 'يُقاس موقعك لحفظ مسافة الرحلة الحالية.', notificationColor: '#A8E86C', killServiceOnDestroy: true},
    });
    return true;
  } catch(error) {await SecureStore.deleteItemAsync(CONTEXT); throw error;}
}
export async function stopBackgroundMeter() {
  // Removing context first makes any queued callback a no-op even if OS stop fails.
  await SecureStore.deleteItemAsync(CONTEXT);
  if (await Location.hasStartedLocationUpdatesAsync(TASK)) await Location.stopLocationUpdatesAsync(TASK);
}
