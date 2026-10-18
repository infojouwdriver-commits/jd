// Synthetic web-only acceptance: permission presentation, pending changes, local demo/cash ledger.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {randomBytes} from 'node:crypto';
import {operationsCopy} from '../src/components/operations/operations-copy.ts';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href),base='http://127.0.0.1:3018';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3018'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser,lastPage;const checks=[],qa=process.env.OPERATIONS_QA_DIR||'/tmp/jd-web-qa';fs.mkdirSync(qa,{recursive:true});
try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,250));}assert.ok(ready);
 browser=await chromium.launch({headless:true});
 for(const locale of ['ar','fr','nl'])for(const width of [1280,390]){
  const c=operationsCopy[locale],context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
  await context.addInitScript(locale=>{localStorage.setItem('driver_language',locale);localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));},locale);
  let role='owner',admin=false,state='prepared',paid=0,proposal=null,fail=true;const writes=[],company={id:1,name:'Synthetic Company',is_test:true,subscription_status:'active',address:'Synthetic Street',vat_number:'BE0123456789',kbo_number:'0123456789'};
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  await context.route(base+'/next_api/**',async route=>{const req=route.request(),url=new URL(req.url());let data=[],status=200;
   if(url.pathname==='/next_api/auth/user')data={sub:'800',isAdmin:admin,userType:admin?'admin':'manager',role:'browser',email:'synthetic@example.invalid'};
   else if(url.pathname==='/next_api/company-portal')data={company,companies:[company],membership_role:role,can_manage_fleet:role!=='accountant',can_view_billing:role!=='fleet_manager',can_manage_staff:role==='owner',drivers:[],vehicles:[{id:11,status:'active',brand:'Demo',model:'Car',plate_number:'CURRENT'}],drivers_total:0,vehicles_total:1,summary:{drivers:0,vehicles:1,active_vehicles:1}};
   else if(url.pathname==='/next_api/company-portal/vehicles'&&req.method()==='PUT'){
    writes.push({request:url.searchParams.get('request_id'),body:req.postDataJSON()});if(fail){fail=false;status=503;}else{proposal={id:1,company_id:1,entity_type:'vehicle',entity_id:11,action:'update',summary:req.postDataJSON(),status:'pending',created_at:'2026-10-18T11:00:00Z'};data={id:1,status:'pending'};}
   }
   else if(['/next_api/company-changes','/next_api/company-portal/changes'].includes(url.pathname)){
    if(req.method()==='PUT'){proposal.status=req.postDataJSON().decision;data={id:1,status:proposal.status};}else data={rows:proposal?[proposal]:[],total:proposal?1:0};
   }
   else if(url.pathname==='/next_api/company-workspace')data={company,rows:[],total:0};
   else if(['/next_api/subscription-billing','/next_api/company-portal/billing'].includes(url.pathname)){
    if(req.method()==='POST'){const v=req.postDataJSON();writes.push(v);if(v.action==='demo_issue')state='issued';if(v.action==='payment'){assert.equal(v.payment_method,'cash');paid=v.amount_cents;}data={id:2};}
    else data={admin,documents:[{id:2,document_number:'DEMO-JDS-2026-00000002',kind:'invoice',state,is_test:true,period_start:'2026-10-01',net_cents:5000,vat_cents:1050,vat_bps:2100,gross_cents:6050,balance_cents:state==='issued'?6050-paid:null,due_date:'2026-10-31'}],entries:[],payments:paid?[{request_id:'receipt',invoice_id:2,amount_cents:paid,payment_date:'2026-10-18',payment_method:'cash',reference:'SYNTHETIC-CASH'}]:[],total:1,entry_total:0,posted_balance_cents:state==='issued'?6050-paid:0,overdue_cents:0,prepared_count:state==='prepared'?1:0,profile:{enabled:true},settings:{default_vat_bps:2100,exchange_mode:'unconfigured'},scheduler:{},mail:[]};
   }
   else if(url.pathname==='/next_api/company-registrations')data={requests:[],total:0};
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify({success:status===200,data,...(status!==200?{errorMessage:'Synthetic failure'}:{})})});
  });
  const page=await context.newPage();lastPage=page;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/company/dashboard');await page.getByRole('tab',{name:c.vehicles,exact:true}).click();await page.getByRole('button',{name:c.edit,exact:true}).click();await page.getByLabel(c.plate_number,{exact:true}).fill('PENDING-PLATE');await page.getByRole('button',{name:c.save,exact:true}).click();await page.getByRole('alert').filter({hasText:c.pending}).waitFor();await page.getByRole('dialog').getByRole('button',{name:c.cancel,exact:true}).last().click();await page.getByRole('button',{name:c.edit,exact:true}).click();assert.equal(await page.getByLabel(c.plate_number).inputValue(),'PENDING-PLATE');await page.getByRole('button',{name:c.retry,exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.deepEqual(writes[0],writes[1]);assert.match(writes[0].request,/^[0-9a-f-]{36}$/);await page.getByText('CURRENT',{exact:true}).waitFor();await page.getByRole('tab',{name:c.changes,exact:true}).click();await page.getByText(c.pendingReview,{exact:true}).waitFor();checks.push(`${locale}/${width}: edit remains pending; ambiguous retry retains UUID and payload`);
  role='accountant';await page.reload();assert.equal(await page.getByRole('tab',{name:c.vehicles,exact:true}).count(),0);assert.equal(await page.getByRole('tab',{name:c.staff,exact:true}).count(),0);await page.getByRole('tab',{name:c.billing,exact:true}).click();await page.getByText('DEMO-JDS-2026-00000002',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:c.recordPayment,exact:true}).count(),0);
  role='fleet_manager';await page.reload();await page.getByRole('tab',{name:c.vehicles,exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:c.billing,exact:true}).count(),0);checks.push(`${locale}/${width}: accountant read-only finance; fleet has no billing or staff controls`);
  admin=true;await page.goto(base+'/admin/approval-requests');await page.getByRole('tab',{name:'طلبات الشركات',exact:true}).click();await page.getByRole('button',{name:c.approve,exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:c.save,exact:true}).click();await page.getByText(c.approved,{exact:true}).waitFor();
  await page.goto(base+'/admin/companies/1?tab=billing');await page.getByRole('button',{name:c.demoIssue,exact:true}).click();await page.getByText(c.demoNotice,{exact:true}).last().waitFor();await page.getByRole('dialog').getByRole('button',{name:c.save,exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.getByRole('button',{name:c.recordPayment,exact:true}).click();await page.getByRole('combobox',{name:c.paymentMethod,exact:true}).click();await page.getByRole('option',{name:c.cash,exact:true}).waitFor();await page.keyboard.press('Escape');await page.getByLabel(c.paymentReference,{exact:true}).fill('SYNTHETIC-CASH');await page.getByRole('dialog').getByRole('button',{name:c.save,exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.getByText(c.paid,{exact:true}).waitFor();await page.getByText('SYNTHETIC-CASH',{exact:true}).waitFor();assert.equal(writes.at(-1).amount_cents,6050);
  await page.getByRole('button',{name:c.settings,exact:true}).click();assert.equal(await page.getByLabel(c.defaultVat,{exact:true}).inputValue(),'21');await page.getByRole('dialog').getByRole('button',{name:c.cancel,exact:true}).last().click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${qa}/billing-${locale}-${width}.png`,fullPage:true});assert.deepEqual(errors,[]);checks.push(`${locale}/${width}: admin approval, demo issuance, 21% VAT and cash settlement work`);await context.close();
 }
 fs.writeFileSync(qa+'/web-result.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
}catch(e){if(lastPage&&!lastPage.isClosed()){console.error((await lastPage.locator('body').innerText()).slice(-4500));await lastPage.screenshot({path:qa+'/failure.png',fullPage:true});}throw e;}finally{await browser?.close();server.kill('SIGTERM');}
