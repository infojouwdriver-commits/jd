// Local browser acceptance with synthetic API responses. Never contacts Stripe or charges money.
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import fs from 'node:fs';import {pathToFileURL} from 'node:url';import {randomBytes} from 'node:crypto';
import {operationsCopy} from '../src/components/operations/operations-copy.ts';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href),base='http://127.0.0.1:3041',qa=process.env.STRIPE_BILLING_QA_DIR||'/tmp/jd-stripe-qa';fs.mkdirSync(qa,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3041'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser,lastPage;const checks=[];
try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,250));}assert.ok(ready);browser=await chromium.launch({headless:true});
 for(const locale of ['ar','fr','nl'])for(const width of [390,1280]){
  const c=operationsCopy[locale],context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(({locale,theme})=>{localStorage.setItem('theme',theme);localStorage.setItem('driver_language',locale);localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));},{locale,theme:width===390?'dark':'light'});
  let role='owner',fail=true,phase='pending',allocation='pending',slow=false;const writes=[];
  const company={id:3,name:'Synthetic Stripe Company',is_test:false,subscription_status:'active'};
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  await context.route(base+'/next_api/**',async route=>{
   const req=route.request(),url=new URL(req.url());let data=[],status=200;
   if(url.pathname==='/next_api/auth/user')data={sub:'1000',isAdmin:false,userType:'manager',role:'browser',email:'synthetic@example.invalid'};
   else if(url.pathname==='/next_api/company-portal')data={company,companies:[company],membership_role:role,can_manage_fleet:false,can_view_billing:true,can_manage_staff:role==='owner',drivers:[],vehicles:[],drivers_total:0,vehicles_total:0,summary:{drivers:0,vehicles:0,active_vehicles:0}};
   else if(url.pathname==='/next_api/company-portal/billing')data={documents:[],entries:[],payments:[],total:0,entry_total:0,posted_balance_cents:0,overdue_cents:0,prepared_count:0,profile:{enabled:true,contract_id:7,monthly_gross_cents:5000},settings:null,mail:[],admin:false};
   else if(url.pathname==='/next_api/stripe-billing'){
    if(req.method()==='POST'){writes.push(req.postDataJSON());if(fail){fail=false;status=503;}else{phase='active';data={authorized:true};}}
    else{if(slow)await new Promise(r=>setTimeout(r,200));data={enabled:true,can_authorize:role==='owner',contracts:[{id:7,contract_number:'SYN-STRIPE-50'}],enrollments:phase==='pending'?[]:[{id:'synthetic',contract_id:7,status:phase}],receipts:phase==='active'?[{installment:1,amount_cents:5000,paid_at:'2026-10-24T10:00:00Z',allocation,document_id:allocation==='allocated'?8:null}]:[]};}
   }
   await route.fulfill({status,json:{success:status===200,data,...(status===200?{}:{errorMessage:'Synthetic unavailable'})}});
  });
  const page=await context.newPage();lastPage=page;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/company/dashboard');await page.getByRole('tab',{name:c.billing,exact:true}).click();
  const panel=page.locator('section').filter({has:page.getByRole('button',{name:/Stripe.*SYN-STRIPE-50/})});
  const authorize=page.getByRole('button',{name:/Stripe.*SYN-STRIPE-50/});await authorize.click();const dialog=page.getByRole('dialog');await dialog.locator('form').getByRole('button',{name:/Stripe/}).click();assert.equal(writes.length,0);
  await dialog.getByRole('checkbox').click();await dialog.locator('form').getByRole('button',{name:/Stripe/}).click();await dialog.getByRole('alert').waitFor();assert.equal(writes.length,1);
  await dialog.locator('form').getByRole('button',{name:c.cancel,exact:true}).click();await authorize.click();assert.equal(await page.getByRole('dialog').getByRole('checkbox').getAttribute('aria-checked'),'true');await page.getByRole('dialog').getByRole('button',{name:c.retry,exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.deepEqual(writes[0],writes[1]);assert.equal(writes[0].consent,true);
  const section=page.getByRole('region',{name:locale==='ar'?'الدفع التلقائي للاشتراك':locale==='fr'?'Paiement automatique de l’abonnement':'Automatische abonnementsbetaling'});await section.getByText(/1\/12/).waitFor();
  assert.match(await section.innerText(),locale==='ar'?/بانتظار إصدار/:locale==='fr'?/En attente de l’émission/:/Wacht op uitgifte/);
  allocation='allocated';slow=true;await section.getByRole('button',{name:c.refresh,exact:true}).click();await section.getByText(locale==='ar'?'مرتبطة بالفاتورة':locale==='fr'?'Rapproché avec la facture':'Gekoppeld aan de factuur',{exact:false}).waitFor();
  await page.screenshot({path:`${qa}/stripe-${locale}-${width}.png`,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  role='accountant';phase='pending';await page.reload();await page.getByRole('tab',{name:c.billing,exact:true}).click();await section.getByText(locale==='ar'?'صاحب الشركة وحده يستطيع تفويض الدفع.':locale==='fr'?'Seul le propriétaire de l’entreprise peut autoriser le paiement.':'Alleen de bedrijfseigenaar kan de betaling machtigen.').waitFor();assert.equal(await page.getByRole('button',{name:/Stripe.*SYN-STRIPE-50/}).count(),0);assert.deepEqual(errors,[]);
  checks.push(`${locale}/${width}: consent, same-request retry, owner-only authorization, confirmed receipt distinct from invoice issuance, refresh and narrow layout`);await context.close();
 }
 fs.writeFileSync(qa+'/result.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
}catch(e){if(lastPage&&!lastPage.isClosed()){await lastPage.screenshot({path:qa+'/failure.png',fullPage:true});console.error((await lastPage.locator('body').innerText()).slice(-2500));}throw e;}finally{await browser?.close();server.kill('SIGTERM');}
