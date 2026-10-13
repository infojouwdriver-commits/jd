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
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='api.mapbox.com' && url.pathname.includes('/tiles/'))return route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5WQAAAAASUVORK5CYII=','base64')});
    return url.origin===base?route.continue():route.abort();
  });
  const accountPosts=[],tripRequests=[],created=[],pricingWrites=[],chironWrites=[];let loggedIn=true,currentUserType='admin',chironTests=0,productionKeyConfigured=true;
  await context.route(base+'/next_api/**',async route=>{
   const request=route.request(),url=new URL(request.url());let data=[],status=200;
   if(url.pathname==='/next_api/auth/user'){if(!loggedIn){status=401;}else data=currentUserType==='admin'?{sub:'9001',email:'admin@example.invalid',isAdmin:true,userType:'admin',role:'browser'}:{sub:'9003',email:'company@example.invalid',isAdmin:false,userType:'company',role:'browser'};}
   else if(url.pathname==='/next_api/auth/account'){
    if(request.method()==='GET')data={email_verification_available:false};
    else{accountPosts.push(request.postDataJSON());data={updated:true,sign_in_required:true};}
   }
   else if(url.pathname==='/next_api/auth/logout'){loggedIn=false;data=true;}
   else if(url.pathname==='/next_api/chiron-settings'){
    if(request.method()==='PUT'){chironWrites.push(request.postDataJSON());data={id:1};}
    else data={id:1,name:'Company One',chiron_mode:'TEST',transmissionEnabled:true,productionEnabled:false,testCredentialsConfigured:true,productionCredentialsConfigured:productionKeyConfigured,testKeyConfigured:true,productionKeyConfigured,chiron_test_client_id:'synthetic-test-id',chiron_prod_client_id:'synthetic-production-id'};
   }
   else if(url.pathname==='/next_api/companies'){
    if(request.method()==='POST'){created.push(request.postDataJSON());data={id:3,...created.at(-1),portal_login_enabled:true};}
    else if(request.method()==='PUT'){pricingWrites.push(request.postDataJSON());data={id:1,...pricingWrites.at(-1)};}
    else data=[{id:1,name:'Company One',vat_number:'BE0000000001',kbo_number:'0000000001',chiron_mode:'TEST'},{id:2,name:'Company Two',vat_number:'BE0000000002',kbo_number:'0000000002',chiron_mode:'TEST'}];
   }
   else if(url.pathname==='/next_api/trips'){tripRequests.push(url.searchParams);data=[{id:101,start_time:'2026-10-12T08:00:00Z',end_time:'2026-10-12T08:10:00Z',price:12,status:'completed',company_name:'Company One',driver_name:'Synthetic Driver',vehicle_plate_number:'SYN-101',locked_after_completion:true}];}
   else if(url.pathname==='/next_api/fleet')data=[{driver_id:11,driver_name:'Synthetic Driver',company_id:1,company_name:'Company One',vehicle_id:21,plate_number:'SYN-101',shift_active:true,sharing_enabled:true,latitude:50.8503,longitude:4.3517,accuracy_m:8,last_update:'2026-10-13T18:00:00Z',work_status:'available'},{driver_id:12,driver_name:'Off Shift Driver',company_id:1,company_name:'Company One',vehicle_id:null,plate_number:null,shift_active:false,sharing_enabled:false,latitude:null,longitude:null,accuracy_m:null,last_update:null,work_status:'off_shift'}];
   else if(url.pathname==='/next_api/company-portal')data={company:{id:1,name:'Company One',email:'company@example.invalid',phone:'',subscription_status:'active'},drivers:[],vehicles:[]};
   else if(url.pathname==='/next_api/drivers')data=[{id:11,full_name:'Synthetic Driver',company_id:1}];
   else if(url.pathname==='/next_api/vehicles')data=[{id:21,brand:'Synthetic',model:'Car',plate_number:'SYN-101',company_id:1}];
   else if(url.pathname==='/next_api/test-trips/acceptance-test'){
    chironTests++;
    data={success:true,totalMessages:10,successCount:10,failedCount:0,results:Array.from({length:10},(_,i)=>({ritnummer:'TEST-synthetic-'+Math.floor(i/2),sequence:i+1,messageType:i%2?'aankomst':'vertrek',success:true,httpStatus:200}))};
   }
   else if(url.pathname==='/next_api/companies/1/pricing')data={id:1,name:'Company One',base_rate_per_km:0,base_rate_per_minute:'0.5',minimum_fare:'10.75',airport_surcharge:0,night_surcharge_percentage:0,peak_hour_surcharge_percentage:0,night_start_hour:22,night_end_hour:6,peak_hours:null};
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
  await page.goto(base+'/admin/companies/1/settings');
  await page.getByRole('link',{name:/إعدادات التسعير/}).click();
  await page.waitForURL(base+'/admin/companies/1/pricing');
  const fields=page.locator('input[type="number"]');
  await fields.first().waitFor();assert.equal(await fields.first().inputValue(),'0');assert.equal(await fields.nth(2).inputValue(),'10.75');
  await fields.nth(2).fill('-1');await page.getByRole('button',{name:/حفظ/}).click();
  await page.getByText('قيمة التسعير غير صالحة: minimum_fare',{exact:true}).waitFor();assert.equal(pricingWrites.length,0);
  await fields.nth(2).fill('10.75');
  const pricingSaved=page.waitForResponse(response=>response.url()===base+'/next_api/companies'&&response.request().method()==='PUT');
  await page.getByRole('button',{name:/حفظ/}).click();await pricingSaved;await page.waitForURL(base+'/admin/companies');
  assert.equal(pricingWrites[0].base_rate_per_km,0);assert.equal(pricingWrites[0].airport_surcharge,0);assert.equal(pricingWrites[0].minimum_fare,10.75);assert.equal(pricingWrites[0].peak_hours.length,2);
  assert.equal(errors.length,0,errors.join('\n'));
  checks.push(name+': pricing settings link opens, unset periods render safely, zero rates and cents persist, invalid edits do not submit');
  await page.goto(base+'/admin/companies/1/chiron-settings');
  await page.getByTestId('chiron-test-key-status').getByText(/مفتاح الاختبار محفوظ ومخفي/).waitFor();
  assert.equal(await page.locator('#chiron_test_client_secret').inputValue(),'');
  await page.getByRole('tab',{name:'بيئة الإنتاج',exact:true}).click();
  await page.getByTestId('chiron-production-key-status').getByText(/مفتاح الإنتاج محفوظ ومخفي/).waitFor();
  assert.equal(await page.locator('#chiron_prod_client_secret').inputValue(),'');
  await page.getByText('الإرسال الإنتاجي غير مفعّل على الخادم، حتى عند اختيار PRODUCTION للشركة.',{exact:true}).waitFor();
  const chironSaved=page.waitForResponse(r=>r.url().includes('/next_api/chiron-settings?')&&r.request().method()==='PUT');
  await page.getByRole('button',{name:'حفظ جميع الإعدادات',exact:true}).click();await chironSaved;
  assert.equal(chironWrites.length,1);assert.equal(chironWrites[0].chiron_test_client_secret,'');assert.equal(chironWrites[0].chiron_prod_client_secret,'');
  await page.reload();await page.getByTestId('chiron-test-key-status').getByText(/مفتاح الاختبار محفوظ ومخفي/).waitFor();
  productionKeyConfigured=false;await page.reload();await page.getByTestId('chiron-test-key-status').getByText(/مفتاح الاختبار محفوظ ومخفي/).waitFor();
  await page.getByRole('tab',{name:'بيئة الإنتاج',exact:true}).click();await page.getByTestId('chiron-production-key-status').getByText('لا يوجد مفتاح إنتاج محفوظ.',{exact:true}).waitFor();
  checks.push(name+': Chiron key metadata remains visible after save/reload without returning secret fields, blank inputs preserve keys and missing production keys are distinguished');
  await page.goto(base+'/admin/fleet');
  await page.getByRole('heading',{name:'تتبع الأسطول',exact:true}).waitFor();
  await page.getByText('Synthetic Driver',{exact:true}).waitFor();
  await page.getByTestId('live-map').locator('[data-map-point="11"]').waitFor();
  assert.equal(await page.locator('[data-map-point="12"]').count(),0,'An off-shift driver must never appear on the map');
  await page.getByText('50.85030, 4.35170',{exact:true}).waitFor();
  await page.getByText('آخر تحديث: المشاركة متوقفة',{exact:true}).waitFor();
  assert.equal(await page.getByText('Company One',{exact:true}).count()>0,true);
  checks.push(name+': admin fleet view shows company, vehicle, accuracy, last shared coordinates and hides stopped sharing');
  await page.goto(base+'/admin/test-trips');
  const choices=page.getByRole('combobox');
  await choices.nth(0).click();await page.getByRole('option',{name:'Company One (TEST)',exact:true}).click();
  await choices.nth(1).click();await page.getByRole('option',{name:'Synthetic Driver',exact:true}).click();
  await choices.nth(2).click();await page.getByRole('option',{name:'Synthetic Car - SYN-101',exact:true}).click();
  await page.getByRole('button',{name:'تنفيذ اختبار القبول (10 رسائل)',exact:true}).click();
  await page.locator('[data-testid="chiron-message-result"][data-accepted="true"]').last().waitFor();
  assert.equal(await page.locator('[data-testid="chiron-message-result"][data-accepted="true"]').count(),10);
  assert.equal(await page.locator('[data-testid="chiron-message-result"][data-accepted="false"]').count(),0);
  assert.equal(await page.getByText(/الانطلاق · VERTREK/).count(),5);assert.equal(await page.getByText(/الوصول · AANKOMST/).count(),5);
  assert.equal(chironTests,1,'One explicitly clicked local fixture call only');
  checks.push(name+': accepted Chiron event booleans render ten successes, five departures, five arrivals and HTTP evidence');
  currentUserType='company';
  await page.goto(base+'/company/dashboard');
  await page.getByRole('tab',{name:/الأسطول/}).click();
  await page.getByRole('heading',{name:'تتبع الأسطول',exact:true}).waitFor();
  await page.getByText('Synthetic Driver',{exact:true}).waitFor();
  assert.equal(await page.getByText('Company One',{exact:true}).count(),1,'Company name should remain in the portal header, not be repeated as an admin fleet field');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  currentUserType='admin';
  checks.push(name+': company portal exposes the tenant-scoped fleet tab responsively');
  if(process.env.UI_OUTPUT_DIRECTORY){fs.mkdirSync(process.env.UI_OUTPUT_DIRECTORY,{recursive:true});await page.screenshot({path:path.join(process.env.UI_OUTPUT_DIRECTORY,name+'-companies.png'),fullPage:true});}
  await context.close();
 }
 console.log(JSON.stringify({passed:checks.length,checks,data:'Synthetic browser fixtures only; no real accounts'},null,2));
} finally {await browser?.close();server.kill('SIGTERM');}
