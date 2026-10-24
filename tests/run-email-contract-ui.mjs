import {spawn} from 'node:child_process';import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';import fs from 'node:fs';
const {chromium}=await import(process.env.UI_PLAYWRIGHT_PATH||'playwright');
const base='http://127.0.0.1:3035';const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3035'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
const copies={ar:{sign:'أوافق وأوقّع',name:'الاسم الكامل',position:'الصفة في الشركة',retry:'إعادة المحاولة',saved:'تم توقيع العقد وحفظ إثبات الموافقة.'},fr:{sign:'Accepter et signer',name:'Nom complet',position:'Fonction dans l’entreprise',retry:'Réessayer',saved:'Contrat signé. La preuve de votre accord est conservée.'},nl:{sign:'Akkoord en ondertekenen',name:'Volledige naam',position:'Functie in het bedrijf',retry:'Opnieuw proberen',saved:'Contract ondertekend. Uw akkoord is vastgelegd.'}};
let browser;const checks=[];
try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(base+'/privacy-policy')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);browser=await chromium.launch({headless:true});
 for(const language of ['ar','fr','nl'])for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},serviceWorkers:'block'});
  await context.addInitScript(()=>localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}})));
  const fixture={contract:{id:5,contract_number:'SYN-EMAIL',contract_html_template:'<html lang="'+language+'"><body><article class="page"><h1>Synthetic reviewed contract</h1><p>Monthly fee: 50 EUR. Annual fee: 600 EUR.</p><img src="https://invalid.example/tracker"><script>window.contractInjected=true</script></article></body></html>',contract_language:language,monthly_fee:50,annual_fee:600,contract_start_date:'2026-10-24',contract_end_date:'2027-10-24'},company:{name:'Synthetic Company',email:'owner@example.invalid'},signed:false,digest:'a'.repeat(64)};
  const calls=[],leaks=[];let signed=false;
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==base){leaks.push(u.href);return route.abort();}return route.continue();});
  await context.route(base+'/next_api/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(path.endsWith('/verify-token')){assert.equal(route.request().method(),'POST');calls.push({path,body:route.request().postDataJSON()});return route.fulfill({json:{success:true,data:fixture}});}
   if(path.endsWith('/sign')){
    const body=route.request().postDataJSON();calls.push({path,body});assert.equal(body.consent,true);assert.equal(body.signer_email,undefined);assert.equal(body.signature_token,'synthetic-bearer');
    if(!signed){signed=true;return route.fulfill({status:503,json:{success:false}});}
    return route.fulfill({json:{success:true,data:{...fixture,signed:true,confirmation_accepted:true,evidence:{signer_name:body.signer_name,signer_position:body.signer_position,signer_email:fixture.company.email,signed_at:'2026-10-24T08:00:00Z',signature_ip:'203.0.113.2',consent:'Synthetic explicit consent'}}}});
   }
   return route.fulfill({status:401,json:{success:false}});
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base+'/sign-contract/email#synthetic-bearer');assert.match(response.headers()['cache-control'],/no-store/);assert.equal(response.headers()['referrer-policy'],'no-referrer');assert.match(response.headers()['x-robots-tag'],/noindex/);
  const t=copies[language];await page.getByRole('button',{name:t.sign,exact:true}).waitFor();assert.equal(calls.filter(c=>c.path.endsWith('/sign')).length,0);
  await page.getByRole('button',{name:t.sign,exact:true}).click();await page.locator('#operation-error').waitFor();assert.equal(calls.filter(c=>c.path.endsWith('/sign')).length,0);
  await page.getByLabel(t.name,{exact:true}).fill('Synthetic Owner');await page.getByLabel(t.position,{exact:true}).fill('Director');await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:t.sign,exact:true}).click();await page.getByRole('button',{name:t.retry,exact:true}).waitFor();assert.equal(await page.getByLabel(t.name,{exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:t.retry,exact:true}).press('Enter');await page.getByText(t.saved,{exact:true}).waitFor();assert.deepEqual(calls.filter(c=>c.path.endsWith('/sign')).map(c=>c.body)[0],calls.filter(c=>c.path.endsWith('/sign')).map(c=>c.body)[1]);
  assert.equal(await page.locator('[data-contract-document] script,[data-contract-document] img').count(),0);assert.equal(await page.evaluate(()=>window.contractInjected),undefined);assert.deepEqual(leaks,[]);assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('.email-contract-controls').first().isVisible(),false);assert.equal(await page.locator('.email-contract-proof').isVisible(),true);await page.emulateMedia({media:'screen'});
  if(language==='ar'&&mobile&&process.env.CONTRACT_EMAIL_QA_DIR){fs.mkdirSync(process.env.CONTRACT_EMAIL_QA_DIR,{recursive:true});await page.screenshot({path:process.env.CONTRACT_EMAIL_QA_DIR+'/signed-mobile.png',fullPage:true});}
  checks.push(language+' '+(mobile?'mobile':'desktop')+': consent required, no login, no signature on open, uncertain retry stable, proof, print, no trackers');await context.close();
 }
 console.log(JSON.stringify({passed:checks.length,checks},null,2));
}finally{await browser?.close();server.kill('SIGTERM');}
