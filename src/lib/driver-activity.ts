// Authenticated driver reporting: Brussels civil dates; gross completed-trip amounts.
export const activityColumns='id,user_id,driver_id,start_time,end_time,start_address,end_address,price,currency,distance_km,duration_minutes,status,ride_type,external_source,payment_method,chiron_environment,chiron_sync_state';
export function civilDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw Error('Invalid date');return value;}
export function brusselsDay(value:string){
 civilDate(value);const target=Date.parse(value+'T00:00:00Z');let guess=target;
 for(let i=0;i<3;i++){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(guess).map(p=>[p.type,p.value]));const local=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second);guess+=target-local;}
 return new Date(guess).toISOString();
}
export function activityFilters(params:URLSearchParams){
 const from=civilDate(params.get('from')||''),to=civilDate(params.get('to')||'');
 if(from>to||Date.parse(to)-Date.parse(from)>366*86400000)throw Error('Invalid range');
 const platform=params.get('platform')||'all',status=params.get('status')||'all',mode=params.get('mode')||'trips';
 if(!['all','INTERNAL','UBER','BOLT','HEETCH'].includes(platform)||!['all','completed','pending','failed'].includes(status)||!['trips','summary'].includes(mode))throw Error('Invalid filter');
 const raw=params.get('offset')||'0';if(!/^\d+$/.test(raw)||Number(raw)>100000)throw Error('Invalid page');
 const next=new Date(Date.parse(to+'T00:00:00Z')+86400000).toISOString().slice(0,10);
 return {from,to,platform,status,mode,offset:Number(raw),start:brusselsDay(from),end:brusselsDay(next)};
}
export function summarizeActivity(rows:Record<string,unknown>[]){
 let cents=0,distance=0,duration=0,count=0;const platforms:Record<string,{count:number;cents:number}>={},payments:Record<string,{count:number;cents:number}>={},daily:Record<string,{count:number;cents:number}>={};
 const add=(map:typeof platforms,key:string,value:number)=>{const item=map[key]??={count:0,cents:0};item.count++;item.cents+=value;};
 for(const row of rows){if(!['completed','success'].includes(String(row.status)))continue;
  const price=Number(row.price);if(!Number.isFinite(price)||price<0||row.price==null||(row.currency&&row.currency!=='EUR'))throw Error('Invalid trip amount');
  const amount=Math.round(price*100);if(!Number.isSafeInteger(amount)||!Number.isSafeInteger(cents+amount))throw Error('Invalid total');
  cents+=amount;count++;for(const key of ['distance_km','duration_minutes'])if(row[key]!=null&&(!Number.isFinite(Number(row[key]))||Number(row[key])<0))throw Error('Invalid metric');
  distance+=Number(row.distance_km||0);duration+=Number(row.duration_minutes||0);
  add(platforms,row.ride_type==='INTERNAL'?'INTERNAL':String(row.external_source||'OTHER').toUpperCase(),amount);add(payments,String(row.payment_method||'unknown').toLowerCase(),amount);
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(String(row.start_time)));add(daily,day,amount);
 }
 const amounts=(map:typeof platforms)=>Object.fromEntries(Object.entries(map).map(([k,v])=>[k,{count:v.count,revenue:v.cents/100}]));
 return {total_trips:count,total_revenue:cents/100,total_distance:Math.round(distance*100)/100,total_duration:Math.round(duration*100)/100,average_trip_value:count?Math.round(cents/count)/100:0,platform_stats:amounts(platforms),payment_stats:amounts(payments),daily_stats:amounts(daily),basis:'completed_gross_eur'};
}
