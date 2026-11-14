import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emailLanguages,templateIds,renderEmail,safeEmailUrl,emailBrand} from '../src/lib/email/renderer.ts';
import {emailSampleDesign} from '../src/lib/email/samples.ts';
import {invoiceDesign} from '../src/lib/email/invoice.ts';
import {emailEdits} from '../src/lib/email/settings.ts';
import {saveEmailSettingsSchema,testRecipientAllowed} from '../src/lib/email/settings-model.ts';
import {memberEndpoint,publicEndpoint} from '../src/lib/security-policy.ts';

for (const language of emailLanguages) test(`all email samples render in ${language} as branded HTML and plain text`,()=>{
  for (const id of templateIds) {
    const result=renderEmail(emailSampleDesign(id,language),{}, {sample:true});
    assert.equal(result.design.id,id);
    assert.match(result.html,new RegExp(`<html lang="${language}" dir="${language==='ar'?'rtl':'ltr'}">`));
    assert.ok(result.html.includes(emailBrand.animatedLogo));
    assert.ok(result.html.includes(emailBrand.staticLogo));
    assert.match(result.html,/#101D34/);
    assert.match(result.html,/#D7AC60/);
    assert.doesNotMatch(result.html,/<script|mailto:|pay\/invoice|sign-contract\/email/);
    assert.match(result.text,/JOUW DRIVER/);
    assert.match(result.text,/https:\/\/jouww.com\/contact/);
    assert.doesNotMatch(result.text,/<[a-z]/i);
    assert.match(result.subject,/^\[(?:TEST|اختبار)\]/);
    for (const file of result.design.filenames||[]) assert.ok(result.html.includes(file)&&result.text.includes(file));
  }
});

test('structured content escapes HTML, preserves line breaks and rejects unsafe buttons',()=>{
  const value='<img src=x onerror="test()">', design={...emailSampleDesign('invoice','ar'),intro:value,fields:[{label:value,value}],action:{label:value,url:'javascript:test()'}};
  const result=renderEmail(design,{signature:value+'\nSecond line'});
  assert.doesNotMatch(result.html,/<img src=x|href="javascript:/);
  assert.match(result.html,/&lt;img src=x/);
  assert.match(result.html,/<br>Second line/);
  assert.ok(result.text.includes(value));
  for(const url of ['http://jouww.com','https://user@jouww.com','https://jouww.com\\@example.invalid','https://jouww.com/\n','//jouww.com','data:text/html,test']) assert.equal(safeEmailUrl(url),null);
  assert.equal(safeEmailUrl('https://app.jouww.com/pay/invoice#synthetic.token'),'https://app.jouww.com/pay/invoice#synthetic.token');
});

test('issued invoice email only mentions an existing QR and explains settled and legacy cases',()=>{
  const data={language:'en',name:'Example',reference:'INV-123',credit:false,currency:'EUR',total:5000,balance:5000,legacyCollection:false,bankQr:true,paymentUrl:'https://app.jouww.com/pay/invoice#synthetic',filename:'INV-123.pdf'};
  const render=overrides=>renderEmail(invoiceDesign({...data,...overrides},'subscription_invoice')).text;
  assert.match(render({}),/QR code in the PDF/);
  assert.match(render({}),/Use one payment method only/);
  assert.doesNotMatch(render({bankQr:false}),/QR code|one payment method/);
  assert.doesNotMatch(render({balance:0}),/pay\/invoice|QR code/);
  assert.doesNotMatch(render({legacyCollection:true}),/pay\/invoice|QR code/);
  assert.doesNotMatch(render({credit:true}),/pay\/invoice|QR code/);
});

test('only allowed plain-text edits apply and account safety text is immutable',()=>{
  const settings={signature:'Official <signature>',templates:{invoice:{subject:'Accounts',intro:'Hello again'}}};
  assert.ok(saveEmailSettingsSchema.safeParse({language:'en',version:1,settings}).success);
  assert.ok(!saveEmailSettingsSchema.safeParse({language:'en',version:1,settings:{...settings,templates:{'reset-password':{subject:'Custom',intro:'Custom'}}}}).success);
  const account=emailSampleDesign('reset-password','en');
  const reset=renderEmail(account,emailEdits(account,settings));
  assert.doesNotMatch(reset.text,/Official|Accounts|Hello again/);
  assert.match(reset.text,/3 minutes/);
  const invoice=emailSampleDesign('invoice','en');
  const custom=renderEmail(invoice,emailEdits(invoice,settings));
  assert.match(custom.subject,/^Accounts — JOUW DRIVER/);
  assert.match(custom.html,/Official &lt;signature&gt;/);
});

test('template endpoints are private and send only to administrator or explicitly approved test recipients',()=>{
  for (const method of ['GET','POST','PUT']) {
    assert.equal(publicEndpoint('/next_api/email-templates',method),false);
    for(const type of ['owner','manager','driver','company','distributor']) assert.equal(memberEndpoint('/next_api/email-templates',method,type),false);
  }
  assert.equal(testRecipientAllowed('admin@example.invalid',' ADMIN@EXAMPLE.INVALID '),true);
  assert.equal(testRecipientAllowed('sample@example.invalid','admin@example.invalid','first@example.invalid, SAMPLE@example.invalid'),true);
  assert.equal(testRecipientAllowed('sample@example.invalid','admin@example.invalid','prefix-sample@example.invalid'),false);
});

test('logo assets have the expected mail-safe formats and size',()=>{
  const gif=readFileSync(new URL('../public/email/jouw-driver-logo-v1.gif',import.meta.url));
  const png=readFileSync(new URL('../public/email/jouw-driver-logo-v1.png',import.meta.url));
  assert.equal(gif.subarray(0,6).toString(),'GIF89a');
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.ok(gif.length<60_000&&png.length<20_000);
});
