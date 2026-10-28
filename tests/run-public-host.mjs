// Actual production Next.js middleware behind a preserved proxy Host. Synthetic requests only.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {request} from 'node:http';
// Node fetch normalizes Host to its connection URL; use HTTP request to model Caddy.
const send=(path,host,extra={})=>new Promise((resolve,reject)=>{
 const req=request({hostname:'127.0.0.1',port:3041,path,headers:{host,...extra},signal:AbortSignal.timeout(10000)},res=>{res.resume();res.on('end',()=>resolve({status:res.statusCode,headers:new Headers(res.headers)}));});
 req.on('error',reject);req.end();
});
const base='http://127.0.0.1:3041';
const p=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3041'],{env:{...process.env,APP_ORIGIN:base},stdio:'ignore'});
try {
 let ready=false;for(let n=0;n<60;n++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 for(const host of ['jouww.com','www.jouww.com']) {
  const r=await send('/fr/solutions?utm_source=test&view=all',host,{'x-forwarded-proto':'https'});
  assert.equal(r.status,307);assert.equal(r.headers.get('location'),'https://'+host+'/fr/solutions?view=all');
  assert.equal(r.headers.get('cache-control'),'no-store');
 }
 for(const host of ['app.jouww.com','jouw-driver.duckdns.org','attacker.invalid']) {
  const r=await send('/fr/solutions?utm_source=test&view=all',host,{'x-forwarded-host':'jouww.com','x-forwarded-proto':'https'});
  assert.equal(r.status,200);assert.equal(r.headers.get('location'),null);
 }
 for(const route of ['/driver-login?utm_source=keep','/pay/invoice?utm_source=keep','/documents/receipts/401.token?utm_source=keep']) {
  const r=await send(route,'jouww.com');
  assert.equal(r.headers.get('location'),null,'Secure route query must not be rewritten');
 }
 console.log('Passed 8 production middleware proxy-host and secure-route cases');
}finally{p.kill('SIGTERM')}
