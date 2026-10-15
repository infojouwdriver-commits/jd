export interface RouteCoordinate {lat: number; lon: number}
export interface NativeRoute {distanceMeters: number; durationSeconds: number; coordinates: [number, number][]}
const validCoordinate=(p:RouteCoordinate)=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
export function parseNativeRoute(value: unknown): NativeRoute | null {
 if(!value || typeof value!=='object')return null;
 const payload=value as {code?:unknown;routes?:unknown};if(payload.code!=='Ok'||!Array.isArray(payload.routes))return null;
 const route=payload.routes[0];if(!route||!Number.isFinite(route.distance)||route.distance<=0||!Number.isFinite(route.duration)||route.duration<=0||route.geometry?.type!=='LineString'||!Array.isArray(route.geometry.coordinates)||route.geometry.coordinates.length<2||route.geometry.coordinates.length>50000)return null;
 const coordinates:[number,number][]=[];
 for(const p of route.geometry.coordinates){if(!Array.isArray(p)||p.length!==2||!validCoordinate({lon:p[0],lat:p[1]}))return null;coordinates.push([p[0],p[1]]);}
 return {distanceMeters:route.distance,durationSeconds:route.duration,coordinates};
}
export async function fetchNativeRoute(start:RouteCoordinate,end:RouteCoordinate,token:string,signal?:AbortSignal,request:typeof fetch=fetch):Promise<NativeRoute>{
 if(!validCoordinate(start)||!validCoordinate(end)||!token.trim().startsWith('pk.'))throw Error('تحقق من الموقع وإعداد الخريطة.');
 const controller=new AbortController();const cancel=()=>controller.abort();if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});
 const timer=setTimeout(cancel,12000);
 const url=new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${start.lon},${start.lat};${end.lon},${end.lat}`);
 for(const [key,value] of Object.entries({access_token:token.trim(),geometries:'geojson',overview:'full',alternatives:'false',steps:'false'}))url.searchParams.set(key,value);
 try{if(controller.signal.aborted)throw Error('cancelled');const response=await request(url.toString(),{signal:controller.signal,headers:{Accept:'application/json'},credentials:'omit',redirect:'error'});if(!response.ok)throw Error('unavailable');const route=parseNativeRoute(await response.json());if(!route||controller.signal.aborted)throw Error('invalid');return route;}
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
