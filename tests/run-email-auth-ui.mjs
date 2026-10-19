// Production website UI, synthetic provider config and intercepted requests only.
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {randomBytes} from 'node:crypto';import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base='http://127.0.0.1:3035';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3035'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),MAIL_PROVIDER:'brevo',BREVO_API_KEY:'synthetic-only',BREVO_FROM_EMAIL:'sender@example.invalid',BREVO_SENDER_VERIFIED:'true',BREVO_FREE_PLAN_CONFIRMED:'true',BREVO_WEBHOOK_TOKEN:'a'.repeat(48),DATA_ENCRYPTION_KEY:'b'.repeat(64)},stdio:'ignore'});
let browser;try{
 let ready=false;for(let n=0;n<60;n++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 browser=await chromium.launch({headless:true});
 for(const width of [360,1280]){
  const context=await browser.newContext({viewport:{width,height:800},reducedMotion:'reduce',serviceWorkers:'block'});const page=await context.newPage(),calls=[];let fail=true;
  await context.route(base+'/next_api/**',async route=>{const req=route.request(),url=new URL(req.url());if(url.pathname==='/next_api/auth/send-verification'||url.pathname==='/next_api/auth/reset-password'){calls.push({path:url.pathname,body:req.postDataJSON()});if(url.pathname.endsWith('reset-password')&&fail){fail=false;return route.fulfill({status:401,json:{success:false,errorMessage:'Invalid or expired verification code'}});}return route.fulfill({status:200,json:{success:true,data:{data:true}}});}return route.fulfill({status:401,json:{success:false}});});
  await page.goto(base+'/login?portal=company');await page.getByRole('button',{name:/Mot de passe oublié/}).click();
  await page.getByLabel('Email',{exact:true}).fill('owner@example.invalid');await page.getByRole('button',{name:'Send Verification Code',exact:true}).click();
  assert.equal(calls[0].body.type,'reset-password');assert.equal(calls[0].body.email,'owner@example.invalid');
  await page.locator('input[data-input-otp]').fill('123456');await page.getByLabel('New Password',{exact:true}).fill('short');await page.getByLabel('Confirm Password',{exact:true}).fill('short');await page.getByRole('button',{name:'Reset Password',exact:true}).click();assert.equal(calls.length,1);
  const password=randomBytes(18).toString('base64url');await page.getByLabel('New Password',{exact:true}).fill(password);await page.getByLabel('Confirm Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Reset Password',exact:true}).click();await page.getByRole('alert').filter({hasText:'Invalid or expired verification code'}).waitFor();assert.equal(await page.getByLabel('New Password',{exact:true}).inputValue(),password);
  await page.getByRole('button',{name:'Reset Password',exact:true}).click();await page.getByRole('button',{name:'Sign In as Company',exact:true}).waitFor();assert.equal(calls.length,3);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await context.close();console.log(`PASS ${width}: Brevo runtime availability, company recovery, password validation, error preserves fields and successful return to company sign-in`);
 }
}finally{await browser?.close();server.kill('SIGTERM');}
