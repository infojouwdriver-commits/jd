import test from 'node:test';
import assert from 'node:assert/strict';
import {nextRouteAlert} from '../src/road-alerts.ts';
import {fetchNativeRoute} from '../src/native-route.ts';
import {parseBelgianAddresses} from '../src/native-addresses.ts';

const start={lat:50.85,lon:4.35};
const end={lat:50.87,lon:4.35};
const geometry={type:'LineString',coordinates:[[4.35,50.84],[4.35,50.85],[4.35,50.855],[4.35,50.87]]};
const route={coordinates:geometry.coordinates,distanceMeters:2000,durationSeconds:240};

test('only incidents ahead and near the active route trigger a warning',()=>{
 const alerts=[
  {kind:'hazard',lat:50.847,lon:4.35},
  {kind:'collision',lat:50.851,lon:4.353},
  {kind:'closure',lat:50.855,lon:4.35},
 ];
 assert.deepEqual(nextRouteAlert(start,route,alerts),{kind:'closure',distance:556});
 assert.equal(nextRouteAlert(end,route,alerts),null);
});

test('guided requests return traffic estimates, alternative geometry and traffic incidents',async()=>{
 const response={code:'Ok',routes:[
  {distance:2500,duration:400,geometry,legs:[{incidents:[{type:'accident',geometry_index_start:2}]}]},
  {distance:2200,duration:320,geometry},
 ]};
 const result=await fetchNativeRoute(start,end,'pk.test',undefined,async url=>{
  assert.match(new URL(url).pathname,/\/driving-traffic\//);
  assert.equal(new URL(url).searchParams.get('alternatives'),'true');
  return Response.json(response);
 },true);
 assert.equal(result.alternative.durationSeconds,320);
 assert.equal(result.trafficAware,true);
 assert.deepEqual(result.alerts,[{kind:'collision',lat:50.855,lon:4.35}]);
 const paths=[];
 const fallback=await fetchNativeRoute(start,end,'pk.test',undefined,async url=>{
  paths.push(new URL(url).pathname);
  return paths.length===1 ? new Response(null,{status:503}) : Response.json(response);
 },true);
 assert.match(paths[1],/\/driving\//);
 assert.equal(fallback.trafficAware,undefined);
});

test('category matches outrank distance and show the place and address on separate lines',()=>{
 const feature=(name,osm_value,lon)=>({geometry:{type:'Point',coordinates:[lon,50.86]},properties:{name,osm_value,countrycode:'BE',street:'Airportlaan',postcode:'1930',city:'Zaventem'}});
 const [first]=parseBelgianAddresses({features:[feature('Airport Café','restaurant',4.36),feature('Demo Airport','aerodrome',4.48)]},start,'aéroport');
 assert.equal(first.title,'Demo Airport');
 assert.equal(first.subtitle,'Airportlaan, 1930 Zaventem');
});
