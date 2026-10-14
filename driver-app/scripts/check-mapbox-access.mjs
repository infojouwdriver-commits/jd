// CI-only read probes. Never print a token, provider body, request URL or private account metadata.
export async function checkNativeMapboxAccess(token, request=fetch) {
 if(typeof token!=='string'||!token.trim().startsWith('pk.'))throw Error('Native Mapbox public token is missing or invalid.');
 const paths=['/styles/v1/mapbox/streets-v12','/fonts/v1/mapbox/DIN%20Pro%20Medium/0-255.pbf'];
 const checks=[];
 for(const path of paths){
  const url=new URL('https://api.mapbox.com'+path);url.searchParams.set('access_token',token.trim());
  let response;try{response=await request(url.toString(),{headers:{Accept:'*/*'},credentials:'omit',redirect:'error',signal:AbortSignal.timeout(12000)});}catch{throw Error('Native Mapbox probe could not connect.');}
  await response.body?.cancel();checks.push(response.status);
  if(response.status===401||response.status===403)throw Error(`Native Mapbox access rejected (${response.status}). Configure MAPBOX_NATIVE_PUBLIC_TOKEN with mobile-compatible styles:read/fonts:read permissions; keep the web token restrictions unchanged.`);
  if(!response.ok)throw Error(`Native Mapbox resource unavailable (${response.status}).`);
 }
 return {nativeStyleStatus:checks[0],nativeFontStatus:checks[1]};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 try{console.log(JSON.stringify(await checkNativeMapboxAccess(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN)));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
