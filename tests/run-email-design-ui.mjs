import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {renderEmail,templateIds} from '../src/lib/email/renderer.ts';
import {emailSampleDesign} from '../src/lib/email/samples.ts';
import {emailEdits} from '../src/lib/email/settings.ts';

const {chromium}=await import(process.env.UI_PLAYWRIGHT_PATH||'playwright');
const base='http://127.0.0.1:3037';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3037'],{
  env:{...process.env,APP_ORIGIN:base,JWT_SECRET:randomBytes(48).toString('hex'),POSTGREST_URL:'http://127.0.0.1:39999',POSTGREST_SCHEMA:'public',SCHEMA_USER:'browser',SCHEMA_ADMIN_USER:'service',NEXT_TELEMETRY_DISABLED:'1'},
  stdio:'ignore',
});

let browser;
try {
  let ready=false;
  for(let i=0;i<60&&!ready;i++) {
    try {ready=(await fetch(base+'/login')).ok;} catch {}
    if(!ready) await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.ok(ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.UI_CHROMIUM_PATH});
  let settings={signature:'',templates:{}},version=1;
  const events=[];
  const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block',colorScheme:'light'});
  await page.addInitScript(()=>{
    localStorage.setItem('driver_language','ar');
    localStorage.setItem('theme','light');
    localStorage.setItem('gdpr_cookie_consent',JSON.stringify({version:'1.0',timestamp:new Date().toISOString(),categories:{essential:true,analytics:false,marketing:false}}));
  });
  await page.route('**/next_api/**',async route=>{
    const {pathname,searchParams}=new URL(route.request().url());
    let data=[];
    if(pathname==='/next_api/auth/user') data={sub:'9',email:'admin@example.invalid',user_type:'admin',isAdmin:true};
    if(pathname==='/next_api/email-templates') {
      const method=route.request().method();
      if(method==='GET') {
        const language=searchParams.get('language');
        const templates=templateIds.map(id=>{
          const design=emailSampleDesign(id,language);
          const edits=emailEdits(design,settings);
          const source=renderEmail(design,edits,{sample:true});
          const preview=renderEmail(design,edits,{sample:true,logo:'local'}).html;
          return {id,title:design.title,subject:source.subject,text:source.text,html:source.html,preview,previewOnly:id==='driver-report'};
        });
        data={settings,version,updated_at:null,templates,designVersion:'1.0.0'};
      } else {
        const body=route.request().postDataJSON();
        if(method==='PUT') {
          assert.equal(body.version,version);
          settings=body.settings;
          version++;
          data={settings,version};
        } else {
          events.push(body);
          data={accepted:true,status:events.length>1?'delivered':'accepted'};
        }
      }
    }
    return route.fulfill({json:{success:true,data}});
  });
  await page.goto(base+'/admin/email-templates');
  const frame=page.frameLocator('iframe[title="معاينة رسالة تجريبية"]');
  const logo=frame.locator('.jd-logo');
  await frame.locator('h1').waitFor();
  const logoUrl=base+'/email/jouw-driver-logo-v2.png';
  const logoResponse=await page.request.get(logoUrl);
  assert.ok(logoResponse.ok());
  assert.equal(logoResponse.headers()['content-type'],'image/png');
  assert.equal(await logo.getAttribute('background'),'/email/jouw-driver-logo-v2.png');
  assert.equal(await frame.locator('html').getAttribute('dir'),'rtl');
  assert.match(await logo.evaluate(cell=>getComputedStyle(cell).backgroundImage),/jouw-driver-logo-v2\.png/);
  assert.equal(await frame.locator('img').count(),0);
  assert.ok(await frame.getByText('DEMO-INVOICE-01.pdf').isVisible());
  assert.equal(await frame.locator('a.jd-action').count(),0);

  await page.getByLabel('بادئة الموضوع').fill('حسابات');
  await page.getByLabel('التوقيع الإضافي بهذه اللغة').fill('فريق الفوترة');
  await page.getByRole('button',{name:'حفظ النصوص'}).click();
  await frame.getByText('فريق الفوترة').waitFor();
  await page.getByRole('button',{name:'HTML',exact:true}).click();
  assert.match(await page.locator('pre').innerText(),/jouw-driver-logo-v2\.png/);
  await page.getByRole('button',{name:'نص عادي',exact:true}).click();
  assert.match(await page.locator('pre').innerText(),/DEMO-INVOICE-01.pdf/);

  await page.getByLabel('عنوان اختبار معتمد').fill('admin@example.invalid');
  await page.getByRole('button',{name:'إرسال رسالة اختبار'}).click();
  await page.getByText(/قَبِل مزوّد البريد الرسالة/).waitFor();
  await page.getByRole('button',{name:'تحقق من الإرسال'}).click();
  await page.getByText('أكّد مزوّد البريد التسليم.').waitFor();
  assert.equal(events.length,2);
  assert.equal(events[0].requestId,events[1].requestId);

  await page.getByRole('button',{name:'معاينة',exact:true}).click();
  const out=process.env.EMAIL_QA_DIR;
  if(out) {await mkdir(out,{recursive:true});await page.screenshot({path:out+'/invoice-desktop-ar.png',fullPage:true});}
  await page.setViewportSize({width:360,height:820});
  await page.emulateMedia({colorScheme:'dark'});
  await page.getByRole('button',{name:'هاتف',exact:true}).click();
  const check=await frame.locator('body').evaluate(body=>({width:body.scrollWidth,viewport:innerWidth,dark:matchMedia('(prefers-color-scheme: dark)').matches}));
  assert.ok(check.width<=check.viewport&&check.dark);
  await page.getByLabel('لغة الرسالة').selectOption('en');
  await frame.getByRole('heading',{name:'Invoice',exact:true}).waitFor();
  assert.equal(await frame.locator('html').getAttribute('dir'),'ltr');
  for(const [id,name] of [['contract-invitation','Invitation to review and sign your contract'],['reset-password','Reset your password'],['driver-report','Driver statement']]) {
    await page.getByLabel('نوع الرسالة').selectOption(id);
    await frame.getByRole('heading',{name,exact:true}).waitFor();
  }
  assert.ok(await frame.getByText('DEMO-DRIVER-REPORT.pdf').isVisible());
  if(out)await page.screenshot({path:out+'/driver-report-mobile-en.png',fullPage:true});
  console.log('Email admin browser checks passed: RTL invoice, logo, four sample flows, HTML/text, save, idempotent test status, and 360px dark layout.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
