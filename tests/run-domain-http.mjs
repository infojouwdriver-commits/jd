// Real proxy checks: insecure API mutations must not be redirected/replayed.
import assert from 'node:assert/strict';
import {createServer,request} from 'node:http';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import {secureHttpRoutes} from '../deploy/jouww-cutover.mjs';
assert.ok(process.env.CADDY_BIN,'Verified runtime Caddy binary required');
const dir=await fs.mkdtemp(os.tmpdir()+'/jouww-http-');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
const hosts=['jouw-driver.duckdns.org','app.jouww.com','jouww.com','www.jouww.com'];
let config='{\nadmin off\nauto_https off\n}\n'+secureHttpRoutes();
for(const host of hosts)config=config.replace('http://'+host,'http://'+host+':'+port);
await fs.writeFile(dir+'/Caddyfile',config);
let logs='';const child=spawn(process.env.CADDY_BIN,['run','--config',dir+'/Caddyfile','--adapter','caddyfile'],{env:{...process.env,XDG_CONFIG_HOME:dir,XDG_DATA_HOME:dir},stdio:['ignore','ignore','pipe']});child.stderr.on('data',b=>logs+=b);
const send=(host,method,path='/next_api/auth/login')=>new Promise((resolve,reject)=>{const req=request({hostname:'127.0.0.1',port,path,method,headers:{Host:host},signal:AbortSignal.timeout(2000)},res=>{res.resume();res.on('end',()=>resolve({status:res.statusCode,headers:res.headers}));});req.on('error',reject);req.end();});
try{
  let ready=false;for(let n=0;n<60;n++){if(child.exitCode!==null||child.signalCode)throw Error(logs);try{ready=(await send(hosts[0],'GET')).status===308;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,50));}assert.ok(ready,logs);
  let passed=0;
  for(const host of hosts){
    for(const method of ['POST','PUT','DELETE','OPTIONS']){const r=await send(host,method);assert.equal(r.status,405);assert.equal(r.headers.location,undefined);passed++;}
    for(const method of ['GET','HEAD']){const r=await send(host,method,'/login?lang=fr');assert.equal(r.status,308);assert.equal(r.headers.location,'https://'+host+'/login?lang=fr');passed++;}
  }
  console.log(passed+' real-Caddy insecure HTTP safety checks passed');
}finally{
  child.kill('SIGKILL');await new Promise(r=>child.exitCode!==null||child.signalCode?r():child.once('exit',r));await fs.rm(dir,{recursive:true,force:true});
}
