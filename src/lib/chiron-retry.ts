import CrudOperations from './crud-operations';
import {createPostgrestClient} from './postgrest';
import {ChironService} from './chiron-service';
import {ChironError} from './chiron-protocol';

const retryable = ['CHIRON_AUTH_UNAVAILABLE', 'CHIRON_AUTH_EXPIRED'];
const review = ['START_SENT', 'ARRIVAL_SENT'];

function canAttempt(trip: any) {
  if (review.includes(trip.chiron_sync_state)) return false;
  if (!trip.sync_error_message) return true;
  return retryable.includes(trip.sync_error_message) &&
    (!trip.last_sync_attempt || Date.now() - Date.parse(trip.last_sync_attempt) >= 30_000);
}

export function tripDelivery(trip: any) {
  if (trip.chiron_sync_state === 'COMPLETED') return 'accepted';
  if (review.includes(trip.chiron_sync_state)) {
    return trip.sync_error_message==='CHIRON_DELIVERY_UNCERTAIN' ||
      Date.now()-Date.parse(trip.last_sync_attempt)>=45_000 ? 'review' : 'pending';
  }
  if (trip.sync_error_message && !retryable.includes(trip.sync_error_message)) return 'review';
  if (trip.chiron_sync_state === 'START_ACCEPTED' && !trip.end_time) return 'accepted';
  return 'pending';
}

function publicTrip(trip: any) {
  const {chiron_departure_payload: _snapshot, ...receipt} = trip;
  return {...receipt, chiron_delivery:tripDelivery(trip)};
}

/** Trip persistence and government acknowledgement are independent receipts. */
export async function syncTripEvent(trip: any, token: string, event: 'vertrek'|'aankomst') {
  const trips=new CrudOperations('trips',token);
  if(event==='aankomst'&&trip.chiron_sync_state!=='START_ACCEPTED') trip=await trips.findById(trip.id)??trip;
  if (canAttempt(trip) && (event === 'vertrek'
    ? trip.chiron_sync_state === 'CREATED'
    : trip.chiron_sync_state === 'START_ACCEPTED')) {
    try {
      await (event === 'vertrek' ? ChironService.sendTripStart(trip.id,trip.company_id,trip,true)
        : ChironService.sendTripArrival(trip.id,trip.company_id,trip,true));
    } catch (error) {
      // Persist pre-flight failures only if no competing request advanced the event.
      if (error instanceof ChironError && error.code !== 'CHIRON_EVENT_BUSY' && !error.uncertain) {
        const update = createPostgrestClient(token).from('trips')
          .update({sync_error_message:error.code,last_sync_attempt:new Date().toISOString()})
          .eq('id',trip.id).eq('company_id',trip.company_id).eq('chiron_sync_state',trip.chiron_sync_state);
        await (trip.chiron_sync_attempts == null ? update.is('chiron_sync_attempts',null) : update.eq('chiron_sync_attempts',trip.chiron_sync_attempts));
      }
    }
  }
  const latest = await trips.findById(trip.id);
  return publicTrip(latest ?? trip);
}

export async function syncTripDeparture(trip:any,token:string) {
  const latest=await syncTripEvent(trip,token,'vertrek');
  // If END was saved while START was in flight, whichever observes the other
  // transaction last can claim the arrival. PostgreSQL still permits one send.
  return latest.end_time&&latest.chiron_sync_state==='START_ACCEPTED' ? syncTripEvent(latest,token,'aankomst') : latest;
}

/** Retries use the stored events. Sent events with an uncertain result stay quarantined. */
export async function retryChironTrip(trip:any,token:string){
  if(trip.chiron_sync_state==='COMPLETED')return publicTrip(trip);
  if(!trip.chiron_environment||!trip.ritnummer||!trip.driver_id||!trip.vehicle_id||(!trip.chiron_realtime&&!trip.end_time))throw new ChironError('أكمل بيانات الرحلة قبل المزامنة',422);
  if(!trip.chiron_realtime&&trip.chiron_sync_state==='START_ACCEPTED'&&trip.start_sync_response?.accepted!==true) {
    throw new ChironError('تحقّق من إقرار الرحلة السابقة في Chiron قبل إرسال الوصول',409,'CHIRON_DELIVERY_UNCERTAIN');
  }
  await ChironService.sendTripStart(trip.id,trip.company_id,trip);
  const current = await new CrudOperations('trips',token).findById(trip.id);
  if(current?.end_time) await ChironService.sendTripArrival(trip.id,trip.company_id,trip);
  return publicTrip(await new CrudOperations('trips',token).findById(trip.id) ?? trip);
}

export async function retryPendingTripEvents(userId: number, token: string) {
  const {data,error} = await createPostgrestClient(token).from('trips').select('*')
    .eq('user_id',userId).eq('chiron_realtime',true)
    .or(`and(or(and(chiron_sync_state.eq.CREATED,status.in.(in_progress,completed)),and(chiron_sync_state.eq.START_ACCEPTED,status.eq.completed)),or(sync_error_message.is.null,sync_error_message.in.(CHIRON_AUTH_UNAVAILABLE,CHIRON_AUTH_EXPIRED)),or(last_sync_attempt.is.null,last_sync_attempt.lt.${new Date(Date.now()-30_000).toISOString()}))`)
    .order('last_sync_attempt',{ascending:true,nullsFirst:true}).limit(2);
  if (error) throw new Error('Pending Chiron events unavailable');
  return Promise.all((data ?? []).map((trip:any)=>syncTripDeparture(trip,token)));
}
