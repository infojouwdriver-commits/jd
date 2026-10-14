import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function fixture({granted=true,failStart=false}={}) {
 const saved=new Map(), calls=[], points=[], published=[];let task;let active=true;
 const trip={owner:'1',key:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
 const imports={
  'expo-task-manager':{defineTask:(_,handler)=>task=handler,isAvailableAsync:async()=>true},
  'expo-location':{Accuracy:{High:4},ActivityType:{AutomotiveNavigation:3},getBackgroundPermissionsAsync:async()=>({granted}),requestBackgroundPermissionsAsync:async()=>({granted}),startLocationUpdatesAsync:async(_name,options)=>{calls.push(['start',options]);if(failStart)throw Error('OS refused service');},hasStartedLocationUpdatesAsync:async()=>true,stopLocationUpdatesAsync:async()=>{calls.push(['stop',saved.size]);}},
  'expo-secure-store':{AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:1,getItemAsync:async key=>saved.get(key)||null,setItemAsync:async(key,value)=>saved.set(key,value),deleteItemAsync:async key=>saved.delete(key)},
  './native-runtime':{nativeEngine:async()=>({restore:async()=>active?trip:null,point:async(point,key)=>{points.push([point,key]);return active?trip:null;}})},
  './native-fleet-runtime':{publishFleetPoint:async(owner,point)=>{published.push([owner,point]);return true;}},
  './trip-engine':{validPoint:p=>p.accuracy<=50 && Date.now()-p.timestamp<=30000},
 };
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/background-meter.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>imports[name],Date,JSON,Error});
 return {exports,trip,saved,calls,points,published,endTrip:()=>active=false,dispatch:body=>task(body)};
}
test('denied permission never persists tracking context or starts OS service',async()=>{const f=fixture({granted:false});assert.equal(await f.exports.enableBackgroundMeter(f.trip,true),false);assert.equal(f.saved.size,0);assert.equal(f.calls.length,0);});
test('headless points require active identity, reject stale/mocked GPS and stop clears context first',async()=>{
 const f=fixture();assert.equal(await f.exports.enableBackgroundMeter(f.trip),true);
 const point=(time,extra={})=>({timestamp:time,coords:{latitude:50.85,longitude:4.35,accuracy:5},...extra});const now=Date.now();
 await f.dispatch({data:{locations:[point(now),point(now-40000),point(now,{mocked:true})]},error:null});assert.equal(f.points.length,1);assert.equal(f.points[0][1],f.trip.key);assert.equal(f.calls[0][1].showsBackgroundLocationIndicator,true);assert.equal(f.calls[0][1].foregroundService.killServiceOnDestroy,true);
 await f.exports.stopBackgroundMeter();assert.equal(f.saved.size,0);assert.deepEqual(f.calls.at(-1),['stop',0]);await f.dispatch({data:{locations:[point(now)]},error:null});assert.equal(f.points.length,1);
});
test('OS start failure clears context and does not claim background activation',async()=>{const f=fixture({failStart:true});await assert.rejects(f.exports.enableBackgroundMeter(f.trip));assert.equal(f.saved.size,0);});

test('background meters all usable points but publishes only the latest; ended trip cannot publish',async()=>{
 const f=fixture();await f.exports.enableBackgroundMeter(f.trip);const now=Date.now();
 const point=time=>({timestamp:time,coords:{latitude:50.85,longitude:4.35,accuracy:5}});
 await f.dispatch({data:{locations:[point(now),point(now-10000)]},error:null});assert.equal(f.points.length,2);assert.equal(f.published.length,1);assert.equal(f.published[0][1].timestamp,now);
 f.endTrip();await f.dispatch({data:{locations:[point(now)]},error:null});assert.equal(f.published.length,1);
});
