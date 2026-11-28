import type {TripSyncReceipt} from './trip-engine';

export type ChironProof = 'production' | 'test' | 'pending' | 'review' | 'unconfirmed';

export function receiptProof(receipt:TripSyncReceipt):ChironProof {
  return receipt.chiron==='unconfirmed' ? receipt.chironDelivery ?? 'unconfirmed' : receipt.chiron;
}

export function historyProof(state:string|null,environment:string|null):ChironProof {
  if(state==='COMPLETED'&&(environment==='production'||environment==='test'))return environment;
  return 'unconfirmed';
}
