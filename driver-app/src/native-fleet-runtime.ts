import {driverApi} from './api';
import type {MeterPoint} from './trip-meter';
interface State {paused: boolean; lastAttempt: number; inFlight: Promise<boolean> | null}
const owners = new Map<number, State>();
function state(owner: number) {
  let value = owners.get(owner);
  if (!value) {value = {paused: false, lastAttempt: -Infinity, inFlight: null}; owners.set(owner, value);}
  return value;
}
export function resumeFleetPublishing(owner: number) {state(owner).paused = false;}
export async function stopFleetPublishing(owner: number) {
  const value = state(owner); value.paused = true;
  try {await value.inFlight;} catch { /* Logout explicitly handles the final server clear. */ }
}
export function publishFleetPoint(owner: number, point: MeterPoint): Promise<boolean> {
  const value = state(owner);
  if (value.paused || value.inFlight || Date.now() - value.lastAttempt < 20000) return Promise.resolve(false);
  value.lastAttempt = Date.now();
  // No offline queue: a later callback reports a fresh point, never old location history.
  return value.inFlight = driverApi.reportFleet(owner, point).then(() => true).finally(() => {value.inFlight = null;});
}
