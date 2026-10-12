// Synthetic document fixtures only; verify actual production rendering and print CSS.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const style={},template={};
for(const [file,context] of [['contract-document-style',{exports:style}],['contract-template',{exports:template,require:()=>style}]]) vm.runInNewContext(ts.transpileModule(fs.readFileSync(`src/lib/${file}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const contracts=['nl','fr'].map((language,i)=>({id:i+1,company_id:1,contract_number:`QA-${language}`,contract_status:i?'active':'pending_signature',signed_at:i?'2026-01-31T12:00:00Z':null,monthly_fee:99.95,annual_fee:1199.4,contract_start_date:'2026-01-31',contract_end_date:'2027-01-31',contract_duration_months:12,auto_renew:true,renewal_notice_days:90,contract_html_template:template.generateContractHTML({contractNumber:`QA-${language}`,companyName:'SYNTHETIC & Co',companyVAT:'BE0000000000',companyKBO:'0000000000',startDate:'2026-01-31',endDate:'2027-01-31',monthlyFee:99.95,annualFee:1199.4,durationMonths:12,language})+'<img src="https://example.invalid/tracker"><script>window.contractInjected=true</script><style>body{display:none}</style>'}));
const base='http://127.0.0.1:3014';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3014'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
let browser;const checks=[];
try{
 let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch({headless:true});
 for(const [name,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.setItem('driver_language','ar');localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));});
  const foreign=[];await context.route('**/*',route=>{if(new URL(route.request().url()).origin===base)return route.continue();foreign.push(route.request().url());return route.abort();});
  await context.route(base+'/next_api/**',async route=>{
   const url=new URL(route.request().url());let data=[];
   if(url.pathname==='/next_api/auth/user')data={sub:'9001',email:'synthetic@example.invalid',isAdmin:true,userType:'admin',role:'browser'};
   if(url.pathname==='/next_api/companies')data=[{id:1,name:'SYNTHETIC & Co'}];
   if(url.pathname==='/next_api/contracts')data=contracts.filter(c=>!url.searchParams.has('id')||String(c.id)===url.searchParams.get('id'));
   await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data})});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/admin/companies/1/contracts');
  await page.getByRole('button',{name:'معاينة العقد',exact:true}).first().click();
  await page.locator('[data-contract-document] .page').waitFor();
  assert.equal(await page.getByRole('link',{name:/طباعة/}).getAttribute('href'),'/contract-print/1');
  checks.push(name+': contract preview and authenticated print link open');
  for(const c of contracts){
   const response=await page.goto(base+'/contract-print/'+c.id);assert.match(response.headers()['cache-control'],/private.*no-store/);const doc=page.locator('[data-contract-document]');await doc.locator('.page').waitFor();
   assert.equal(await doc.getAttribute('lang'),c.id===1?'nl':'fr');assert.ok((await doc.innerText()).includes('99.95'));
   assert.equal(await doc.locator('script,style,img,iframe').count(),0);
   assert.equal(await page.evaluate(()=>window.contractInjected),undefined);
   assert.equal(await doc.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'no horizontal overflow');
   await page.emulateMedia({media:'print'});assert.equal(await page.locator('.contract-print-controls').isVisible(),false);
   if(name==='desktop'&&process.env.CONTRACT_QA_DIRECTORY){fs.mkdirSync(process.env.CONTRACT_QA_DIRECTORY,{recursive:true});await page.pdf({path:`${process.env.CONTRACT_QA_DIRECTORY}/synthetic-${c.id===1?'nl':'fr'}.pdf`,printBackground:true,preferCSSPageSize:true});}
   await page.emulateMedia({media:'screen'});
   checks.push(`${name}: ${c.id===1?'NL':'FR'} paper styles, sanitized content and print controls verified`);
  }
  assert.equal(foreign.filter(x=>x.includes('tracker')).length,0);assert.deepEqual(errors,[]);await context.close();
 }
 console.log(JSON.stringify({passed:checks.length,checks,data:'Synthetic fixtures only; no legal signing or production account'},null,2));
}finally{await browser?.close();server.kill('SIGTERM');}
