// Isolated real-Caddy acceptance; no external DNS, TLS issuance or production IO.
import assert from 'node:assert/strict';
import {createServer,request as httpRequest} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const binary=process.env.CADDY_BIN;
assert.ok(binary,'Set CADDY_BIN to a verified Caddy binary');
const work=await mkdtemp(join(tmpdir(),'jd-domain-proxy-'));
const requests=[];
const upstream=createServer((req,res)=>{requests.push([req.method,req.url]);res.setHeader('content-type','application/json');res.end(JSON.stringify({method:req.method,url:req.url}));});
await new Promise(r=>upstream.listen(0,'127.0.0.1',r));
const lease=createServer();await new Promise(r=>lease.listen(0,'127.0.0.1',r));const port=lease.address().port;await new Promise(r=>lease.close(r));
const template=await readFile(new URL('../deploy/Caddyfile.jouww.candidate',import.meta.url),'utf8');
const config='{\nadmin off\nauto_https off\n}\n'+template
  .replace('jouw-driver.duckdns.org, app.jouww.com {',`http://jouw-driver.duckdns.org:${port}, http://app.jouww.com:${port} {`)
  .replace('jouww.com, www.jouww.com {',`http://jouww.com:${port}, http://www.jouww.com:${port} {`)
  .replaceAll('app:3000',`127.0.0.1:${upstream.address().port}`);
await writeFile(join(work,'Caddyfile'),config);
let logs='';const child=spawn(binary,['run','--config',join(work,'Caddyfile'),'--adapter','caddyfile'],{env:{...process.env,XDG_DATA_HOME:work,XDG_CONFIG_HOME:work},stdio:['ignore','ignore','pipe']});child.stderr.on('data',b=>{logs+=b;});
// Node fetch may replace a supplied Host header with the connection address.
// Use the HTTP transport directly so these checks exercise the named vhosts.
const request=(host,path,method='GET')=>new Promise((resolve,reject)=>{
  const req=httpRequest({hostname:'127.0.0.1',port,path,method,headers:{Host:host},signal:AbortSignal.timeout(3000)},res=>{
    const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('error',reject);
    res.on('end',()=>resolve(new Response(method==='HEAD'?null:Buffer.concat(chunks),{status:res.statusCode,headers:res.headers})));
  });req.on('error',reject);req.end();
});
try {
  let ready=false;for(let i=0;i<60;i++){if(child.exitCode!==null||child.signalCode!==null)throw Error(`Caddy exited: ${child.exitCode ?? child.signalCode}\n${logs}`);try{if((await request('jouww.com','/')).status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}
  assert.ok(ready,logs);
  let count=0;
  for(const host of ['jouww.com','www.jouww.com']) {
    for(const path of ['/','/privacy-policy','/privacy-center','/features/security','/_next/static/example.js']) {assert.equal((await request(host,path)).status,200);count++;}
    for(const path of ['/next_api','/next_api/auth/login','/api/webhook','/admin-setup']) {const before=requests.length;assert.equal((await request(host,path)).status,404,`${host}${path} must be blocked`);assert.equal(requests.length,before);count++;}
    for(const path of ['/','/register-company','/next_api/auth/login','/next_api/webhooks/brevo']) {const before=requests.length;const res=await request(host,path,'POST');assert.equal(res.status,405);assert.equal(res.headers.get('location'),null);assert.equal(requests.length,before);count++;}
    for(const path of ['/login?portal=company','/register-company?lang=nl','/company/dashboard','/sign-contract/test?x=1','/login?next=https://evil.test']) {const before=requests.length;const res=await request(host,path);assert.equal(res.status,302);assert.equal(res.headers.get('location'),'https://app.jouww.com'+path);assert.equal(res.headers.get('cache-control'),'no-store');assert.equal(requests.length,before);count++;}
    assert.equal((await request(host,'/','HEAD')).status,200);count++;
  }
  for(const host of ['jouw-driver.duckdns.org','app.jouww.com']) {
    assert.equal((await (await request(host,'/next_api/auth/login','POST')).json()).method,'POST');count++;
    assert.equal((await request(host,'/admin-setup')).status,404);count++;
    assert.equal((await (await request(host,'/healthz')).json()).url,'/privacy-policy');count++;
  }
  const before=requests.length;await request('api.jouww.com','/next_api/auth/login','POST');assert.equal(requests.length,before);count++;
  console.log(`${count} real-Caddy domain routing checks passed`);
} finally {
  child.kill('SIGKILL');await new Promise(r=>child.exitCode!==null||child.signalCode!==null?r():child.once('exit',r));
  upstream.closeAllConnections();
  await new Promise(r=>upstream.close(r));await rm(work,{recursive:true,force:true});
}
