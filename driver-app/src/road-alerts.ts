import type {NativeRoute,RouteCoordinate} from './native-route';

export type RoadKind = 'collision'|'hazard'|'closure'|'congestion';
export interface RoadReport extends RouteCoordinate {id:number;kind:RoadKind;expires_at:string}
export interface AirportNotice {id:number;kind:'meeting_changed'|'taxi_entrance_closed';detail:string;expires_at:string}
export interface RouteAlert extends RouteCoordinate {kind: RoadKind}

export function nextRouteAlert(point: RouteCoordinate, route: NativeRoute, alerts: RouteAlert[], lookahead = 1600) {
 const latitudeScale = 111195;
 const longitudeScale = latitudeScale * Math.cos(point.lat * Math.PI / 180);
 // Anchor the local projection at the current position to avoid projecting the whole trip globally.
 const segments = route.coordinates.slice(1).map(([lon,lat],index)=>{
  const [startLon,startLat] = route.coordinates[index];
  const dx = (lon-startLon)*longitudeScale;
  const dy = (lat-startLat)*latitudeScale;
  return {x:(startLon-point.lon)*longitudeScale,y:(startLat-point.lat)*latitudeScale,dx,dy,length:Math.hypot(dx,dy)};
 });
 function project(target:RouteCoordinate) {
  const x = (target.lon-point.lon)*longitudeScale;
  const y = (target.lat-point.lat)*latitudeScale;
  let nearest = {distance:Infinity, progress:0};
  let traveled = 0;
  for (const s of segments) {
   if (s.length === 0) continue;
   const part = Math.max(0,Math.min(1,((x-s.x)*s.dx+(y-s.y)*s.dy)/(s.length*s.length)));
   const distance = Math.hypot(x-s.x-part*s.dx,y-s.y-part*s.dy);
   if (distance < nearest.distance) nearest = {distance,progress:traveled+part*s.length};
   traveled += s.length;
  }
  return nearest;
 }
 const position = project(point);
 if (position.distance > 70) return null;
 return alerts.flatMap(alert=>{
  const projected = project(alert);
  const distance = Math.round(projected.progress-position.progress);
  return projected.distance <= 35 && distance > 40 && distance <= lookahead ? [{kind:alert.kind,distance}] : [];
 }).sort((a,b)=>a.distance-b.distance)[0] ?? null;
}
