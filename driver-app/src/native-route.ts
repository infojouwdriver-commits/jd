import type {RouteAlert} from './road-alerts';
export interface RouteCoordinate {lat: number; lon: number}
export interface NativeRoute {distanceMeters: number; durationSeconds: number; coordinates: [number, number][]; alerts?: RouteAlert[]; alternative?: NativeRoute; trafficAware?: boolean}
const validCoordinate=(p:RouteCoordinate)=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
export function parseNativeRoute(value: unknown, index = 0): NativeRoute | null {
 if(!value || typeof value!=='object')return null;
 const payload=value as {code?:unknown;routes?:unknown};if(payload.code!=='Ok'||!Array.isArray(payload.routes))return null;
 const route=payload.routes[index];if(!route||!Number.isFinite(route.distance)||route.distance<=0||!Number.isFinite(route.duration)||route.duration<=0||route.geometry?.type!=='LineString'||!Array.isArray(route.geometry.coordinates)||route.geometry.coordinates.length<2||route.geometry.coordinates.length>50000)return null;
 const coordinates:[number,number][]=[];
 for(const p of route.geometry.coordinates){if(!Array.isArray(p)||p.length!==2||!validCoordinate({lon:p[0],lat:p[1]}))return null;coordinates.push([p[0],p[1]]);}
 return {distanceMeters:route.distance,durationSeconds:route.duration,coordinates};
}
function incidents(body: unknown, route: NativeRoute, index: number): RouteAlert[] {
 const data = body as {routes?: {legs?: {incidents?: {type?:unknown;geometry_index_start?:unknown;road_closed?:unknown}[]}[]}[]};
 const values = data.routes?.[index]?.legs?.[0]?.incidents;
 if (!Array.isArray(values)) return [];
 return values.slice(0,100).flatMap(incident=>{
  const i=incident?.geometry_index_start;
  if (typeof i !== 'number' || !Number.isInteger(i) || !route.coordinates[i]) return [];
  const [lon,lat]=route.coordinates[i];
  const kind=incident.road_closed || incident.type === 'road_closure' ? 'closure' : incident.type === 'accident' ? 'collision' :
   incident.type === 'hazard' || incident.type === 'obstruction' ? 'hazard' : null;
  return kind ? [{lat,lon,kind}] : [];
 });
}

export async function fetchNativeRoute(start:RouteCoordinate,end:RouteCoordinate,token:string,signal?:AbortSignal,request:typeof fetch=fetch, guidance=false):Promise<NativeRoute>{
 if(!validCoordinate(start)||!validCoordinate(end)||!token.trim().startsWith('pk.'))throw Error('تحقق من الموقع وإعداد الخريطة.');
 const controller=new AbortController();const cancel=()=>controller.abort();if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});
 const timer=setTimeout(cancel,12000);
 async function getRoute(traffic:boolean) {
  const profile=traffic?'driving-traffic':'driving';
  const url=new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${start.lon},${start.lat};${end.lon},${end.lat}`);
  for(const [key,value] of Object.entries({access_token:token.trim(),geometries:'geojson',overview:'full',alternatives:traffic?'true':'false',steps:'false'})) url.searchParams.set(key,value);
  const response=await request(url.toString(),{signal:controller.signal,headers:{Accept:'application/json'},credentials:'omit',redirect:'error'});
  if(!response.ok) throw Error('unavailable');
  const body:unknown=await response.json();
  const route=parseNativeRoute(body);
  if(!route||controller.signal.aborted) throw Error('invalid');
  if (!traffic) return route;
  const alternative=parseNativeRoute(body,1);
  return {...route,trafficAware:true,alerts:incidents(body,route,0),
   ...(alternative?{alternative:{...alternative,trafficAware:true,alerts:incidents(body,alternative,1)}}:{})};
 }
 try {
  if(controller.signal.aborted) throw Error('cancelled');
  if (!guidance) return await getRoute(false);
  try {return await getRoute(true);}
  catch {if(controller.signal.aborted) throw Error('cancelled');return await getRoute(false);}
 }
 catch{throw Error('المسار غير متاح حالياً. أعد المحاولة؛ قياس الرحلة مستقل عن المسار.');}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
}
export function routeBounds(route:NativeRoute):{ne:[number,number];sw:[number,number]}{
 const ne:[number,number]=[-180,-90],sw:[number,number]=[180,90];for(const [lon,lat]of route.coordinates){ne[0]=Math.max(ne[0],lon);ne[1]=Math.max(ne[1],lat);sw[0]=Math.min(sw[0],lon);sw[1]=Math.min(sw[1],lat);}return {ne,sw};
}
export function navigationUrl(provider:'google'|'waze',destination:RouteCoordinate){
 if(!validCoordinate(destination))throw Error('وجهة غير صالحة.');
 return provider==='google'?`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lon}&travelmode=driving`:`https://www.waze.com/ul?ll=${destination.lat},${destination.lon}&navigate=yes`;
}

/** Distance to the closest segment, using a local metre projection around the fix. */
export function distanceFromRoute(point: RouteCoordinate, route: NativeRoute): number {
 const latitudeScale = 111_195;
 const longitudeScale = latitudeScale * Math.cos(point.lat * Math.PI / 180);
 let nearest = Infinity;
 for (let index = 1; index < route.coordinates.length; index++) {
  const [startLon, startLat] = route.coordinates[index - 1];
  const [endLon, endLat] = route.coordinates[index];
  const x = (startLon - point.lon) * longitudeScale;
  const y = (startLat - point.lat) * latitudeScale;
  const dx = (endLon - startLon) * longitudeScale;
  const dy = (endLat - startLat) * latitudeScale;
  const lengthSquared = dx * dx + dy * dy;
  const progress = lengthSquared ? Math.max(0, Math.min(1, -(x * dx + y * dy) / lengthSquared)) : 0;
  nearest = Math.min(nearest, Math.hypot(x + progress * dx, y + progress * dy));
 }
 return nearest;
}

function routeNeedsUpdate(fix: RouteCoordinate & {accuracy?: number}, route: NativeRoute): boolean {
 return distanceFromRoute(fix, route) > Math.max(30, (fix.accuracy ?? 0) * 1.5);
}

export interface RouteTracking {
 timestamp: number;
 offRouteFixes: number;
 lastRequestedAt: number;
}

export function trackRouteFix(
 previous: RouteTracking,
 fix: RouteCoordinate & {timestamp:number;accuracy?:number},
 route: NativeRoute|null,
 now: number,
) {
 if(fix.timestamp<=previous.timestamp)return {tracking:previous,refresh:false};
 const offRoute=route!==null&&routeNeedsUpdate(fix,route);
 const offRouteFixes=offRoute?(fix.timestamp-previous.timestamp<=30_000?previous.offRouteFixes+1:1):0;
 const coolingDown=previous.lastRequestedAt>0&&now-previous.lastRequestedAt<12_000;
 const refresh=!coolingDown&&(!route||offRouteFixes>=2);
 return {
  tracking:{timestamp:fix.timestamp,offRouteFixes:refresh?0:offRouteFixes,lastRequestedAt:refresh?now:previous.lastRequestedAt},
  refresh,
 };
}
