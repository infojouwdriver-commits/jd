import test from 'node:test';
import assert from 'node:assert/strict';
import {createAddressSearch,parseBelgianAddresses,freshSearchPoint} from '../src/native-addresses.ts';
const feature=(name,lon,lat,countrycode='BE')=>({type:'Feature',geometry:{type:'Point',coordinates:[lon,lat]},properties:{name,countrycode,city:'Demo',postcode:'1000',country:'Belgium'}});
const payload=()=>({features:[feature('Further',4.4,50.9),feature('Foreign',4.3501,50.8501,'NL'),feature('Nearest',4.351,50.851),feature('Nearest',4.351,50.851),feature('No country',4.35,50.85,'')]});
const near={lat:50.85,lon:4.35};
test('only Belgian valid points survive, duplicate addresses are removed, nearest is first',()=>{
 const data=payload();data.features.push(feature('Bad',Infinity,50),{...feature('String',4,50),geometry:{type:'Point',coordinates:['4',50]}},{...feature('Polygon',4,50),geometry:{type:'Polygon',coordinates:[4,50]}});
 const rows=parseBelgianAddresses(data,near);assert.equal(rows.length,2);assert.match(rows[0].label,/Nearest/);assert.ok(rows[0].distanceKm<rows[1].distanceKm);assert.match(parseBelgianAddresses(payload())[0].label,/Further/);assert.equal(parseBelgianAddresses(payload())[0].distanceKm,undefined);
 assert.throws(()=>parseBelgianAddresses({error:'unavailable'}));
});
test('nearest ranking does not use stale, mocked accuracy, impossible or future GPS',()=>{
 const now=100000,point={...near,timestamp:now,accuracy:10};assert.deepEqual(freshSearchPoint(point,now),near);
 for(const bad of [{timestamp:now-30001},{timestamp:now+5001},{accuracy:null},{accuracy:51},{lat:91},{lon:NaN}])assert.equal(freshSearchPoint({...point,...bad},now),null);
});
test('search encodes literal text, filters Belgium and sends only approximate proximity with no app credentials',async()=>{
 let called;const search=createAddressSearch(async(url,options)=>{called={url:new URL(url),options};return Response.json(payload());});
 const rows=await search('Demo & postcode=9999','ar',{lat:50.8512345,lon:4.3512345});
 assert.equal(called.url.origin,'https://photon.komoot.io');assert.equal(called.url.searchParams.get('q'),'Demo & postcode=9999');assert.equal(called.url.searchParams.get('countrycode'),'BE');assert.equal(called.url.searchParams.get('lang'),'fr');assert.equal(called.url.searchParams.get('lat'),'50.851');assert.equal(called.url.searchParams.get('lon'),'4.351');assert.equal(called.options.credentials,'omit');assert.equal(called.options.redirect,'error');assert.equal(called.options.headers.Cookie,undefined);assert.equal(rows.length,2);
});
test('search cancels late responses, avoids keystroke bursts and rejects malformed queries before transport',async()=>{
 let now=0,calls=0,finish;const wait=new Promise(resolve=>finish=resolve);const search=createAddressSearch(async()=>{calls++;await wait;return Response.json(payload());},()=>now);
 for(const query of ['a','a\naddress','x'.repeat(201)])await assert.rejects(search(query,'fr'));assert.equal(calls,0);
 const controller=new AbortController();const pending=search('Synthetic','fr',near,controller.signal);controller.abort();finish();await assert.rejects(pending);assert.equal(calls,1);
 await assert.rejects(search('Synthetic','fr'));assert.equal(calls,1);now=1500;await search('Synthetic','fr');assert.equal(calls,2);
 const cancelled=new AbortController();cancelled.abort();await assert.rejects(search('Another','fr',near,cancelled.signal));assert.equal(calls,2);
});
test('provider errors do not leak payloads; malformed replies never become a selectable address',async()=>{
 for(const transport of [async()=>{throw Error('private provider detail');},async()=>Response.json({error:'private provider detail'},{status:429}),async()=>Response.json({features:null})]){
  await assert.rejects(createAddressSearch(transport)('Synthetic','fr'),error=>error.message==='Address search unavailable');
 }
});

test('Dutch UI searches use local provider defaults instead of an unsupported language code',async()=>{
 let url;await createAddressSearch(async value=>{url=new URL(value);return Response.json(payload());})('Synthetic','nl');assert.equal(url.searchParams.has('lang'),false);
});
