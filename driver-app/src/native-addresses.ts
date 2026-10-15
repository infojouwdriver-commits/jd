import type {RouteCoordinate} from './native-route';
export interface NativeAddress extends RouteCoordinate {label:string;distanceKm?:number}
export function freshSearchPoint(point: {lat:number;lon:number;timestamp:number;accuracy?:number|null}|null|undefined, now=Date.now()):RouteCoordinate|null {
 return point && [point.lat,point.lon,point.timestamp,point.accuracy].every(Number.isFinite) && Math.abs(point.lat)<=90 && Math.abs(point.lon)<=180 && point.accuracy!>=0 && point.accuracy!<=50 && now-point.timestamp>=-5000 && now-point.timestamp<=30000 ? {lat:point.lat,lon:point.lon}:null;
}
const coordinate=(p:RouteCoordinate)=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
export function parseBelgianAddresses(payload:unknown,near?:RouteCoordinate|null):NativeAddress[] {
 if(!payload||typeof payload!=='object'||!Array.isArray((payload as {features?:unknown}).features))throw Error('Address response invalid');
 const rows:NativeAddress[]=[];const seen=new Set<string>();
 for(const item of (payload as {features:unknown[]}).features.slice(0,50)) {
  if(!item||typeof item!=='object')continue;
  const f=item as {geometry?:{type?:unknown;coordinates?:unknown};properties?:Record<string,unknown>},p=f.properties,c=f.geometry?.coordinates;
  if(typeof p?.countrycode!=='string'||p.countrycode.toUpperCase()!=='BE'||f.geometry?.type!=='Point'||!Array.isArray(c)||c.length!==2||!coordinate({lon:c[0],lat:c[1]}))continue;
  const text=(v:unknown)=>typeof v==='string'?v.trim().replace(/[\r\n\t]/g,' ').slice(0,250):'';
  const street=[text(p.street),text(p.housenumber)].filter(Boolean).join(' '),city=[text(p.postcode),text(p.city)||text(p.town)||text(p.village)].filter(Boolean).join(' ');
  const label=[...new Set([text(p.name),street,city,text(p.country)].filter(Boolean))].join(', ');
  if(!label||label.length>500)continue;const key=`${label.toLowerCase()}:${c[0]}:${c[1]}`;if(seen.has(key))continue;seen.add(key);
  let distanceKm:number|undefined;
  if(near&&coordinate(near)){const rad=(v:number)=>v*Math.PI/180;const a=Math.sin(rad(c[1]-near.lat)/2)**2+Math.cos(rad(near.lat))*Math.cos(rad(c[1]))*Math.sin(rad(c[0]-near.lon)/2)**2;distanceKm=6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,a))));}
  rows.push({label,lon:c[0],lat:c[1],...(distanceKm!==undefined?{distanceKm}:{})});
 }
 if(near&&coordinate(near))rows.sort((a,b)=>a.distanceKm!-b.distanceKm!);
 return rows.slice(0,6);
}
// Explicit searches only: no request for each keystroke, no credentials, no persistent search cache.
export function createAddressSearch(request:typeof fetch=fetch,clock:()=>number=Date.now) {
 let last=-Infinity;
 return async(query:string,language:string,near?:RouteCoordinate|null,signal?:AbortSignal):Promise<NativeAddress[]>=>{
  const q=query.trim();if(q.length<3||q.length>200||/[\r\n\x00-\x1f]/.test(q))throw Error('Invalid address query');
  if(signal?.aborted)throw Error('Cancelled');if(clock()-last<1500)throw Error('Wait before searching again');last=clock();
  const controller=new AbortController(),cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});const timer=setTimeout(cancel,10000);
  const url=new URL('https://photon.komoot.io/api/');url.searchParams.set('q',q);url.searchParams.set('countrycode','BE');url.searchParams.set('bbox','2.5,49.49,6.41,51.51');url.searchParams.set('limit','12');if(language!=='nl')url.searchParams.set('lang',language==='en'?'en':'fr');
  if(near&&coordinate(near)){url.searchParams.set('lat',near.lat.toFixed(3));url.searchParams.set('lon',near.lon.toFixed(3));url.searchParams.set('location_bias_scale','0.1');}
  try{const response=await request(url.toString(),{credentials:'omit',redirect:'error',signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw Error('Unavailable');const payload=await response.json();if(controller.signal.aborted)throw Error('Cancelled');return parseBelgianAddresses(payload,near);}
  catch{throw Error('Address search unavailable');}finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
 };
}
export const searchBelgianAddresses=createAddressSearch();
