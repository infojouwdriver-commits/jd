import {shiftUuid,shiftStatuses,type ShiftCommand,type DriverShift} from './shift-model.ts';
export interface ShiftIntentStore {get():Promise<string|null>;set(value:string):Promise<void>;clear():Promise<void>}
// Persist before sending. An ambiguous response freezes the exact UUID/body,
// even after app restart; only explicit retry may resend a declaration.
export function createShiftIntent(store:ShiftIntentStore,send:(body:ShiftCommand)=>Promise<DriverShift>){
 let pending:ShiftCommand|null=null,flight=false;
 return {
  async restore(){const raw=await store.get();if(raw){const value=JSON.parse(raw) as ShiftCommand;if(!value||!shiftUuid(value.request_id)||!shiftUuid(value.shift_id)||!['start','record','end','status'].includes(value.action)||!Number.isSafeInteger(value.expected_version)||value.expected_version<(value.action==='start'?0:1)||value.action==='start'&&(value.expected_version!==0||value.request_id!==value.shift_id)||!shiftStatuses.includes(value.work_status))throw Error('Invalid saved shift request');
   if(value.action==='status'){if(!['available','break','with_passenger'].includes(value.work_status)||'odometer' in value||'passenger_km' in value)throw Error('Invalid saved shift request');}
   else if(![value.odometer,value.passenger_km].every(n=>Number.isFinite(n)&&n>=0&&n<=9999999.99&&Math.abs(n*100-Math.round(n*100))<.00001)||value.action==='start'&&value.passenger_km!==0)throw Error('Invalid saved shift request');
   pending=value;}return pending;},
  current:()=>pending,
  async submit(body?:ShiftCommand){if(flight)throw Error('Shift request busy');flight=true;try{
    if(!pending){if(!body)throw Error('Shift request missing');await store.set(JSON.stringify(body));pending=body;}
    const result=await send(pending);await store.clear();pending=null;return result;
   }catch(error){const status=(error as {status?:number}).status;if([400,403,409].includes(status||0)){await store.clear();pending=null;}throw error;}finally{flight=false;}}
 };
}
