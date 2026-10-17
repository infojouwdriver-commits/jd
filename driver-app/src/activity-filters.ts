export type Period='daily'|'weekly'|'monthly'|'yearly'|'custom';
export function todayBrussels(now=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(v=>[v.type,v.value]));return `${p.year}-${p.month}-${p.day}`;}
export function validDay(day:string){return /^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day+'T00:00:00Z'))&&new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day;}
export function periodDates(period:Period,date=todayBrussels()){
 if(!validDay(date))throw Error('Invalid date');const [y,m]=date.split('-');const from=period==='daily'?date:period==='monthly'?`${y}-${m}-01`:period==='yearly'?`${y}-01-01`:new Date(Date.parse(date+'T00:00:00Z')-6*86400000).toISOString().slice(0,10);
 return {from,to:date};
}
export function validRange(from:string,to:string){return validDay(from)&&validDay(to)&&from<=to&&Date.parse(to)-Date.parse(from)<=366*86400000;}
