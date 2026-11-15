import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchNativeRoute,parseNativeRoute,routeBounds,navigationUrl,distanceFromRoute,trackRouteFix} from '../src/native-route.ts';
const payload=()=>({code:'Ok',routes:[{distance:1500,duration:240,geometry:{type:'LineString',coordinates:[[4.35,50.85],[4.36,50.86],[4.34,50.855]]}}]});
const start={lat:50.85,lon:4.35},end={lat:50.86,lon:4.36};
test('native route uses longitude-latitude and Mapbox GeoJSON, without application cookies',async()=>{
 let called;const route=await fetchNativeRoute(start,end,'pk.synthetic',undefined,async(url,options)=>{called={url:new URL(url),options};return Response.json(payload());});
 assert.ok(called.url.pathname.endsWith('/4.35,50.85;4.36,50.86'));assert.equal(called.url.searchParams.get('geometries'),'geojson');assert.equal(called.options.credentials,'omit');assert.equal(route.distanceMeters,1500);assert.deepEqual(routeBounds(route),{ne:[4.36,50.86],sw:[4.34,50.85]});
});
test('non-Ok, malformed and impossible routes never become a successful preview',()=>{
 for(const change of [p=>p.code='NoRoute',p=>p.routes[0].distance=-1,p=>p.routes[0].duration=NaN,p=>p.routes[0].geometry.type='Polygon',p=>p.routes[0].geometry.coordinates=[[181,50],[4,50]],p=>p.routes[0].geometry.coordinates=[[4,50]],p=>p.routes[0].geometry.coordinates[0]=['4',50]]){const value=payload();change(value);assert.equal(parseNativeRoute(value),null);}
});
test('HTTP/network failures cannot expose provider text or tokens',async()=>{
 for(const response of [()=>Response.json({message:'provider-private-detail'},{status:401}),()=>Response.json({code:'NoRoute'})])await assert.rejects(fetchNativeRoute(start,end,'pk.synthetic',undefined,async()=>response()),error=>!error.message.includes('synthetic')&&!error.message.includes('provider-private-detail'));
 await assert.rejects(fetchNativeRoute(start,end,'pk.synthetic',undefined,async()=>{throw Error('secret-in-transport-error');}),error=>!error.message.includes('secret'));
});
test('superseded request aborts and late successful response cannot render obsolete route',async()=>{
 const controller=new AbortController();let finish;const wait=new Promise(resolve=>{finish=resolve;});let passedSignal;
 const pending=fetchNativeRoute(start,end,'pk.synthetic',controller.signal,async(_,options)=>{passedSignal=options.signal;await wait;return Response.json(payload());});controller.abort();assert.equal(passedSignal.aborted,true);finish();await assert.rejects(pending);
 let calls=0;const cancelled=new AbortController();cancelled.abort();await assert.rejects(fetchNativeRoute(start,end,'pk.synthetic',cancelled.signal,async()=>{calls++;return Response.json(payload());}));assert.equal(calls,0);
});
test('coordinate validation rejects malicious navigation input and wrong token before network',async()=>{
 let calls=0;await assert.rejects(fetchNativeRoute({...start,lat:Infinity},end,'pk.synthetic',undefined,async()=>{calls++;return Response.json(payload());}));await assert.rejects(fetchNativeRoute(start,end,'sk.synthetic'));assert.equal(calls,0);
 assert.throws(()=>navigationUrl('google',{lat:'50&x=bad',lon:4}));assert.equal(new URL(navigationUrl('waze',end)).searchParams.get('ll'),'50.86,4.36');assert.equal(new URL(navigationUrl('google',end)).searchParams.get('destination'),'50.86,4.36');
});

test('rerouting waits for separate accurate fixes outside the route and limits repeated requests',()=>{
 const route={coordinates:[[4.35,50.85],[4.36,50.85],[4.36,50.85],[4.36,50.86]]};
 const initial={timestamp:0,offRouteFixes:0,lastRequestedAt:0};
 const midpoint={lat:50.85,lon:4.355};
 const offRoute={...midpoint,lat:50.8504,accuracy:5};
 assert.ok(distanceFromRoute(midpoint,route)<0.001);
 assert.ok(distanceFromRoute(offRoute,route)>43);
 const planned=trackRouteFix(initial,{...midpoint,timestamp:100_000},null,100_000);
 assert.equal(planned.refresh,true);
 const uncertain=trackRouteFix(planned.tracking,{...offRoute,accuracy:35,timestamp:112_000},route,112_000);
 assert.equal(uncertain.tracking.offRouteFixes,0);
 const first=trackRouteFix(uncertain.tracking,{...offRoute,timestamp:114_000},route,114_000);
 assert.equal(first.refresh,false);
 assert.equal(first.tracking.offRouteFixes,1);
 assert.equal(trackRouteFix(first.tracking,{...offRoute,timestamp:114_000},route,116_000).refresh,false);
 const second=trackRouteFix(first.tracking,{...offRoute,timestamp:117_000},route,117_000);
 assert.equal(second.refresh,true);
 const soon=trackRouteFix(second.tracking,{...offRoute,timestamp:120_000},route,120_000);
 assert.equal(trackRouteFix(soon.tracking,{...offRoute,timestamp:123_000},route,123_000).refresh,false);
 const returned=trackRouteFix(first.tracking,{...midpoint,timestamp:116_000},route,116_000);
 assert.equal(returned.tracking.offRouteFixes,0);
});
