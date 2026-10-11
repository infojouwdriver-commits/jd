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
   const context=await browser.newContext({viewport});
   await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
   const page=await context.newPage();const failures=[];
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
   // Fixture responses exercise actual shipped admin components without production credentials.
   // Native release tests separately verify server authentication and database authorization.
   const companies=[{id:92,name:'Other fixture company',vat_number:'BE0999999999',kbo_number:'0999999999',chiron_mode:'TEST',subscription_status:'pending_contract'}, {id:91,name:'UI fixture company',vat_number:'BE0123456789',kbo_number:'0123456789',chiron_mode:'TEST',subscription_status:'pending_contract'}];
   const created=[];
   await context.addInitScript(()=>localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',categories:{essential:true,analytics:false,marketing:false}})));
   await context.route(base+'/next_api/**',async route=>{
    const request=route.request(),url=new URL(request.url());let data=[];
    if(url.pathname==='/next_api/auth/user')data={sub:'9001',id:9001,email:'admin@ui.example',isAdmin:true,userType:'admin',role:'jouw_app_user'};
    else if(url.pathname==='/next_api/companies'){
     if(request.method()==='POST'){const body=request.postDataJSON();created.push(body);companies.push({id:93,...body,chiron_mode:'TEST',subscription_status:'pending_contract'});data=companies.at(-1);}
     else data=companies; // Current API returns a list; settings must select the requested id.
    }
    await route.fulfill({status:request.method()==='POST'?201:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
   });
   await page.goto(base+'/dashboard');
   await page.locator('#workspace-content').getByRole('link',{name:'الشركات الحسابات والعقود والأسعار',exact:true}).click();
   await page.waitForURL(base+'/admin/companies');
   await page.getByRole('button',{name:'شركة جديدة',exact:true}).waitFor({state:'visible'});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Admin controls must fit the viewport');
   checks.push(name+': signed-in admin reaches companies in the same window');
   await page.getByRole('button',{name:'شركة جديدة',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'إنشاء شركة جديدة',exact:true});
   await dialog.getByPlaceholder('JOUW DRIVER SRL',{exact:true}).fill('Created UI company');
   await dialog.getByPlaceholder('BE0123456789',{exact:true}).fill('BE0111111111');
   await dialog.getByPlaceholder('0123456789',{exact:true}).fill('0111111111');
   await dialog.getByRole('button',{name:'إنشاء الشركة',exact:true}).click();
   await dialog.waitFor({state:'hidden'});
   await page.getByRole('heading',{name:'Created UI company',exact:true}).waitFor({state:'visible'});
   assert.equal(created.length,1);assert.equal(created[0].name,'Created UI company');assert.equal(created[0].kbo_number,'0111111111');
   checks.push(name+': company creation dialog submits once and refreshes the company list');
   const card=page.locator('[data-slot="card"]').filter({has:page.getByRole('heading',{name:'UI fixture company',exact:true})});
   await card.getByRole('link',{name:'إعدادات الشركة',exact:true}).click();
   await page.waitForURL(base+'/admin/companies/91/settings');
   await page.getByText('UI fixture company',{exact:true}).waitFor({state:'visible'});
   assert.equal(await page.getByText('Other fixture company',{exact:true}).count(),0);
   assert.ok(await page.getByRole('link',{name:/إعدادات التسعير/}).isVisible());
   assert.ok(await page.getByRole('link',{name:/عقود المنصات الخارجية/}).isVisible());
   checks.push(name+': company settings link selects the correct company and exposes existing settings');
   await page.goto(base+'/admin/companies');
   await page.getByRole('heading',{name:'Created UI company',exact:true}).waitFor({state:'visible'});
   await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
   const nav=page.locator('#management-navigation');
   if(viewport.width<1024)await page.getByRole('button',{name:'فتح القائمة',exact:true}).click();
   await nav.getByRole('link',{name:'السائقون',exact:true}).click();
   await page.waitForURL(base+'/admin/drivers');
   if(viewport.width<1024)assert.equal(await nav.isVisible(),false);
   checks.push(name+': navigation remains clickable after scrolling an admin page');
   assert.equal(context.pages().length,1,'Admin actions must not require another window');
   assert.equal(failures.length,0,name+': no hydration or script CSP errors');
  }finally{await browser.close();}
 }
 fs.writeFileSync('ui-output/verification.json',JSON.stringify({image,scope:'isolated deployed image on loopback; no live accounts',checks},null,2));
 console.log(JSON.stringify({scope:'isolated immutable production image',passed:checks.length,checks}));
}finally{try{docker(['rm','--force',container]);}catch{}}
