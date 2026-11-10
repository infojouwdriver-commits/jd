import {api} from './api-client';

export type ChironDelivery = 'accepted' | 'pending' | 'review';
export interface WebTripDeparture {
  completion_request_key: string;
  start_time: string;
  start_lat: number;
  start_lon: number;
  start_address: string;
  ride_type: 'INTERNAL' | 'EXTERNAL';
  external_source?: string | null;
  external_ride_number?: string | null;
  agreed_price?: number;
  expected_company_id: number;
  expected_vehicle_id: number;
  expected_chiron_environment: string;
}
export async function submitWebDeparture(event: WebTripDeparture) {
  const receipt = await api.post<{id:number;completion_request_key:string;chiron_environment:string;chiron_delivery:ChironDelivery}>('/trips/start',event);
  if (!Number.isSafeInteger(receipt.id) || receipt.id < 1 || receipt.completion_request_key !== event.completion_request_key ||
      receipt.chiron_environment?.toLowerCase() !== event.expected_chiron_environment.toLowerCase() ||
      !['accepted','pending','review'].includes(receipt.chiron_delivery)) throw Error('Departure receipt unavailable');
  return receipt;
}

export async function submitWebCompletion(payload: Record<string,unknown>) {
  const {departure, ...body} = payload;
  if (departure) await submitWebDeparture(departure as WebTripDeparture);
  const receipt = await api.post<{id:number;completion_request_key:string;chiron_delivery?:ChironDelivery;warning?:string}>('/trips/end',body);
  if (!Number.isSafeInteger(receipt.id) || receipt.id < 1 || receipt.completion_request_key !== body.completion_request_key) {
    throw Error('Completion receipt unavailable');
  }
  return receipt;
}
