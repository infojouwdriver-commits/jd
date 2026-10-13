// Render the deployed image on loopback only. No production accounts or remote website access.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';


const {chromium,webkit}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const image=process.env.UI_IMAGE;
assert.match(image,/^ghcr\.io\/infojouwdriver-commits\/jd@sha256:[a-f0-9]{64}$/);
const container='jouw-driver-isolated-ui';
const base='http://127.0.0.1:3008';
const docker=(args)=>execFileSync('docker',args,{stdio:['ignore','pipe','pipe']}).toString().trim();
const settings={JWT_SECRET:randomBytes(48).toString('hex'),HASH_SALT_KEY:randomBytes(32).toString('hex'),RATE_LIMIT_SECRET:randomBytes(48).toString('hex'),APP_ORIGIN:base,POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'jouw_app_user',SCHEMA_ADMIN_USER:'jouw_service',DEPLOYMENT_MODE:'production',SCHEMA_VALIDATED:'true',SCHEMA_SOURCE:'independent',TRUST_PROXY:'false',CHIRON_TRANSMISSION_ENABLED:'false'};
fs.mkdirSync('ui-output',{recursive:true});
const checks=[];
try{
 docker(['run','--detach','--name',container,'--read-only','--tmpfs','/tmp:rw,noexec,nosuid,size=64m','--publish','127.0.0.1:3008:3000',...Object.entries(settings).flatMap(([k,v])=>['--env',k+'='+v]),'--entrypoint','node',image,'server.js']);
 let ready=false;for(let n=0;n<60;n++){try{ready=(await fetch(base+'/login')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,500));}assert.ok(ready,'Isolated image must serve login');
 for(const [name,engine,viewport]of [['chromium-desktop',chromium,{width:1280,height:900}],['webkit-mobile',webkit,{width:390,height:844}]]){
  const browser=await engine.launch();
  try{
   const context=await browser.newContext({viewport,serviceWorkers:'block'});
   await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
   await context.addInitScript(()=>localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}})));
   let page=await context.newPage();const failures=[];
   page.on('pageerror',error=>failures.push(error.message));
   page.on('console',message=>{if(/Refused to execute|Refused to load the script|violates.*script-src/i.test(message.text()))failures.push('Script CSP violation');});
   await page.goto(base+'/login');
   const background=await page.locator('div.dark').evaluate(el=>({text:getComputedStyle(el).color,image:getComputedStyle(el).backgroundImage}));
   assert.equal(background.text,'rgb(255, 255, 255)');
   assert.ok(background.image.includes('linear-gradient'),'Valid dark gradient must preserve white text contrast');
   checks.push(name+': valid dark login background and scoped theme');
   await page.getByRole('button',{name:'Company Portal',exact:true}).click();
   await page.locator('#company-email').waitFor({state:'visible'});
   assert.ok(await page.getByRole('button',{name:'Sign In as Company',exact:true}).isVisible());
   await page.getByRole('button',{name:'Admin / User',exact:true}).click();
   assert.equal(await page.locator('#company-email').count(),0);
   checks.push(name+': admin and company switch without a new window');
   await page.screenshot({path:'ui-output/'+name+'-login.png',fullPage:true});
   await page.getByRole('link',{name:'Driver Login',exact:true}).click();
   await page.locator('#phone').waitFor({state:'visible'});
   await page.getByRole('button',{name:'Show password',exact:true}).click();
   assert.equal(await page.locator('#password').getAttribute('type'),'text');
   await page.getByRole('button',{name:'Hide password',exact:true}).click();
   assert.equal(await page.locator('#password').getAttribute('type'),'password');
   await page.getByRole('button',{name:'AR',exact:true}).click();
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
   await page.getByRole('button',{name:'FR',exact:true}).click();
   assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
   await page.screenshot({path:'ui-output/'+name+'-driver.png',fullPage:true});
   checks.push(name+': driver navigation, password visibility and language switches');
   await page.goto(base+'/login');
   await page.getByRole('link',{name:'الخصوصية · Confidentialité',exact:true}).click();
   await page.waitForURL(base+'/privacy-policy');
   assert.ok(await page.getByRole('heading').count()>0);
   checks.push(name+': privacy link navigation');
   await page.goto(base+'/');
   await page.getByRole('button',{name:'AR',exact:true}).click();
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
   assert.ok(await page.getByRole('heading',{name:/من الرحلة إلى إدارة شركتك/}).isVisible());
