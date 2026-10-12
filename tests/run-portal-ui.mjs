// Browser fixtures exercise shipped UI only; native tests separately validate database/authentication.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base='http://127.0.0.1:3010';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3010'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
let browser;const checks=[];
try {
 let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(resolve=>setTimeout(resolve,500));}assert.ok(ready);
 browser=await chromium.launch({headless:true});
 for(const [name,viewport]of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.setItem('driver_language','ar');localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));});
  await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  const accountPosts=[],tripRequests=[],created=[];let loggedIn=true;
  await context.route(base+'/next_api/**',async route=>{
   const request=route.request(),url=new URL(request.url());let data=[],status=200;
   if(url.pathname==='/next_api/auth/user'){if(!loggedIn){status=401;}else data={sub:'9001',email:'admin@example.invalid',isAdmin:true,userType:'admin',role:'browser'};}
   else if(url.pathname==='/next_api/auth/account'){
    if(request.method()==='GET')data={email_verification_available:false};
    else{accountPosts.push(request.postDataJSON());data={updated:true,sign_in_required:true};}
   }
   else if(url.pathname==='/next_api/auth/logout'){loggedIn=false;data=true;}
   else if(url.pathname==='/next_api/companies'){
    if(request.method()==='POST'){created.push(request.postDataJSON());data={id:3,...created.at(-1),portal_login_enabled:true};}
    else data=[{id:1,name:'Company One',vat_number:'BE0000000001',kbo_number:'0000000001',chiron_mode:'TEST'},{id:2,name:'Company Two',vat_number:'BE0000000002',kbo_number:'0000000002',chiron_mode:'TEST'}];
   }
   else if(url.pathname==='/next_api/trips'){tripRequests.push(url.searchParams);data=[{id:101,start_time:'2026-10-12T08:00:00Z',end_time:'2026-10-12T08:10:00Z',price:12,status:'completed',company_name:'Company One',driver_name:'Synthetic Driver',vehicle_plate_number:'SYN-101',locked_after_completion:true}];}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===401?{success:false,errorCode:'TOKEN_MISSING'}:{success:true,data})});
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/admin/account');
  await page.locator('#account-current').waitFor({state:'visible'});
  assert.ok(await page.locator('#account-email').isDisabled());
  await page.locator('#account-current').fill('current-password');await page.locator('#account-password').fill('new-password-123');await page.locator('#account-repeat').fill('different-password');
  await page.getByRole('button',{name:'تغيير كلمة المرور',exact:true}).click();
  await page.getByText('كلمتا المرور غير متطابقتين',{exact:true}).waitFor();assert.equal(accountPosts.length,0);
  await page.locator('#account-repeat').fill('new-password-123');
  await page.evaluate(()=>sessionStorage.setItem('active_trip','synthetic-active'));
  await page.getByRole('button',{name:'تغيير كلمة المرور',exact:true}).click();
  await page.getByText('أنه الرحلة النشطة قبل تعديل بيانات الدخول',{exact:true}).waitFor();assert.equal(accountPosts.length,0);
  await page.evaluate(()=>sessionStorage.removeItem('active_trip'));
  const accountResponse=page.waitForResponse(response=>response.url()===base+'/next_api/auth/account'&&response.request().method()==='POST');
  await page.getByRole('button',{name:'تغيير كلمة المرور',exact:true}).click();await accountResponse;
  assert.equal(accountPosts[0].current_password,'current-password');assert.equal(accountPosts[0].password,'new-password-123');await page.waitForURL(base+'/login');
  checks.push(name+': password confirmation, active-trip protection, honest unavailable mail UI and canonical password request');
  loggedIn=true;await page.goto(base+'/admin/trips');await page.locator('#trip-company').waitFor({state:'visible'});
  const tripsResponse=page.waitForResponse(response=>response.url().includes('/next_api/trips?')&&new URL(response.url()).searchParams.get('company_id')==='1');
  await page.locator('#trip-company').selectOption('1');await tripsResponse;
  await page.getByText('Company One · Synthetic Driver · SYN-101',{exact:true}).waitFor();
  assert.equal(tripRequests.at(-1).get('company_id'),'1');assert.equal(tripRequests.at(-1).get('offset'),'0');
  assert.ok(await page.getByRole('button',{name:'تعديل السعر',exact:true}).isDisabled());
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  checks.push(name+': company trip selection, driver/vehicle labels, locked price controls and responsive layout');
  await page.goto(base+'/admin/companies');await page.getByRole('button',{name:'شركة جديدة',exact:true}).click();
  await page.locator('#new-company-name').fill('Synthetic company');await page.locator('#new-company-vat_number').fill('BE0000000003');await page.locator('#new-company-kbo_number').fill('0000000003');
  const dialog=page.getByRole('dialog');await dialog.locator('input[type="password"]').fill('company-password-123');
  await dialog.getByRole('button',{name:'إنشاء الشركة',exact:true}).click();await page.getByText('البريد الإلكتروني مطلوب لإنشاء حساب دخول الشركة',{exact:true}).waitFor();assert.equal(created.length,0);
  await page.locator('#new-company-email').fill('owner@example.invalid');
  const creation=page.waitForResponse(response=>response.url()===base+'/next_api/companies'&&response.request().method()==='POST');
  await dialog.getByRole('button',{name:'إنشاء الشركة',exact:true}).click();await creation;await dialog.waitFor({state:'hidden'});
  assert.equal(created.length,1);assert.equal(created[0].email,'owner@example.invalid');assert.equal(created[0].password,'company-password-123');assert.equal(errors.length,0,errors.join('\n'));
  checks.push(name+': company identity requires email before submitting and sends the canonical credentials once');
  if(process.env.UI_OUTPUT_DIRECTORY){fs.mkdirSync(process.env.UI_OUTPUT_DIRECTORY,{recursive:true});await page.screenshot({path:path.join(process.env.UI_OUTPUT_DIRECTORY,name+'-companies.png'),fullPage:true});}
  await context.close();
 }
 console.log(JSON.stringify({passed:checks.length,checks,data:'Synthetic browser fixtures only; no real accounts'},null,2));
} finally {await browser?.close();server.kill('SIGTERM');}
