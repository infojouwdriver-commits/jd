import type {TripSyncReceipt} from './trip-engine';
// The journal sends completed rides oldest first. A partial batch may only have
// acknowledged an older passenger's ride. Do not offer that receipt after ending
// the newest ride; every saved ride remains accessible explicitly in history.
export function completedBatchReceipt(result:{remaining:number;receipts:TripSyncReceipt[]}):TripSyncReceipt|null {
  return result.remaining===0 ? result.receipts.at(-1)??null : null;
}
