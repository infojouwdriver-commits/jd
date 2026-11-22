'use client';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState} from 'react';
import {api} from '@/lib/api-client';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {CheckCircle2,Clock,RefreshCw,ShieldCheck,XCircle} from 'lucide-react';
interface Request {company_id:number;subscription_offer?:string;request_id:string;status:'pending'|'approved'|'rejected';company_name:string;company_email:string;company_phone:string;company_address:string;vat_number:string;kbo_number:string;driver_name:string;driver_phone:string;driver_license:string;bestuurderspas:string;bestuurderspas_unverified:boolean;vehicle_brand:string;vehicle_model:string;plate_number:string;vin:string;language:string;test_configured:boolean;production_configured:boolean;submitted_at:string;review_notes?:string}
const statusText={pending:'بانتظار الموافقة',approved:'موافق عليه',rejected:'مرفوض'};
const serviceStates:Record<string,string>={
  active:'الخدمة مفعّلة.',
  company_inactive:'الشركة غير نشطة في لوحة الإدارة.',
  contract_missing:'لا يوجد عقد مربوط بطلب التسجيل.',
  awaiting_signature:'بانتظار توقيع صاحب الشركة على العقد.',
  billing_conflict:'العقد أو جدول الأقساط يحتاج مراجعة من الإدارة.',
  invoice_prepared:'فاتورة الشهر الأول جاهزة للإصدار.',
  awaiting_payment:'فاتورة الشهر الأول صادرة وبانتظار السداد.',
  invoice_blocked:'تعذّر تحضير فاتورة الشهر الأول. راجع بيانات جهة الإصدار وتاريخ الاستحقاق.',
};

function CompanyServiceActions({registration}:{registration:Request}){
  const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
  async function check(){
    setBusy(true);
    try{
      const result=await api.post<{status:string}>('/company-registrations/service',{
        registrationId:registration.request_id,requestId:crypto.randomUUID(),
      });
      setStatus(serviceStates[result.status]??'تعذّر تحديد حالة الخدمة.');
    }catch{setStatus('تعذّر التحقق من جاهزية الخدمة.');}
    finally{setBusy(false);}
  }
  return <div className="space-y-3 border-t pt-3">
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" disabled={busy} onClick={()=>void check()}>{busy?'جارٍ التحقق…':'تحقق من الخدمة وحضّر الفاتورة الأولى'}</Button>
      <Link className="text-sm underline" href={`/admin/companies/${registration.company_id}/contracts`}>العقد</Link>
      <Link className="text-sm underline" href={`/admin/invoices?view=subscription&company=${registration.company_id}`}>فواتير الاشتراك</Link>
      <Link className="text-sm underline" href={`/admin/test-trips?company=${registration.company_id}`}>اختبار Chiron وملف البلدية</Link>
    </div>
    {status&&<p role="status" className="text-sm">{status}</p>}
  </div>;
}

export default function CompanyRegistrationApprovals({requestId}:{requestId?:string}={}){
 const [status,setStatus]=useState('pending'),[rows,setRows]=useState<Request[]>([]),[total,setTotal]=useState(0),[next,setNext]=useState<number|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[selected,setSelected]=useState<Request|null>(null),[action,setAction]=useState<'approve'|'reject'>('approve'),[notes,setNotes]=useState(''),[reviewing,setReviewing]=useState(false),[reviewError,setReviewError]=useState('');const generation=useRef(0),flight=useRef(false),reviewFlight=useRef(false),cancel=useRef<HTMLButtonElement>(null);
 const load=useCallback(async(offset=0)=>{if(flight.current&&offset)return;const epoch=++generation.current;flight.current=true;setLoading(true);setError('');if(!offset)setRows([]);try{const result=await api.get<{requests:Request[];total:number;next_offset:number|null}>(`/company-registrations?status=${requestId?'all':status}&offset=${offset}${requestId?'&request_id='+requestId:''}`);if(epoch!==generation.current)return;setRows(old=>offset?[...old,...result.requests]:result.requests);setTotal(result.total);setNext(result.next_offset);}catch{if(epoch===generation.current)setError('تعذّر تحميل طلبات الشركات. أعد المحاولة.');}finally{if(epoch===generation.current){flight.current=false;setLoading(false);}}},[status,requestId]);
 useEffect(()=>{void load();const epoch=generation.current;return()=>{generation.current=epoch+1;flight.current=false;};},[load]);
 async function review(){if(!selected||reviewFlight.current||action==='reject'&&!notes.trim())return;reviewFlight.current=true;setReviewing(true);setReviewError('');try{const result=await api.put<{status:string}>('/company-registrations',{request_id:selected.request_id,action,notes:notes.trim()});if(result.status!==(action==='approve'?'approved':'rejected'))throw Error();setSelected(null);setNotes('');void load();}catch{setReviewError('تعذّر إتمام القرار. قد يكون الطلب تغيّر؛ أغلق النافذة وحدّث القائمة قبل المحاولة.');}finally{reviewFlight.current=false;setReviewing(false);}}
 const details=(fields:[string,string][])=>fields.map(([label,value])=><div key={label} className="flex flex-wrap justify-between gap-2 border-b py-2 text-sm"><dt className="text-muted-foreground">{label}</dt><dd dir={/[A-Za-z0-9]/.test(value)&&!/[\u0600-\u06ff]/.test(value)?"ltr":"auto"} className="break-all font-medium">{value||'—'}</dd></div>);
 return <section dir="rtl" className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">تسجيل الشركات الجديدة</h2><p className="text-sm text-muted-foreground">الشركة والمركبة وحسابا الشركة والسائق تبقى غير مفعّلة حتى الموافقة.</p></div><Button variant="outline" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> تحديث طلبات الشركات</Button></div>{!requestId&&<div className="flex flex-wrap gap-2" role="group" aria-label="حالة طلبات الشركات">{(['pending','approved','rejected','all'] as const).map(s=><Button key={s} variant={status===s?'default':'outline'} aria-pressed={status===s} onClick={()=>setStatus(s)}>{s==='all'?'الكل':statusText[s]}</Button>)}</div>}<p aria-live="polite" className="text-sm">{loading?'جارٍ تحميل طلبات الشركات…':`${rows.length} من ${total} طلب`}</p>{error&&<div role="alert" className="rounded-lg border border-destructive p-4">{error}<Button variant="outline" onClick={()=>void load()}>إعادة التحميل</Button></div>}{!loading&&!error&&!rows.length&&<Card className="p-8 text-center">لا توجد طلبات شركات بهذه الحالة.</Card>}{rows.map(r=><Card key={r.request_id} className="space-y-5 p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-lg font-semibold">{r.company_name}</h3><p className="text-sm text-muted-foreground"><bdi dir="ltr">{r.company_email}</bdi> · {new Intl.DateTimeFormat('ar-BE',{timeZone:'Europe/Brussels',dateStyle:'medium',timeStyle:'short'}).format(new Date(r.submitted_at))}</p></div><span className="inline-flex items-center gap-2 text-sm">{r.status==='pending'?<Clock size={17}/>:r.status==='approved'?<CheckCircle2 size={17}/>:<XCircle size={17}/>} {statusText[r.status]}</span></div><div className="grid gap-6 md:grid-cols-3"><dl><h4 className="font-semibold">الشركة</h4>{details([['رقم الضريبة',r.vat_number],['KBO / BCE',r.kbo_number],['الهاتف',r.company_phone],['العنوان',r.company_address]])}</dl><dl><h4 className="font-semibold">السائق</h4>{details([['الاسم',r.driver_name],['هاتف الدخول',r.driver_phone],['رخصة القيادة',r.driver_license],['بطاقة السائق',r.bestuurderspas_unverified?'غير موثّقة (12345 مؤقت)':r.bestuurderspas],['اللغة',r.language]])}</dl><dl><h4 className="font-semibold">المركبة</h4>{details([['الماركة والموديل',`${r.vehicle_brand} ${r.vehicle_model}`],['اللوحة',r.plate_number],['VIN',r.vin]])}</dl></div><p className="flex flex-wrap items-center gap-2 text-sm"><ShieldCheck size={17}/> شيرون: اختبار {r.test_configured?'مضاف':'غير مضاف'} · إنتاج {r.production_configured?'مضاف':'يُستكمل لاحقًا'}. المفاتيح لا تُعرض هنا.</p>{r.subscription_offer==='annual-50-v1'&&<p className="rounded-xl border bg-muted p-4 text-sm">عقد سنة · 50€ شهريًا شامل ضريبة 21% · الإجمالي 600€. يُنشأ العقد عند الموافقة، وتبدأ الفوترة بعد توقيع صاحب الشركة.</p>}{r.review_notes&&<p className="rounded-lg bg-muted p-3 text-sm">ملاحظات المراجعة: {r.review_notes}</p>}{r.status==='approved'&&<CompanyServiceActions registration={r}/>} {r.status==='pending'&&<div className="flex flex-wrap gap-3"><Button onClick={()=>{setSelected(r);setAction('approve');setNotes('');setReviewError('');}}>مراجعة تسجيل الشركة</Button><Button variant="outline" onClick={()=>{setSelected(r);setAction('reject');setNotes('');setReviewError('');}}>رفض تسجيل الشركة</Button></div>}</Card>)}{next!==null&&!error&&<Button variant="outline" disabled={loading} onClick={()=>void load(next)}>عرض طلبات أقدم</Button>}
 <Dialog open={!!selected} onOpenChange={v=>{if(!v&&!reviewing)setSelected(null);}}><DialogContent onOpenAutoFocus={e=>{e.preventDefault();cancel.current?.focus();}} dir="rtl" closeLabel="إغلاق المراجعة" closeDisabled={reviewing}><DialogTitle>{action==='approve'?'اعتماد تسجيل الشركة؟':'رفض طلب الشركة؟'}</DialogTitle><DialogDescription>{selected?.company_name} — {action==='approve'?'سيُعتمد تسجيل الشركة وتُفتح الحسابات. تبدأ الخدمة بعد توقيع العقد وسداد فاتورة الشهر الأول، وتبقى Chiron في بيئة الاختبار إلى حين تفعيل الإنتاج.':'ستبقى الشركة والحسابات غير مفعّلة. اكتب سبب الرفض للمراجعة.'}</DialogDescription>{selected?.subscription_offer==='annual-50-v1'&&action==='approve'&&<p className="rounded-xl border p-3 text-sm">ستُنشئ الموافقة عقدًا مدته 12 شهرًا، بقسط شهري 50€ شامل 21% ضريبة، دون تجديد تلقائي. لن يبدأ إعداد الفواتير قبل توقيع صاحب الشركة.</p>}<Label htmlFor="company-review-notes">ملاحظات الإدارة {action==='reject'?'(مطلوبة)':'(اختيارية)'}</Label><Textarea id="company-review-notes" className="resize-none min-h-28" maxLength={1000} disabled={reviewing} value={notes} onChange={e=>setNotes(e.target.value)}/>{reviewError&&<p role="alert" className="text-destructive">{reviewError}</p>}<div className="flex gap-3"><Button ref={cancel} variant="outline" disabled={reviewing} onClick={()=>setSelected(null)}>إلغاء المراجعة</Button><Button variant={action==='reject'?'destructive':'default'} disabled={reviewing||action==='reject'&&!notes.trim()} onClick={()=>void review()}>{reviewing?'جارٍ حفظ القرار…':action==='approve'?'اعتماد التسجيل':'تأكيد رفض الشركة'}</Button></div></DialogContent></Dialog>
 </section>;
}
