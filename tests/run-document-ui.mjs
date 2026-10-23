// Shipped portal UI with synthetic documents only; no production reads or writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {randomBytes} from 'node:crypto';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base='http://127.0.0.1:3024',out=process.env.DOCUMENT_QA_DIR||'/tmp/jd-document-ui';fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3024'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser;const checks=[];
try {
 let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(base+'/driver-login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.UI_CHROMIUM_PATH||undefined});
 for(const language of ['ar','fr','nl'])for(const theme of ['dark','light']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(({language,theme})=>{localStorage.setItem('driver_language',language);localStorage.setItem('theme',theme);localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{globalThis.__documentShared=data;}});},{language,theme});
  const url='https://app.jouww.com/documents/receipts/401.'+'a'.repeat(43);let failed=false,writes=0,release;
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.origin!==base)return route.abort();if(!u.pathname.startsWith('/next_api/'))return route.continue();let data=[];
   if(u.pathname==='/next_api/auth/user')data={sub:'2',email:'synthetic@example.invalid',isAdmin:false,userType:'driver'};
   else if(u.pathname==='/next_api/drivers/me')data={driver:{id:1,full_name:'Synthetic Driver',status:'active'},company:{id:1,name:'Synthetic company'}};
   else if(u.pathname==='/next_api/drivers/vehicles')data={vehicles:[{id:1,plate_number:'TEST-1'}],current_vehicle_id:1,driver_id:1};
   else if(u.pathname==='/next_api/drivers/shifts')data={active:null,shifts:[]};
   else if(u.pathname==='/next_api/trips')data=[{id:401,start_time:'2026-10-23T07:00:00Z',end_time:'2026-10-23T07:15:00Z',start_address:'Synthetic Brussels',end_address:'Synthetic airport',price:18.4,status:'completed',distance_km:12.5,duration_minutes:15,ride_type:'INTERNAL',external_source:null,payment_method:'card'}];
   else if(u.pathname==='/next_api/trips/generate-invoice'){
    writes++;assert.equal(route.request().method(),'POST');assert.equal(u.searchParams.get('format'),'link');
    if(failed)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({success:false})});
    await new Promise(r=>{release=r;});data={url,reference:'TRIP-401'};
   }
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/driver/trips');
  const labels={ar:['إنشاء فاتورة','مشاركة الرابط','خطأ في إنشاء الفاتورة'],fr:['Générer une facture','Partager le lien','Erreur lors de la génération de la facture'],nl:['Factuur genereren','Link delen','Fout bij genereren factuur']}[language];
  const action=page.getByRole('button',{name:labels[0],exact:true});await action.click();await page.waitForFunction(()=>!!document.querySelector('button[disabled]'));
  assert.equal(await action.isDisabled(),true);while(!release)await new Promise(r=>setTimeout(r,20));release();
  const dialog=page.getByRole('dialog');await dialog.getByRole('heading',{name:'TRIP-401'}).waitFor();await dialog.locator('img[src^="data:image/png"]').waitFor();
  assert.equal(await dialog.getByRole('link',{name:'PDF',exact:true}).getAttribute('href'),url);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=390),'No horizontal overflow with the dialog open');
  await dialog.getByRole('button',{name:labels[1],exact:true}).click();assert.equal((await page.evaluate(()=>globalThis.__documentShared)).url,url);assert.equal(writes,1);
  await page.screenshot({path:path.join(out,`receipt-${language}-${theme}.png`)});
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});failed=true;await action.click();await page.getByText(labels[2],{exact:true}).waitFor();assert.equal(await action.isDisabled(),false);assert.deepEqual(errors,[]);
  checks.push(language+'/'+theme+': local QR, stable PDF URL, OS share, busy guard, failure recovery, narrow layout');await context.close();
 }
 console.log(JSON.stringify({passed:checks.length,checks},null,2));fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:checks.length,checks},null,2));
}finally{if(browser)await browser.close();server.kill('SIGTERM');}
