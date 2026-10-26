// Local invoice payment acceptance. Synthetic API only; no provider payment or real email.
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import fs from 'node:fs';import {pathToFileURL} from 'node:url';import {randomBytes} from 'node:crypto';
import {operationsCopy} from '../src/components/operations/operations-copy.ts';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href),base='http://127.0.0.1:3041',qa=process.env.STRIPE_BILLING_QA_DIR||'/tmp/jd-stripe-qa';fs.mkdirSync(qa,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3041'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser,lastPage;const checks=[];
const copy={ar:{pay:'الدفع عبر Stripe',send:'إرسال الفاتورة',title:'دفع الفاتورة',refresh:'تحديث الحالة',paid:'الفاتورة مسددة. لا تدفع مرة أخرى.'},fr:{pay:'Payer avec Stripe',send:'Envoyer la facture',title:'Payer la facture',refresh:'Actualiser le statut',paid:'Facture payée. Ne payez pas à nouveau.'},nl:{pay:'Betalen met Stripe',send:'Factuur verzenden',title:'Factuur betalen',refresh:'Status vernieuwen',paid:'Factuur betaald. Betaal niet opnieuw.'}};
try{
 let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,300));}assert.ok(ready);browser=await chromium.launch({headless:true});
 for(const locale of ['ar','fr','nl'])for(const width of [390,1280]){
  const c=operationsCopy[locale],w=copy[locale],context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(({locale,width})=>{localStorage.setItem('theme',width===390?'dark':'light');localStorage.setItem('driver_language',locale);localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));},{locale,width});
  let balance=5000,fail=false,admin=false;const writes=[],oldCalls=[],errors=[];
  const company={id:3,name:'Synthetic Invoice Company',is_test:false,subscription_status:'active'};
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  await context.route(base+'/next_api/**',async route=>{
   const req=route.request(),url=new URL(req.url());let data=[],status=200;
   if(url.pathname==='/next_api/auth/user')data={sub:admin?'999':'1000',isAdmin:admin,userType:admin?'admin':'manager',role:'browser',email:'synthetic@example.invalid'};
   else if(url.pathname==='/next_api/company-portal')data={company,companies:[company],membership_role:'owner',can_manage_fleet:false,can_view_billing:true,can_manage_staff:false,drivers:[],vehicles:[],drivers_total:0,vehicles_total:0,summary:{drivers:0,vehicles:0,active_vehicles:0}};
   else if(url.pathname==='/next_api/company-portal/billing'){
    if(req.method()==='POST'){writes.push(req.postDataJSON());if(fail){status=503;fail=false;}else data={accepted:true,status:'accepted'};}
    else data={documents:[{id:8,document_number:'SYN-INVOICE-1',kind:'invoice',state:'issued',is_test:false,period_start:'2026-10-26',gross_cents:5000,net_cents:4132,vat_cents:868,vat_bps:2100,due_date:'2026-11-09',balance_cents:balance}],payable:balance?{8:base+'/pay/invoice#synthetic-token'}:{},entries:[],payments:[],total:1,entry_total:0,posted_balance_cents:balance,overdue_cents:0,prepared_count:0,profile:{enabled:true,contract_id:7,monthly_gross_cents:5000},settings:null,mail:[],admin};
   }else if(url.pathname==='/next_api/manual-invoices'){
    if(req.method()==='POST'){writes.push(req.postDataJSON());if(fail){status=503;fail=false;}else data={accepted:true,status:'accepted'};}
    else data={documents:[{id:9,company_id:3,document_number:'SYN-MANUAL-1',state:'prepared',is_test:false,gross_cents:5000,balance_cents:5000,recipient:{name:company.name}}],total:1,companies:[company],settings:{issuer_company_id:3,default_vat_bps:2100}};
   }else if(url.pathname==='/next_api/stripe-billing'){oldCalls.push(req.method());status=503;}
   else if(url.pathname==='/next_api/invoice-payment'){
    const v=req.postDataJSON();writes.push(v);
    if(fail){status=409;fail=false;}else data={number:'SYN-INVOICE-1',balance_cents:balance,collection:'bank',language:locale};
   }
   await route.fulfill({status,json:{success:status===200,data,...(status===200?{}:{errorMessage:'Synthetic unavailable'})}});
  });
  const page=await context.newPage();lastPage=page;page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/company/dashboard');await page.getByRole('tab',{name:c.billing,exact:true}).click();
  const pay=page.getByRole('link',{name:w.pay,exact:true});await pay.waitFor();assert.equal(await pay.getAttribute('href'),base+'/pay/invoice#synthetic-token');assert.deepEqual(oldCalls,[]);assert.equal(await page.getByRole('checkbox').count(),0);
  await page.screenshot({path:`${qa}/invoice-owner-${locale}-${width}.png`,fullPage:true});
  await pay.click();await page.getByRole('heading',{name:w.title,exact:true}).waitFor();await page.getByRole('button',{name:w.pay,exact:true}).waitFor();assert.equal(new URL(page.url()).hash,'');
  fail=true;await page.getByRole('button',{name:w.pay,exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(writes.at(-1).action,'checkout');
  balance=0;await page.getByRole('button',{name:w.refresh,exact:true}).click();await page.getByText(w.paid,{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:w.pay,exact:true}).count(),0);
  admin=true;await page.goto(base+'/admin/invoices');await page.getByRole('button',{name:w.send,exact:true}).click();const dialog=page.getByRole('dialog');fail=true;await dialog.getByRole('button',{name:w.send,exact:true}).click();await dialog.getByRole('button',{name:c.retry,exact:true}).waitFor();const first=writes.at(-1);await dialog.getByRole('button',{name:c.retry,exact:true}).press('Enter');await dialog.waitFor({state:'hidden'});assert.deepEqual(writes.at(-1),first);assert.equal(first.action,'send');assert.equal(first.data.document_id,9);await page.getByRole('status').filter({hasText:locale==='ar'?'مزود البريد':locale==='fr'?'prestataire':'mailprovider'}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);checks.push(`${locale}/${width}: invoice link replaces automatic consent, public one-time payment, failure recovery, settled suppression, send PDF/email same-request retry`);await context.close();
 }
 fs.writeFileSync(qa+'/result.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
}catch(e){if(lastPage&&!lastPage.isClosed()){await lastPage.screenshot({path:qa+'/failure.png',fullPage:true});console.error((await lastPage.locator('body').innerText()).slice(-2500));}throw e;}finally{await browser?.close();server.kill('SIGTERM');}
