import CrudOperations from './crud-operations';
import {ChironService} from './chiron-service';
import {ChironError} from './chiron-protocol';
/** Retry the stored original events without repricing, creating trips, or resetting timestamps. */
export async function retryChironTrip(trip:any,token:string){
 if(trip.chiron_sync_state==='COMPLETED')return trip;
 if(!trip.end_time||!trip.ritnummer||!trip.driver_id||!trip.vehicle_id)throw new ChironError('أكمل بيانات الرحلة قبل المزامنة',422);
 await ChironService.sendTripStart(trip.id,trip.company_id,trip);
 await ChironService.sendTripArrival(trip.id,trip.company_id,trip);
 return await new CrudOperations('trips',token).findById(trip.id);
}
