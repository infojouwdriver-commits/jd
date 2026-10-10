import CrudOperations from './crud-operations';
import { ChironService } from './chiron-service';

/** Retry original events without changing the completed business record. */
export async function retryChironTrip(trip: any, token: string) {
  if (process.env.CHIRON_TRANSMISSION_ENABLED !== 'true') throw new Response(null,{status:503});
  if (['ARRIVAL_SENT','COMPLETED'].includes(trip.chiron_sync_state)) return trip;
  if (!trip.end_time || !trip.ritnummer || !trip.driver_id || !trip.vehicle_id) throw new Response(null,{status:409});
  const crud = new CrudOperations('trips',token);
  const event = {driver_id:trip.driver_id,vehicle_id:trip.vehicle_id,start_time:trip.start_time,start_lat:trip.start_lat,start_lon:trip.start_lon,ritnummer:trip.ritnummer,external_source:trip.external_source || undefined};
  try {
    if (!['START_SENT','START_ACCEPTED'].includes(trip.chiron_sync_state)) await ChironService.sendTripStart(trip.id,trip.company_id,event);
    await ChironService.sendTripArrival(trip.id,trip.company_id,{...event,end_time:trip.end_time,end_lat:trip.end_lat,end_lon:trip.end_lon,distance_km:Number(trip.distance_km || 0),price:Number(trip.price)});
    await crud.update(trip.id,{last_sync_attempt:new Date().toISOString(),sync_error_message:null});
    return await crud.findById(trip.id);
  } catch(error) {
    await crud.update(trip.id,{chiron_sync_attempts:Number(trip.chiron_sync_attempts || 0)+1,last_sync_attempt:new Date().toISOString(),sync_error_message:'Chiron retry failed'});
    throw error;
  }
}
