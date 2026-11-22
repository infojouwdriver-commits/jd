import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {randomBytes} from 'node:crypto';
import fs from 'node:fs';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base='http://127.0.0.1:3027',output=process.env.REGISTRATION_QA_DIR||'/tmp/jd-registration-qa';fs.mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3027'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
const values={company_name:'Synthetic Transport',company_email:'demo@example.invalid',company_password:randomBytes(18).toString('base64url'),company_phone:'+32470000001',company_address:'Synthetic street 123',vat_number:'BE0123456789',kbo_number:'0123456789',chiron_test_client_id:'synthetic-test',chiron_test_client_secret:randomBytes(24).toString('base64url'),chiron_prod_client_id:'synthetic-production',chiron_prod_client_secret:randomBytes(24).toString('base64url'),vehicle_brand:'Demo',vehicle_model:'Car',plate_number:'DEMO-123',vin:'WVWZZZ1JZXW000001',chiron_vehicle_id:'',driver_name:'Synthetic Driver',driver_phone:'+32470000000',driver_password:randomBytes(18).toString('base64url'),driver_license:'SYN-LICENCE',bestuurderspas:'SYN-PASS'};
let browser;
try{
 let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(base)).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch({headless:true});
 for(const language of ['ar','fr','nl'])for(const viewport of [{width:360,height:640},{width:1280,height:900}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce',serviceWorkers:'block'});await context.addInitScript(l=>{localStorage.setItem('driver_language',l);localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));},language);
  const page=await context.newPage(),errors=[],posts=[];let fail=true,cbeUnavailable=false;page.on('pageerror',e=>errors.push(e.message));
  await context.route(base+'/next_api/company-registrations/company-lookup',route=>{
   assert.deepEqual(route.request().postDataJSON(),{number:cbeUnavailable?'1000000021':'BE 0314.595.348',language:language==='nl'?'nl':'fr'});
   return cbeUnavailable?route.fulfill({status:503,json:{errorCode:'unavailable'}}):
    route.fulfill({status:200,json:{data:{kbo_number:'0314595348',name:'Registry Company',address:'Registry Street 12'}}});
  });
  await context.route(base+'/next_api/auth/send-verification',route=>route.fulfill({status:200,json:{success:true,data:{data:true}}}));
  await context.route(base+'/next_api/company-registrations',async route=>{posts.push(route.request().postDataJSON());if(fail){fail=false;return route.fulfill({status:503,json:{success:false}});}await new Promise(r=>setTimeout(r,100));return route.fulfill({status:201,json:{success:true,data:{request_id:posts.at(-1).request_id,status:'pending'}}});});
  await page.goto(base+'/'+language);await page.waitForFunction(l=>document.querySelector('.jd')?.getAttribute('dir')===(l==='ar'?'rtl':'ltr'),language);await page.locator('.jd-header-register').click();
  const dialog=page.locator('.cr-dialog');await dialog.waitFor();assert.equal(await dialog.getAttribute('dir'),language==='ar'?'rtl':'ltr');
  await dialog.locator('button[type=submit]').click();assert.ok(await dialog.locator('[aria-invalid=true]').count()>0);await page.waitForFunction(()=>document.activeElement?.id==='registration-kbo_number',null,{timeout:5000}).catch(async e=>{await page.screenshot({path:output+'/focus-failure.png'});throw e;});
  const lookup=dialog.getByRole('button',{name:/بحث في السجل البلجيكي|Rechercher dans la BCE|Zoeken in de KBO/});
  const kbo=dialog.locator('#registration-kbo_number'),address=dialog.locator('#registration-company_address');
  await kbo.fill('BE 0314.595.348');await lookup.click();
  await dialog.locator('#registration-cbe-status').filter({hasText:/تم العثور|Entreprise trouvée|Onderneming gevonden/}).waitFor();
  assert.equal(await kbo.inputValue(),'0314595348');
  assert.equal(await dialog.locator('#registration-vat_number').inputValue(),'BE0314595348');
  assert.equal(await dialog.locator('#registration-company_name').inputValue(),'Registry Company');
  assert.equal(await address.inputValue(),'Registry Street 12');
  await address.fill('Address entered by customer');
  await kbo.fill('1000000021');
  assert.equal(await dialog.locator('#registration-company_name').inputValue(),'');
  assert.equal(await dialog.locator('#registration-vat_number').inputValue(),'');
  assert.equal(await address.inputValue(),'Address entered by customer');
  cbeUnavailable=true;await lookup.click();
  await dialog.locator('#registration-cbe-status').filter({hasText:/يدويًا|manuellement|handmatig/}).waitFor();
  assert.equal(await address.inputValue(),'Address entered by customer');
  for(let step=0;step<3;step++){
   for(const input of await dialog.locator('input[name]').all()){const name=await input.getAttribute('name');await input.fill(values[name]);}
   if(step===1){
    assert.equal(await dialog.locator('input').count(),3);
    await dialog.locator('#registration-plate_number').fill('');
    await dialog.locator('button[type=submit]').click();
    assert.equal(await dialog.locator('#registration-plate_number').getAttribute('aria-invalid'),'true');
    await dialog.locator('#registration-plate_number').fill(values.plate_number);
   }
   if(step===2){
    const phone=dialog.locator('#registration-driver_phone'),reuse=dialog.locator('#registration-same-phone');
    assert.equal(await dialog.locator('#registration-driver_license').count(),0);
    await reuse.click();assert.equal(await phone.inputValue(),values.company_phone);assert.equal(await phone.isDisabled(),true);
    await reuse.click();assert.equal(await phone.inputValue(),values.driver_phone);assert.equal(await phone.isEnabled(),true);
    await reuse.click();
    await dialog.locator('#registration-bestuurderspas').fill('');
    await dialog.locator('#registration-driver_password').fill('');
   }
   if(step===0){await page.keyboard.press('Escape');const confirm=page.getByRole('alertdialog');await confirm.waitFor();await confirm.locator('button').first().click();await confirm.waitFor({state:'hidden'});assert.equal(await dialog.locator('#registration-company_name').inputValue(),values.company_name);}
   const submit=dialog.locator('button[type=submit]');await submit.scrollIntoViewIfNeeded();assert.ok(await submit.isVisible());await submit.click();await page.waitForFunction(n=>Number(document.querySelector('.cr-steps li[aria-current=step] span')?.textContent)===n,step+2,{timeout:5000}).catch(async error=>{console.error('Registration transition failed',JSON.stringify({language,viewport,fromStep:step+1,currentStep:await dialog.locator('.cr-steps li[aria-current=step] span').textContent(),invalidFields:await dialog.locator('[aria-invalid=true]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('name')||node.id)),alerts:await dialog.locator('.cr-error').allTextContents()}));await page.screenshot({path:output+'/transition-failure.png'});throw error;});console.log('PASS registration transition',language,viewport.width,step+1,'to',step+2);
  }
  const optional=dialog.getByRole('button',{name:/إعداد Chiron|Configurer Chiron|Chiron nu instellen/});
  assert.equal(await optional.getAttribute('aria-expanded'),'false');
  await optional.click();
  assert.equal(await dialog.locator('#registration-chiron_test_client_secret').getAttribute('type'),'password');
  assert.equal(await dialog.locator('a[href="https://chiron-acc.vlaanderen.be"]').getAttribute('rel'),'noopener noreferrer');
  await optional.click();
  await dialog.locator('#subscription-ack').check();await dialog.locator('button[type=submit]').click();assert.equal(posts.length,0);await dialog.locator('#registration-email-code').fill('123456');
  await page.screenshot({path:output+'/review-state.png'});assert.equal(await dialog.locator('input:not([type=checkbox]):not(#registration-email-code)').count(),0);assert.equal((await dialog.innerText()).includes('synthetic-secret'),false);assert.equal((await dialog.innerText()).includes(values.company_password),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const box=await dialog.boundingBox();assert.ok(box.y>=0&&box.y+box.height<=viewport.height+1,'Dialog stays inside short viewport');
  await page.screenshot({path:`${output}/registration-${language}-${viewport.width}.png`});
  await dialog.locator('button[type=submit]').click();await dialog.locator('.cr-error').waitFor();assert.equal(posts.length,1);await dialog.locator('button[type=submit]').click();await dialog.locator('.cr-success').waitFor();assert.equal(posts.length,2);assert.equal(posts[0].chiron_test_client_id,'');assert.equal(posts[0].chiron_test_client_secret,'');assert.equal(posts[0].same_company_phone,true);assert.equal(posts[0].driver_phone,'');assert.equal(posts[0].bestuurderspas,'');assert.equal(posts[0].driver_password,'');assert.deepEqual(posts[0],posts[1]);assert.equal(await dialog.locator('input:not([type=checkbox]):not(#registration-email-code)').count(),0);assert.ok((await dialog.locator('.cr-success').innerText()).includes(posts[0].request_id));assert.equal(page.url(),base+'/'+language);
  const persisted=await page.evaluate(()=>JSON.stringify({...localStorage}));assert.equal(persisted.includes(values.company_password),false);assert.equal(persisted.includes(values.chiron_test_client_secret),false);assert.deepEqual(errors,[]);console.log(`PASS ${language} ${viewport.width}: validation, discard, Chiron links, secret handling, uncertain retry, pending receipt`);await context.close();
 }
 const adminContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'});await adminContext.addInitScript(()=>{localStorage.setItem('driver_language','ar');localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));});
 const admin=await adminContext.newPage();let failList=true,decision='pending',reviews=0,serviceChecks=0;
 const synthetic={company_id:3,request_id:'684778fa-9fd4-4a31-aa18-a44df9d97bd1',company_name:'Synthetic Transport',company_email:'demo@example.invalid',company_phone:'+32470000001',company_address:'Synthetic street',vat_number:'BE0123456789',kbo_number:'0123456789',driver_name:'Synthetic Driver',driver_phone:'+32470000000',driver_license:'SYN-LICENCE',bestuurderspas:'SYN-PASS',vehicle_brand:'Demo',vehicle_model:'Car',plate_number:'DEMO-123',vin:'WVWZZZ1JZXW000001',language:'fr',test_configured:true,production_configured:false,submitted_at:'2026-10-17T10:00:00Z'};
 await adminContext.route(base+'/next_api/**',async route=>{const req=route.request(),url=new URL(req.url());let data=[];if(url.pathname==='/next_api/auth/user')data={sub:'9001',email:'admin@example.invalid',isAdmin:true,userType:'admin',role:'browser'};else if(url.pathname==='/next_api/company-registrations/service'){serviceChecks++;assert.equal(req.postDataJSON().registrationId,synthetic.request_id);data={status:'invoice_prepared'};}else if(url.pathname==='/next_api/company-registrations'){if(req.method()==='PUT'){reviews++;await new Promise(r=>setTimeout(r,150));decision=req.postDataJSON().action==='approve'?'approved':'rejected';data={status:decision};}else{if(failList){failList=false;return route.fulfill({status:503,json:{success:false}});}const filter=url.searchParams.get('status');const visible=filter==='all'||filter===decision;data={requests:visible?[{...synthetic,status:decision}]:[],total:visible?1:0,next_offset:null};}}return route.fulfill({status:200,json:{success:true,data}});});
 await admin.goto(base+'/admin/approval-requests');await admin.getByRole('button',{name:'إعادة التحميل',exact:true}).click();await admin.getByRole('heading',{name:'Synthetic Transport',exact:true}).waitFor();await admin.getByRole('button',{name:'رفض تسجيل الشركة',exact:true}).click();let modal=admin.getByRole('dialog');assert.equal(await modal.getByRole('button',{name:'تأكيد رفض الشركة',exact:true}).isDisabled(),true);await modal.getByRole('button',{name:'إلغاء المراجعة',exact:true}).click();
 await admin.getByRole('button',{name:'مراجعة تسجيل الشركة',exact:true}).click();modal=admin.getByRole('dialog');await modal.getByRole('button',{name:'إلغاء المراجعة',exact:true}).waitFor();assert.equal(await admin.locator(':focus').innerText(),'إلغاء المراجعة');await modal.getByRole('button',{name:'اعتماد التسجيل',exact:true}).click();await modal.waitFor({state:'hidden'});assert.equal(reviews,1);await admin.getByText('لا توجد طلبات شركات بهذه الحالة.',{exact:true}).waitFor();await admin.getByRole('button',{name:'موافق عليه',exact:true}).click();await admin.getByRole('heading',{name:'Synthetic Transport',exact:true}).waitFor();assert.equal(await admin.getByRole('button',{name:'مراجعة تسجيل الشركة',exact:true}).count(),0);await admin.getByRole('button',{name:'تحقق من الخدمة وحضّر الفاتورة الأولى',exact:true}).click();await admin.getByText('فاتورة الشهر الأول جاهزة للإصدار.',{exact:true}).waitFor();assert.equal(serviceChecks,1);assert.equal(await admin.getByRole('link',{name:'فواتير الاشتراك',exact:true}).getAttribute('href'),'/admin/invoices?view=subscription&company=3');assert.ok(await admin.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await admin.screenshot({path:output+'/registration-admin-mobile.png',fullPage:true});console.log('PASS administrator: load failure/retry, reject reason, safe confirmation focus, atomic approval feedback and status filters');await adminContext.close();
}finally{await browser?.close();server.kill('SIGTERM');}
