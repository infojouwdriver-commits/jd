// Browser-only synthetic receipts and provider responses. Never accesses production mail or customers.
import assert from 'node:assert/strict';import fs from 'node:fs';import {spawn} from 'node:child_process';import {randomBytes} from 'node:crypto';import {pathToFileURL} from 'node:url';
import {receiptEmailWords,receiptMessage} from '../src/lib/receipt-email-model.ts';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base='http://127.0.0.1:3051',out=process.env.RECEIPT_QA_DIR||'/tmp/jd-receipt-reference';fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3051'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser;const checks=[];
try{
 let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(base+'/driver-login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch({headless:true});
 for(const language of ['ar','fr','nl'])for(const theme of ['light','dark']){
 const w=receiptEmailWords[language],context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(({language,theme})=>{localStorage.setItem('driver_language',language);localStorage.setItem('theme',theme);localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));},{language,theme});
 const sends=[];let issues=0;const ad={version:1,enabled:true,text:{ar:'إعلان اختباري',fr:'Annonce de test',nl:'Testadvertentie'},url:'https://jouww.com'};
 await context.route('**/*',async route=>{const r=route.request(),u=new URL(r.url());if(u.origin!==base)return route.abort();if(!u.pathname.startsWith('/next_api/'))return route.continue();let data=[];
 if(u.pathname==='/next_api/auth/user')data={sub:'2',email:'synthetic@example.invalid',isAdmin:false,userType:'driver'};
 else if(u.pathname==='/next_api/drivers/me')data={driver:{id:1,full_name:'Synthetic Driver'},company:{id:1,name:'Frozen Company'}};
 else if(u.pathname==='/next_api/drivers/shifts')data={active:null,shifts:[]};
 else if(u.pathname==='/next_api/trips')data=[{id:401,start_time:'2026-10-28T12:00:00Z',end_time:'2026-10-28T12:17:00Z',start_address:'Synthetic Brussels',end_address:'Synthetic airport',price:28.6,status:'completed',distance_km:8.42,duration_minutes:17,ride_type:'INTERNAL',payment_method:'card',invoice:{receipt_snapshot:{document_number:'TRIP-401'}}}];
 else if(u.pathname==='/next_api/trips/receipt')data={trip_id:401,invoice_id:11,reference:'TRIP-401',date:'2026-10-28T12:00:00Z',company:'Frozen Company',amount:28.6,currency:'EUR',distanceKm:8.42,durationMinutes:17,payment:'card',pdfUrl:'https://app.jouww.com/documents/receipts/11.token'};
 else if(u.pathname==='/next_api/trips/receipt-email'){
 if(r.method()==='GET'){const lang=u.searchParams.get('language')||language;data={...receiptMessage(lang,'TRIP-401','Frozen Company',ad),reference:'TRIP-401',settings_version:1,language:lang};}
 else {sends.push(r.postDataJSON());if(sends.length===1)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({success:false,errorMessage:'Synthetic lost acknowledgement'})});data={accepted:true,status:'accepted'};}}
 else if(u.pathname==='/next_api/trips/generate-invoice'){issues++;throw Error('Optional email must not reissue a receipt');}
 return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});});
 const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/driver/trips');await page.getByRole('button',{name:w.send,exact:true}).click();const dialog=page.getByRole('dialog');await page.locator('#receipt-email-to').waitFor();
 await dialog.getByRole('button',{name:w.send,exact:true}).click();assert.equal(sends.length,0);assert.equal(await page.locator('#receipt-email-to').evaluate(el=>el===document.activeElement),true);
 await page.locator('#receipt-email-to').fill('client@example.invalid');await page.locator('#receipt-email-language').click();await page.getByRole('option',{name:'Français',exact:true}).click();await page.locator('#receipt-email-subject').fill('Edited subject TRIP-401');await page.locator('#receipt-email-message').fill('Edited customer message\nhttps://jouww.com');
 await dialog.getByRole('button',{name:w.send,exact:true}).click();await dialog.getByText(w.uncertain,{exact:true}).waitFor();assert.equal(await page.locator('#receipt-email-to').isDisabled(),true);
 await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.getByRole('button',{name:w.send,exact:true}).click();await dialog.getByRole('button',{name:w.retry,exact:true}).click();await dialog.getByText(w.accepted,{exact:true}).waitFor();
 assert.equal(sends.length,2);assert.equal(sends[0].request_id,sends[1].request_id);assert.equal(sends[1].message,'Edited customer message\nhttps://jouww.com');assert.equal(sends[1].language,'fr');assert.equal(issues,0);
 await page.screenshot({path:out+'/email-'+language+'-'+theme+'.png'});await page.keyboard.press('Escape');
 await page.goto(base+'/driver/receipt?id=401');await page.getByTestId('receipt-printer').waitFor();await page.getByTestId('receipt-printer').getByText('Frozen Company',{exact:true}).waitFor();assert.equal(await page.locator('.jd-paper').evaluate(el=>getComputedStyle(el).transform),'none');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+'/receipt-'+language+'-'+theme+'.png',fullPage:true});assert.equal(issues,0);assert.deepEqual(errors,[]);
 checks.push(language+'/'+theme+': existing invoice, editable multilingual optional email, invalid recipient focus, persisted uncertain retry identity, provider acceptance, existing PDF printer and reduced motion');await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await context.addInitScript(()=>localStorage.setItem('driver_language','ar'));let settings={version:1,enabled:true,text:{ar:'إعلان',fr:'Annonce',nl:'Advertentie'},url:'https://jouww.com'},writes=0;
 await context.route('**/next_api/**',async route=>{const u=new URL(route.request().url());let data=[];if(u.pathname==='/next_api/auth/user')data={sub:'1',isAdmin:true,userType:'admin',email:'admin@example.invalid'};else if(u.pathname==='/next_api/receipt-email-settings'){if(route.request().method()==='PUT'){settings={...route.request().postDataJSON(),version:settings.version+1};writes++;}data=settings;}return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});});
 const page=await context.newPage();page.setDefaultTimeout(15000);await page.goto(base+'/admin/receipt-email');await page.locator('#receipt-ad-enabled').click();await page.locator('#receipt-ad-ar').fill('JOUW DRIVER — نص قابل للتعديل');await page.locator('#receipt-ad-url').fill('https://jouww.com/fr/solutions');await page.getByRole('button',{name:'حفظ',exact:true}).click();await page.getByText('تم حفظ إعلان البريد.',{exact:true}).waitFor();assert.equal(settings.enabled,false);assert.equal(writes,1);assert.equal(settings.url,'https://jouww.com/fr/solutions');checks.push('administrator: ad on/off, localized text and URL saved with a version');await context.close();
 console.log(JSON.stringify({passed:checks.length,checks},null,2));
}finally{await browser?.close();server.kill('SIGTERM');}
