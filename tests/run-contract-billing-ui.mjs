// Synthetic website acceptance. No real signatures, invoices, mail, or account mutations.
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import fs from 'node:fs';import {pathToFileURL} from 'node:url';import {randomBytes} from 'node:crypto';
import {operationsCopy} from '../src/components/operations/operations-copy.ts';import {subscriptionOfferCopy} from '../src/lib/subscription-offer.ts';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href),base='http://127.0.0.1:3038',qa=process.env.CONTRACT_BILLING_QA_DIR||'/tmp/jd-contract-billing-qa';fs.mkdirSync(qa,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3038'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser,lastPage;const checks=[];
try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,250));}assert.ok(ready);
 browser=await chromium.launch({headless:true});
 for(const locale of ['ar','fr','nl'])for(const width of [390,1280]){
  const c=operationsCopy[locale],t=subscriptionOfferCopy[locale],context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(locale=>{localStorage.setItem('driver_language',locale);localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));},locale);
  let signed=false,role='owner',fail=true;const writes=[];
  const company={id:3,name:'Synthetic Annual Company',is_test:true,subscription_status:'active'};
  const contract=()=>({id:7,company_id:3,contract_number:'SYN-ANNUAL-50',contract_status:signed?'active':'pending_signature',contract_start_date:'2026-10-18',contract_end_date:'2027-10-18',monthly_fee:50,annual_fee:600,vat_bps:2100,signed_at:signed?'2026-10-18T10:00:00Z':null,updated_at:'2026-10-18T08:00:00Z',contract_html_template:'<html lang="fr"><body><h2>Contrat annuel</h2><p>50.00 EUR par mois, TVA 21% comprise. 41.32 EUR + 8.68 EUR. 12 mensualités : 600.00 EUR. Pas de renouvellement automatique.</p><script>throw Error("unsafe")</script></body></html>'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  await context.route(base+'/next_api/**',async route=>{
   const req=route.request(),url=new URL(req.url());let data=[],status=200;
   if(url.pathname==='/next_api/auth/user')data={sub:'1000',isAdmin:false,userType:'manager',role:'browser',email:'synthetic@example.invalid'};
   else if(url.pathname==='/next_api/company-portal')data={company,companies:[company],membership_role:role,can_manage_fleet:false,can_view_billing:true,can_manage_staff:role==='owner',drivers:[],vehicles:[],drivers_total:0,vehicles_total:0,summary:{drivers:0,vehicles:0,active_vehicles:0}};
   else if(url.pathname==='/next_api/company-portal/billing')data={documents:signed?[{id:8,document_number:'DEMO-SYN-INVOICE',kind:'invoice',state:'prepared',is_test:true,period_start:'2026-10-18',contract_number:'SYN-ANNUAL-50',installment_number:1,net_cents:4132,vat_cents:868,gross_cents:5000,vat_bps:2100,balance_cents:null,due_date:null}]:[],entries:[],payments:[],total:signed?1:0,entry_total:0,posted_balance_cents:0,overdue_cents:0,prepared_count:signed?1:0,profile:{enabled:signed,contract_id:7,monthly_gross_cents:5000},settings:null,mail:[],admin:false};
   else if(url.pathname==='/next_api/company-portal/contracts'){
    if(req.method()==='POST'){writes.push(req.postDataJSON());if(fail){fail=false;status=503;}else{assert.equal(writes.at(-1).consent,true);signed=true;data={contract_id:7,signed:true,first_document_id:8};}}
    else data={rows:[contract()],total:1,can_sign:role==='owner'};
   }
   await route.fulfill({status,json:{success:status===200,data,...(status===200?{}:{errorMessage:'Synthetic unavailable'})}});
  });
  const page=await context.newPage();lastPage=page;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/company/dashboard');await page.getByRole('tab',{name:c.billing,exact:true}).click();await page.getByRole('button',{name:t.contracts,exact:true}).click();await page.getByRole('button',{name:t.sign,exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:t.confirm,exact:true}).click();assert.equal(writes.length,0);await page.getByLabel(t.signName,{exact:true}).fill('Synthetic Company Owner');await page.getByLabel(t.position,{exact:true}).fill('Director');await dialog.getByRole('button',{name:t.confirm,exact:true}).click();assert.equal(writes.length,0);await page.getByLabel(t.consent,{exact:true}).check();
  await dialog.getByRole('button',{name:t.confirm,exact:true}).click();await dialog.getByRole('alert').waitFor();await dialog.locator('form').getByRole('button',{name:c.cancel,exact:true}).click();await page.getByRole('button',{name:t.sign,exact:true}).click();assert.equal(await page.getByLabel(t.signName,{exact:true}).inputValue(),'Synthetic Company Owner');await page.getByRole('dialog').getByRole('button',{name:c.retry,exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.deepEqual(writes[0],writes[1]);
  await page.getByText('DEMO-SYN-INVOICE',{exact:false}).waitFor();await page.getByText(t.signed,{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:t.sign,exact:true}).count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`${qa}/contract-billing-${locale}-${width}.png`,fullPage:true});
  signed=false;role='accountant';await page.reload();await page.getByRole('tab',{name:c.billing,exact:true}).click();await page.getByRole('button',{name:t.contracts,exact:true}).click();await page.getByText(t.pending,{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:t.sign,exact:true}).count(),0);assert.deepEqual(errors,[]);checks.push(`${locale}/${width}: contract review, required consent, retained idempotent signature retry, linked invoice and accountant read-only access`);await context.close();
 }
 fs.writeFileSync(qa+'/result.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
}catch(e){if(lastPage&&!lastPage.isClosed()){await lastPage.screenshot({path:qa+'/failure.png',fullPage:true});console.error((await lastPage.locator('body').innerText()).slice(-3500));}throw e;}finally{await browser?.close();server.kill('SIGTERM');}
