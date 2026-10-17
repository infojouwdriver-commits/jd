// Synthetic browser acceptance; no production accounts or financial dispatch.
import assert from 'node:assert/strict';import fs from 'node:fs';import {spawn} from 'node:child_process';import {pathToFileURL} from 'node:url';import {randomBytes} from 'node:crypto';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href),base='http://127.0.0.1:3017';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3017'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
const checks=[];let browser;
try{
 let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);browser=await chromium.launch({headless:true});
 for(const [name,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
 const context=await browser.newContext({viewport,serviceWorkers:'block'});await context.addInitScript(()=>{localStorage.setItem('driver_language','ar');localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));});
 const requests=[],writes=[];let archiveFail=true,archived=false;
 await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
 await context.route(base+'/next_api/**',async route=>{const req=route.request(),url=new URL(req.url());let data=[],status=200;
 if(url.pathname==='/next_api/auth/user')data={sub:'999',email:'admin@example.invalid',isAdmin:true,userType:'admin',role:'browser'};
 else if(url.pathname==='/next_api/companies')data=[{id:1,name:'Synthetic Company',vat_number:'BE0123456789',kbo_number:'0123456789',chiron_mode:'TEST'}];
 else if(url.pathname==='/next_api/company-directory'){
  requests.push(Object.fromEntries(url.searchParams));const kind=url.searchParams.get('kind');const company={id:1,name:'Synthetic Company',vat_number:'BE0123456789',kbo_number:'0123456789',chiron_mode:'TEST',subscription_status:'active',archived_at:archived?'2026-10-18T00:00:00Z':null};
  const rows=kind==='companies'?[company]:kind==='drivers'?[{id:1,company_id:1,company_name:company.name,full_name:'Synthetic Driver',phone:'+32470000000',status:'active'}]:[{id:1,company_id:1,company_name:company.name,brand:'Demo',model:'Car',plate_number:'DEMO-001',status:'active'}];
  data={rows:archived&&url.searchParams.get('state')!=='archived'?[]:rows,total:1,active:1,suspended:0,limit:Number(url.searchParams.get('limit')||25),offset:Number(url.searchParams.get('offset')||0)};
 }
 else if(url.pathname==='/next_api/company-lifecycle'){
  if(req.method()==='GET')data={company:{id:1},drivers:2,vehicles:3,events:[]};else{writes.push(req.postDataJSON());if(archiveFail){status=503;archiveFail=false;}else{archived=true;data={company_id:1,archived_at:'2026-10-18T00:00:00Z'};}}
 }
 await route.fulfill({status,contentType:'application/json',body:JSON.stringify({success:status===200,data,...(status!==200?{errorMessage:'Synthetic failure'}:{})})});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/admin/drivers?company_id=1');await page.getByText('Synthetic Driver',{exact:true}).waitFor();assert.ok(requests.some(r=>r.kind==='drivers'&&r.company_id==='1'));
 const search=page.getByRole('textbox',{name:'بحث بالاسم أو الهاتف أو اللوحة…'});await search.fill('Driver');await page.waitForTimeout(450);assert.ok(requests.some(r=>r.q==='Driver'));await page.getByRole('button',{name:'مسح البحث',exact:true}).click();await page.waitForTimeout(400);assert.ok(requests.at(-1).q==='');
 await page.getByRole('combobox',{name:'الشركة',exact:true}).click();await page.getByRole('combobox',{name:'ابحث عن شركة…'}).fill('Synthetic');await page.waitForTimeout(450);await page.getByRole('option',{name:'Synthetic Company'}).click();assert.ok(requests.some(r=>r.kind==='companies'&&r.q==='Synthetic'));checks.push(name+': company deep link, remote search/clear and company picker work');
 await page.goto(base+'/admin/companies');await page.getByRole('button',{name:'أرشفة',exact:true}).click();await page.getByRole('alertdialog').waitFor();assert.match(await page.getByRole('alertdialog').innerText(),/2.*3/);await page.getByLabel('سبب الإجراء').fill('Synthetic closure');await page.getByRole('alertdialog').getByRole('button',{name:'أرشفة',exact:true}).click();await page.getByRole('alert').filter({hasText:'تعذر إكمال العملية'}).waitFor();await page.getByRole('alertdialog').getByRole('button',{name:'أرشفة',exact:true}).click();await page.waitForTimeout(300);assert.equal(writes.length,2);assert.deepEqual(writes[0],writes[1]);checks.push(name+': archive preview, failure and frozen idempotent retry work');
 assert.deepEqual(errors,[]);await context.close();
 }
 console.log(JSON.stringify({passed:true,checks},null,2));
}finally{await browser?.close();server.kill('SIGTERM');}
