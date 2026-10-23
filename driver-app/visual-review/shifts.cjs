const assert=require('node:assert/strict');const path=require('node:path');
exports.fixtures=f=>{
 const id='11111111-1111-4111-8111-111111111111',url='https://app.jouww.com/driver/shifts?id='+id,qr=require('../../node_modules/qrcode').create(url,{errorCorrectionLevel:'M'});
 const reference='DS-'+BigInt('0x'+id.replaceAll('-','')).toString(36).toUpperCase().padStart(25,'0').match(/.{1,5}/g).join('-');
 const document={reference,url,qr:{size:qr.modules.size,modules:Array.from(qr.modules.data)}};
 f.secure+=';export async function deleteItemAsync(key){localStorage.removeItem(key)}';
 f.receipt+=';export async function shareShiftReport(owner,id){globalThis.__shiftPdfCalls??=[];globalThis.__shiftPdfCalls.push({owner,id})}';
 f.api=f.api.replace('export const driverApi={',`const shiftId='11111111-1111-4111-8111-111111111111';
 const baseline={id:shiftId,driver_id:1,company_id:2,vehicle_id:3,driver_name:'Demo Driver',company_name:'JOUW DRIVER · DEMO',plate_number:'DEMO-3',started_at:'2026-10-22T07:00:00Z',ended_at:null,start_odometer:217000,odometer:217000,passenger_km:0,work_status:'available',version:1};
 function current(){const raw=localStorage.getItem('qa-shift');if(raw)return JSON.parse(raw);return new URLSearchParams(location.search).get('shift')==='none'?null:baseline;}
 export const driverApi={
 shifts:async(owner,query={})=>{if(new URLSearchParams(location.search).get('shift')==='error')throw new ApiError(503);const s=current();if(query.id)return {document:${JSON.stringify(document)},shift:s||baseline,events:[{action:'start',version:1,recorded_at:baseline.started_at,odometer:217000,passenger_km:0,work_status:'available'}],activity:[{id:'activity',kind:'trip_end',recorded_at:'2026-10-22T07:15:00Z',occurred_at:'2026-10-22T07:15:00Z',trip_id:701,source:'UBER',work_status:null}],summary:{trip_count:1,activity_count:2,payments:[{currency:'EUR',total:18.4,missing_amounts:0}]}};return {active:s?.ended_at?null:s,shifts:s?[s]:[]};},
 shiftCommand:async(owner,body)=>{globalThis.__shiftCommands??=[];globalThis.__shiftCommands.push(body);const previous=current();const next={...(previous||baseline),id:body.shift_id,version:(previous?.version||0)+1,work_status:body.work_status,ended_at:body.action==='end'?'2026-10-22T08:00:00Z':null,...(body.action==='status'?{}:{odometer:body.odometer,passenger_km:body.passenger_km}),...(body.action==='start'?{start_odometer:body.odometer}:{})};localStorage.setItem('qa-shift',JSON.stringify(next));if(globalThis.__loseShiftReceipt){globalThis.__loseShiftReceipt=false;throw new ApiError(408)}return next;},`);
};
exports.run=async(page,origin,output)=>{
 await page.goto(origin+'/?screen=settings');await page.getByRole('radio',{name:'العربية',exact:true}).click();
 await page.evaluate(()=>{localStorage.removeItem('qa-shift');localStorage.removeItem('jd-shift-intent-1')});
 await page.goto(origin+'/?screen=home&shift=none');await page.getByRole('textbox',{name:'قراءة عداد المركبة (كم)',exact:true}).waitFor();await page.screenshot({path:path.join(output,'shift-start-ar-360.png')});
 assert.equal(await page.getByRole('button',{name:'بدء الرحلة',exact:true}).count(),0,'No trip entry before a shift');
 await page.getByRole('textbox',{name:'قراءة عداد المركبة (كم)',exact:true}).fill('217000,35');await page.getByRole('button',{name:'بدء الوردية',exact:true}).click();await page.getByRole('button',{name:'استراحة',exact:true}).waitFor();
 let sent=await page.evaluate(()=>globalThis.__shiftCommands.at(-1));assert.equal(sent.odometer,217000.35);assert.equal(sent.passenger_km,0);
 await page.evaluate(()=>{globalThis.__loseShiftReceipt=true});await page.getByRole('button',{name:'استراحة',exact:true}).click();await page.getByRole('button',{name:'إعادة تأكيد الطلب',exact:true}).waitFor();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('jd-shift-intent-1')));assert.equal(saved.work_status,'break');assert.equal('odometer' in saved,false);
 await page.reload();await page.getByRole('button',{name:'إعادة تأكيد الطلب',exact:true}).click();await page.getByRole('button',{name:'استئناف العمل',exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>globalThis.__shiftCommands.at(-1)),saved);
 await page.getByRole('button',{name:'استئناف العمل',exact:true}).click();await page.getByRole('button',{name:'استراحة',exact:true}).waitFor();
 await page.getByText('وردية العمل',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'shift-home-ar-360.png')});
 await page.getByRole('button',{name:'كشف الخدمة',exact:true}).click();await page.getByRole('button',{name:'عرض الكشف',exact:true}).click();await page.getByText('نشاط الوردية والرحلات',{exact:true}).waitFor();await page.getByText(/#701 · UBER/).waitFor();await page.getByRole('button',{name:'مشاركة كشف PDF بالهولندية',exact:true}).click();assert.equal(await page.evaluate(()=>globalThis.__shiftPdfCalls.length),1);
 await page.getByRole('button',{name:'تسجيل قراءة',exact:true}).click();await page.getByRole('textbox',{name:'قراءة عداد المركبة (كم)',exact:true}).fill('217010.35');await page.getByRole('textbox',{name:'المسافة التراكمية مع الركاب (كم)',exact:true}).fill('20');await page.getByRole('button',{name:'حفظ القراءة',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await page.evaluate(()=>globalThis.__shiftCommands?.length||0),0,'Invalid readings never reach the API');
 await page.getByRole('textbox',{name:'المسافة التراكمية مع الركاب (كم)',exact:true}).fill('6');await page.getByRole('radio',{name:'قيادة دون راكب',exact:true}).click();await page.getByRole('button',{name:'حفظ القراءة',exact:true}).click();await page.getByText('تم تأكيد تسجيل الوردية.',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>globalThis.__shiftCommands.at(-1).work_status),'driving_empty');await page.getByText('كشف الخدمة',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'shift-sheet-ar-360.png')});await page.getByRole('button',{name:'رابط كشف الوردية',exact:true}).scrollIntoViewIfNeeded();await page.getByRole('button',{name:'رابط كشف الوردية',exact:true}).screenshot({path:path.join(output,'shift-qr-ar.png')});
 await page.goto(origin+'/?screen=home&trip=active');assert.equal(await page.getByRole('button',{name:'استراحة',exact:true}).isEnabled(),false);
 await page.goto(origin+'/?screen=home&shift=error');await page.getByText('تعذّر تحميل الوردية. أعد المحاولة.',{exact:true}).waitFor();
 await page.goto(origin+'/?screen=settings');await page.getByRole('radio',{name:'Nederlands',exact:true}).click();await page.goto(origin+'/?screen=shifts');await page.getByText('Dienststaat',{exact:true}).waitFor();await page.screenshot({path:path.join(output,'shift-sheet-nl-360.png')});
};
