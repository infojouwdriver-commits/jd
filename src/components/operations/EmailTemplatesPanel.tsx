'use client';

import {useEffect,useRef,useState} from 'react';
import {Mail,Monitor,Smartphone} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {api} from '@/lib/api-client';
import {emailLanguages,isEditableTemplate,type EmailLanguage,type TemplateId} from '@/lib/email/renderer';
import type {EmailSettings} from '@/lib/email/settings-model';

type Template = {id:TemplateId;title:string;subject:string;html:string;preview:string;text:string;previewOnly:boolean};
type Preview = EmailSettings & {templates:Template[];designVersion:string};
const languageLabels = {ar:'العربية',fr:'Français',nl:'Nederlands',en:'English'};
const inputStyle = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm';
const cardStyle = 'space-y-4 rounded-xl border bg-card p-4 sm:p-5';

export default function EmailTemplatesPanel() {
  const [language,setLanguage]=useState<EmailLanguage>('ar');
  const [id,setId]=useState<TemplateId>('invoice');
  const [data,setData]=useState<Preview|null>(null);
  const [view,setView]=useState<'preview'|'html'|'text'>('preview');
  const [viewport,setViewport]=useState<'phone'|'desktop'>('desktop');
  const [address,setAddress]=useState('');
  const [busy,setBusy]=useState<'save'|'send'|null>(null);
  const [loading,setLoading]=useState(true);
  const [notice,setNotice]=useState('');
  const [loadVersion,reload]=useState(0);
  const flight=useRef(false);
  const test=useRef<{key:string;id:string}|null>(null);

  useEffect(()=>{
    let active=true;
    api.get<Preview>('/email-templates?language='+language).then(result=>{
      if(active)setData(result);
    }).catch(()=>{
      if(active)setNotice('تعذّر تحميل القوالب. تحقق من صلاحية الإدارة أو أعد المحاولة.');
    }).finally(()=>{
      if(active)setLoading(false);
    });
    return ()=>{active=false;};
  },[language,loadVersion]);

  const current=data?.templates.find(t=>t.id===id);
  const editKey=isEditableTemplate(id) ? id as keyof EmailSettings['settings']['templates'] : null;
  const currentEdit=editKey && data?.settings.templates[editKey] || {subject:'',intro:''};

  function edit(field:'subject'|'intro',value:string) {
    if(!editKey) return;
    setData(previous=>previous && {...previous,settings:{...previous.settings,templates:{
      ...previous.settings.templates,[editKey]:{...currentEdit,[field]:value},
    }}});
  }

  async function save(event:React.FormEvent) {
    event.preventDefault();
    if(!data||flight.current)return;
    flight.current=true;
    setBusy('save');
    setNotice('');
    try {
      await api.put('/email-templates',{language,version:data.version,settings:data.settings});
      setLoading(true);
      reload(value=>value+1);
      setNotice('حُفظت النصوص المحددة لهذه اللغة.');
    } catch {
      setNotice('تعذّر الحفظ. تحقّق من النصوص أو أعد تحميل أحدث نسخة عند حدوث تعديل متزامن.');
    } finally {
      flight.current=false;
      setBusy(null);
    }
  }

  async function send(event:React.FormEvent) {
    event.preventDefault();
    if(flight.current)return;
    flight.current=true;
    setBusy('send');
    setNotice('');
    const to=address.trim().toLowerCase(),key=JSON.stringify({to,language,id});
    const requestId=test.current?.key===key?test.current.id:crypto.randomUUID();
    test.current={key,id:requestId};
    try {
      const response=await api.post<{accepted:boolean;status:string}>('/email-templates',{to,language,id,requestId});
      setNotice(response.status==='delivered'?'أكّد مزوّد البريد التسليم.':response.accepted?'قَبِل مزوّد البريد الرسالة. يمكنك إعادة التحقق من حالة الطلب نفسه.':
        response.status==='uncertain'||response.status==='sending'?'الإرسال قيد التحقق. أعد التحقق باستخدام الطلب نفسه.':
        'تعذّر الإرسال ('+response.status+').');
    } catch {
      setNotice('تعذّر طلب الاختبار. استخدم عنوان حساب الإدارة أو عنوان اختبار معتمداً.');
    } finally {
      flight.current=false;
      setBusy(null);
    }
  }

  return <section dir="rtl" className="mx-auto max-w-7xl space-y-6 pb-8">
    <header className="flex items-center gap-4 rounded-xl border-t-4 border-[#D7AC60] bg-[#101D34] p-5 text-white sm:p-7">
      <div className="rounded-lg bg-[#14243F] p-3 text-[#D7AC60]"><Mail aria-hidden="true"/></div>
      <div><h1 className="text-2xl font-bold">قوالب البريد</h1><p className="mt-1 text-sm text-[#F2F4F8]">معاينة الرسائل وإدارة النصوص الرسمية لـ JOUW DRIVER</p></div>
    </header>
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(240px,310px)_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4">
        <div className={cardStyle}>
          <div className="space-y-2">
            <Label htmlFor="email-template-language">لغة الرسالة</Label>
            <select id="email-template-language" className={inputStyle} value={language} disabled={!!busy} onChange={event=>{
              setNotice('');setLoading(true);setData(null);setLanguage(event.target.value as EmailLanguage);
            }}>
              {emailLanguages.map(item=><option key={item} value={item}>{languageLabels[item]}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-template-type">نوع الرسالة</Label>
            <select id="email-template-type" className={inputStyle} value={id} disabled={loading||!!busy} onChange={event=>setId(event.target.value as TemplateId)}>
              {data?.templates.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </div>
          {data&&<div className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
            <p>إصدار التصميم <bdi>{data.designVersion}</bdi> · نسخة النصوص {data.version}</p>
            <p>آخر تعديل {data.updated_at ? new Intl.DateTimeFormat('ar-BE',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Brussels'}).format(new Date(data.updated_at)) : 'الإصدار الأصلي'}</p>
          </div>}
          <Button type="button" variant="outline" disabled={loading||!!busy} onClick={()=>{setLoading(true);setNotice('');reload(value=>value+1);}}>إعادة التحميل</Button>
        </div>
        {current&&data&&<form className={cardStyle} onSubmit={save}>
          <h2 className="font-semibold">إعدادات النصوص</h2>
          {editKey&&<>
            <div className="space-y-2"><Label htmlFor="email-template-subject">بادئة الموضوع</Label>
              <Input id="email-template-subject" value={currentEdit.subject} maxLength={80} onChange={event=>edit('subject',event.target.value)} dir="auto"/>
            </div>
            <div className="space-y-2"><Label htmlFor="email-template-intro">النص الافتتاحي</Label>
              <Textarea id="email-template-intro" value={currentEdit.intro} maxLength={500} onChange={event=>edit('intro',event.target.value)} dir="auto"/>
            </div>
          </>}
          <div className="space-y-2"><Label htmlFor="email-template-signature">التوقيع الإضافي بهذه اللغة</Label>
            <Textarea id="email-template-signature" value={data.settings.signature} maxLength={500} dir="auto" onChange={event=>{
              const signature=event.target.value;
              setData(previous=>previous&&({...previous,settings:{...previous.settings,signature}}));
            }}/>
            <p className="text-xs text-muted-foreground">يظهر التوقيع الإضافي في رسائل الفواتير والإيصالات. رسائل الحساب والعقد تستخدم توقيع JOUW DRIVER الأساسي.</p>
          </div>
          <Button disabled={!!busy||loading} type="submit">حفظ النصوص</Button>
        </form>}
        {current&&<form className={cardStyle} onSubmit={send}>
          <h2 className="font-semibold">إرسال اختبار</h2>
          <div className="space-y-2"><Label htmlFor="email-template-test">عنوان اختبار معتمد</Label>
            <Input id="email-template-test" type="email" autoComplete="email" dir="ltr" required value={address} maxLength={254} onChange={event=>setAddress(event.target.value)}/>
          </div>
          <Button type="submit" disabled={!!busy||loading}>{test.current?.key===JSON.stringify({to:address.trim().toLowerCase(),language,id})?'تحقق من الإرسال':'إرسال رسالة اختبار'}</Button>
        </form>}
        {notice&&<p className="rounded-lg border bg-card p-3 text-sm" role="status">{notice}</p>}
      </aside>
      <div className={cardStyle} aria-busy={loading}>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="طريقة عرض الرسالة">
          <Button type="button" variant={view==='preview'?'default':'outline'} onClick={()=>setView('preview')}>معاينة</Button>
          <Button type="button" variant={view==='html'?'default':'outline'} onClick={()=>setView('html')}>HTML</Button>
          <Button type="button" variant={view==='text'?'default':'outline'} onClick={()=>setView('text')}>نص عادي</Button>
          {view==='preview'&&<div className="ms-auto flex gap-2" role="group" aria-label="عرض الشاشة">
            <Button type="button" aria-label="هاتف" aria-pressed={viewport==='phone'} variant="outline" size="icon" onClick={()=>setViewport('phone')}><Smartphone/></Button>
            <Button type="button" aria-label="كمبيوتر" aria-pressed={viewport==='desktop'} variant="outline" size="icon" onClick={()=>setViewport('desktop')}><Monitor/></Button>
          </div>}
        </div>
        {loading ? <p className="text-sm text-muted-foreground">جارٍ تحميل المعاينة…</p> : current&&<>
          <div className="space-y-1 border-b pb-3"><p className="text-sm font-medium"><bdi>{current.subject}</bdi></p>
            {current.previewOnly&&<p className="text-xs text-muted-foreground">معاينة تجريبية لكشف السائق. الإرسال التلقائي غير مفعّل.</p>}
          </div>
          {view==='preview' ? <div className="rounded-lg bg-muted p-1 sm:p-3">
            <iframe sandbox="" title="معاينة رسالة تجريبية" srcDoc={current.preview}
              className="mx-auto block h-[650px] w-full rounded-md border bg-white"
              style={{maxWidth:viewport==='phone'?360:760}}/>
          </div> : <pre className="max-h-[650px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-sm" dir={view==='html'?'ltr':'auto'}>
            {view==='html'?current.html:current.text}
          </pre>}
        </>}
      </div>
    </div>
  </section>;
}
