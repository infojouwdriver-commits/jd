import {matchesTrip,type ShiftList,type ShiftCommand,type DriverShift} from './shift-model.ts';
import type {NativeTrip} from './trip-engine';
export async function publishNativeTripStatus(api:{shifts:(owner:number)=>Promise<ShiftList|unknown>;shiftCommand:(owner:number,body:ShiftCommand)=>Promise<DriverShift>},owner:number,trip:NativeTrip){
 const {active}=await api.shifts(owner) as ShiftList;
 if(!active||!matchesTrip(active,trip))throw Error('SHIFT_CONFLICT');
 return api.shiftCommand(owner,{action:'status',request_id:trip.key,shift_id:active.id,expected_version:active.version,work_status:'with_passenger'});
}
