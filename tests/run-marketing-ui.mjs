import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {randomBytes} from 'node:crypto';
const output=process.env.MARKETING_QA_DIR||'/tmp/jd-cinematic-qa';fs.mkdirSync(output,{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.UI_PLAYWRIGHT_PATH).href);
const base='http://127.0.0.1:3024',portal=process.env.PORTAL_QA_ORIGIN||'';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3024'],{env:{...process.env,NODE_ENV:'production',APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
let browser;
const report=[];
async function consent(context){await context.addInitScript(()=>localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}})));}
try{
 let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch(base)).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,400));}assert.ok(ready,'Production server ready');
 browser=await chromium.launch({headless:true,...(process.env.UI_CHROMIUM_PATH?{executablePath:process.env.UI_CHROMIUM_PATH}:{}),args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 // Render the original scene into its lightweight reduced-motion poster first.
 const moving=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',...(process.env.CINEMA_VIDEO?{recordVideo:{dir:output,size:{width:1280,height:900}}}:{})});await consent(moving);const page=await moving.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fr');await page.waitForSelector('.jd-scene[data-ready=true]',{timeout:60000});
 const travel=await page.locator('#experience').evaluate(e=>e.offsetHeight-innerHeight+76);
 for(const [name,p]of[['ignition',0],['shift',.18],['taxi',.43],['cockpit',.68],['completed',.735],['printer',.85],['receipt',.99],['reverse-cockpit',.68],['reverse-taxi',.43],['reverse-phone',0]]){
  await page.evaluate(y=>scrollTo(0,y),travel*p);await page.waitForFunction(p=>Math.abs(Number(document.querySelector('.jd-scene').dataset.progress)-p)<.015,p);await page.waitForTimeout(300);await page.screenshot({path:output+'/'+name+'.png'});
  assert.ok(await page.locator('.jd-scene canvas').isVisible(),'Real WebGL canvas visible');
  const overlap=await page.evaluate(()=>{const a=document.querySelector('.jd-narrative').getBoundingClientRect(),b=document.querySelector('.jd-scene').getBoundingClientRect();return a.right>b.left+1&&b.right>a.left+1&&a.bottom>b.top+1&&b.bottom>a.top+1;});assert.equal(overlap,false,'Narrative never overlaps the scene');
  if(name==='taxi'){await page.locator('.jd-scene').screenshot({path:output+'/poster.png'});const require=createRequire(import.meta.url);const sharp=require(require.resolve('sharp',{paths:[require.resolve('next/package.json')]}));await sharp(output+'/poster.png').resize(1200,1000,{fit:'contain',background:'#060B12'}).webp({quality:88}).toFile('public/cinematic/poster.webp');fs.copyFileSync('public/cinematic/poster.webp',output+'/poster.webp');}
  report.push({stage:name,progress:p,pass:true});
 }
 assert.deepEqual(errors,[],'No scene JavaScript errors');await moving.close();
 for(const lang of ['ar','fr','nl'])for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});await consent(context);const p=await context.newPage();const failures=[];p.on('pageerror',e=>failures.push(e.message));
  const response=await p.goto(base+'/'+lang);assert.equal(response.status(),200);await p.waitForSelector('.jd-static');assert.equal(await p.locator('.jd').getAttribute('lang'),lang);assert.equal(await p.locator('html').getAttribute('dir'),lang==='ar'?'rtl':'ltr');assert.equal(await p.locator('.jd-scene canvas').count(),0,'Reduced motion loads no WebGL');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://jouww.com/'+lang);assert.equal(await p.locator('link[rel=alternate][hreflang]').count(),4);assert.ok((await p.locator('script[type="application/ld+json"]').textContent()).includes('FAQPage'));
  for(const href of await p.locator('.jd a[href^="#"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))assert.ok(await p.locator(href).count(),'Anchor resolves '+href);
  assert.equal(await p.locator('.jd-feature-list a').getAttribute('href'),portal+'/driver-login');assert.equal(await p.locator('.jd-company>.jd-text-link').getAttribute('href'),portal+'/login?portal=company');
  await p.locator('.jd-faq summary').first().click();assert.ok(await p.locator('.jd-faq details').first().evaluate(e=>e.open));await p.locator('.jd-faq summary').first().press('Enter');assert.equal(await p.locator('.jd-faq details').first().evaluate(e=>e.open),false);
  const register=p.locator('.jd-price button');await register.click();if(portal){await p.waitForURL(portal+'/register-company?lang='+lang);}else{const dialog=p.getByRole('dialog');await dialog.waitFor({state:'visible'});assert.ok(await dialog.locator('input').count());await p.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.ok(await register.evaluate(e=>document.activeElement===e),'Focus restored');}
  assert.deepEqual(failures,[]);await p.screenshot({path:output+'/'+lang+'-'+width+'.png',fullPage:width===1440});report.push({locale:lang,width,reducedMotion:true,pass:true});await context.close();
 }
 for(const width of [390,768]){const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'});await consent(context);const p=await context.newPage();await p.goto(base+'/ar');await p.waitForSelector('.jd-scene[data-ready=true]');await p.locator('#chapter-1').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(1000);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:output+'/animated-'+width+'.png'});await p.locator('.jd-motion').click();await p.waitForSelector('.jd-static');assert.equal(await p.locator('canvas').count(),0,'Toggle disposes canvas');await context.close();report.push({width,animated:true,toggle:true,pass:true});}
 const fail=await browser.newContext();await fail.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});const p=await fail.newPage();await p.goto(base+'/nl');await p.waitForSelector('.jd-static');assert.ok(await p.locator('.jd-price button').isVisible());await fail.close();report.push({webglFailure:true,pass:true});
 fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));console.log('PASS cinematic stages, reverse scroll, 3 locales × 4 widths, keyboard, registration, SEO, reduced motion, WebGL fallback');
}finally{await browser?.close();server.kill('SIGTERM');}
