import test from 'node:test';
import assert from 'node:assert/strict';
import {checkNativeMapboxAccess} from '../scripts/check-mapbox-access.mjs';
import {mapboxErrorMessage} from '../src/mapbox-error.ts';
test('native Mapbox probes contain no application cookies or forged browser referrer',async()=>{
 const calls=[];const result=await checkNativeMapboxAccess('pk.synthetic',async(url,options)=>{calls.push({url:new URL(url),options});return new Response('synthetic',{status:200});});assert.equal(result.nativeStyleStatus,200);assert.equal(result.nativeFontStatus,200);assert.equal(calls.length,2);for(const call of calls){assert.equal(call.options.credentials,'omit');assert.equal(call.options.headers.Referer,undefined);assert.equal(call.options.headers.Origin,undefined);}
});
test('URL-restricted/rejected token and missing font permission cannot pass acceptance',async()=>{
 for(const statuses of [[403],[200,403],[401]]){let calls=0;await assert.rejects(checkNativeMapboxAccess('pk.synthetic',async()=>new Response('private provider body',{status:statuses[calls++]})),error=>/MAPBOX_NATIVE_PUBLIC_TOKEN/.test(error.message)&&!error.message.includes('pk.synthetic')&&!error.message.includes('private provider'));}
});
test('map errors show only safe actionable categories, never SDK URLs or tokens',()=>{
 const raw='HTTP 403 https://api.mapbox.com/path?access_token=pk.synthetic';assert.match(mapboxErrorMessage({error:raw}),/رفض Mapbox/);assert.equal(mapboxErrorMessage({error:raw}).includes('pk.synthetic'),false);assert.match(mapboxErrorMessage({message:'Failed to resolve host'}),/اتصال الهاتف/);assert.equal(mapboxErrorMessage({message:'unexpected private text'}).includes('private'),false);
});
