import * as SecureStore from 'expo-secure-store';
import {createShiftIntent} from './shift-intent';
import {driverApi} from './api';
export const shiftIntentKey=(owner:number)=>`jd-shift-intent-${owner}`;
export function nativeShiftIntent(owner:number){const key=shiftIntentKey(owner);return createShiftIntent({get:()=>SecureStore.getItemAsync(key),set:value=>SecureStore.setItemAsync(key,value),clear:()=>SecureStore.deleteItemAsync(key)},body=>driverApi.shiftCommand(owner,body));}
export async function hasShiftIntent(owner:number){return !!await SecureStore.getItemAsync(shiftIntentKey(owner));}
