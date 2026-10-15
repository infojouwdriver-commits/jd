export interface ChironTestMessage {
  success?: boolean;
  status?: string;
  messageType?: string;
  httpStatus?: number;
  ritnummer?: string;
  error?: string;
  vertrek?: boolean;
  aankomst?: boolean;
  [key: string]: unknown;
}

/** Current API boolean takes precedence; historical reports used a status string. */
export function isAcceptedTestMessage(message: ChironTestMessage): boolean {
  if (typeof message.success === 'boolean') return message.success;
  return message.status === 'success';
}

export function acceptanceReportMessages(messages: ChironTestMessage[]) {
  return messages.map(message => ({ ...message,
    ritnummer: message.ritnummer || 'N/A',
    status: isAcceptedTestMessage(message) ? 'success' as const : 'failed' as const,
    vertrek: message.messageType ? message.messageType === 'vertrek' : message.vertrek === true,
    aankomst: message.messageType ? message.messageType === 'aankomst' : message.aankomst === true,
  }));
}

export interface AcceptanceReportData {
  company: {id:number;name:string;kbo_number?:string;vat_number?:string;address?:string;email?:string;phone?:string};
  driver: {id:number;full_name:string;capacity_certificate_number?:string;phone?:string};
  vehicle: {id:number;brand?:string;model?:string;plate_number:string};
  testDate:string;totalMessages:number;successCount:number;failedCount:number;results:ChironTestMessage[];
}
export interface AcceptanceTrip {
  ritnummer:string;departure:ChironTestMessage[];arrival:ChironTestMessage[];
  details:Record<string,unknown>;conflictingDetails:boolean;
}
export function acceptanceTrips(messages:ChironTestMessage[]):AcceptanceTrip[] {
  const groups=new Map<string,AcceptanceTrip>();
  const keys=['startAddress','endAddress','startTime','endTime','startLat','startLon','endLat','endLon','distanceKm','price'];
  messages.forEach((message,index)=>{
    const id=typeof message.ritnummer==='string'&&message.ritnummer.trim()?message.ritnummer.trim():`Niet geregistreerd (${index+1})`;
    let trip=groups.get(id);if(!trip){trip={ritnummer:id,departure:[],arrival:[],details:{},conflictingDetails:false};groups.set(id,trip);}
    for(const key of keys){const value=message[key];if(value===undefined||value===null||value==='')continue;if(trip.details[key]!==undefined&&trip.details[key]!==value)trip.conflictingDetails=true;else trip.details[key]=value;}
    const event=typeof message.messageType==='string'?message.messageType.toLowerCase():'';
    if(event==='vertrek')trip.departure.push(message);
    else if(event==='aankomst')trip.arrival.push(message);
    else if(!event){
      // Historical reports stored the two event results on one ride row.
      if(typeof message.vertrek==='boolean')trip.departure.push({...message,success:message.vertrek});
      if(typeof message.aankomst==='boolean')trip.arrival.push({...message,success:message.aankomst});
    }
  });
  return [...groups.values()];
}
export function reportEventAccepted(events:ChironTestMessage[]):boolean {
  return events.length===1&&isAcceptedTestMessage(events[0])&&!['uncertain','not_sent','failed'].includes(String(events[0].deliveryState));
}
export function acceptanceSummary(data:AcceptanceReportData){
 const trips=acceptanceTrips(data.results),events=trips.flatMap(t=>[...t.departure,...t.arrival]);
 const accepted=events.filter(m=>isAcceptedTestMessage(m)&&!['uncertain','not_sent','failed'].includes(String(m.deliveryState))).length;
 const complete=trips.length===5&&events.length===10&&data.totalMessages===10&&data.successCount===10&&data.failedCount===0&&trips.every(t=>!t.conflictingDetails&&!t.ritnummer.startsWith('Niet geregistreerd')&&reportEventAccepted(t.departure)&&reportEventAccepted(t.arrival));
 return {trips,total:events.length,accepted,unconfirmed:events.length-accepted,complete};
}
