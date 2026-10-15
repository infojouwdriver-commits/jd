import {randomUUID} from 'expo-crypto';
import {nativeJournal} from './native-journal';
import {createTripEngine} from './trip-engine';
const engines = new Map<string, Promise<ReturnType<typeof createTripEngine>>>();
// UI and headless tasks share one serialized writer in the same JS runtime.
export function nativeEngine(owner: string) {
  let value = engines.get(owner);
  if (!value) {
    value = nativeJournal().then(store => createTripEngine(owner, store, randomUUID));
    engines.set(owner, value);
    value.catch(() => engines.delete(owner));
  }
  return value;
}
