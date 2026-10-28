'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {api} from '@/lib/api-client';
import {useLanguage} from '@/contexts/LanguageContext';
import {receiptEmailWords,receiptAdSchema,type ReceiptAd} from '@/lib/receipt-email-model';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
export default function ReceiptEmailSettings(){const {language}=useLanguage(),w=receiptEmailWords[language];const [data,setData]=useState<ReceiptAd|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');const flight=useRef(false);
 const load=useCallback(async()=>{setBusy(true);try{setData(await api.get('/receipt-email-settings'));setNotice('');}catch{setNotice(w.failed);}finally{setBusy(false);}},[w.failed]);
 useEffect(()=>{void load();},[load]);
 async function save(e:React.FormEvent){e.preventDefault();if(flight.current)return;const v=receiptAdSchema.safeParse(data);if(!v.success){setNotice(w.failed);return;}flight.current=true;setBusy(true);try{setData(await api.put('/receipt-email-settings',v.data));setNotice(language==='ar'?'تم حفظ إعلان البريد.':language==='fr'?'Annonce enregistrée.':'Advertentie opgeslagen.');}catch{setNotice(language==='ar'?'تعذّر الحفظ. حدّث الإعدادات ثم أعد المحاولة.':w.failed);}finally{flight.current=false;setBusy(false);}}
 return <div className="mx-auto max-w-2xl space-y-5 p-6"><h1 className="text-2xl font-bold">{w.title}</h1>{!data?<Button disabled={busy} onClick={()=>void load()}>{busy?w.loading:w.retry}</Button>:<form noValidate onSubmit={save} className="space-y-5"><fieldset disabled={busy} className="space-y-5"><div className="flex items-center justify-between gap-3"><Label htmlFor="receipt-ad-enabled">{w.enabled}</Label><Switch id="receipt-ad-enabled" checked={data.enabled} onCheckedChange={enabled=>setData({...data,enabled})}/></div>{(['ar','fr','nl'] as const).map(lang=><div key={lang}><Label htmlFor={'receipt-ad-'+lang}>{w.footer} · {lang.toUpperCase()}</Label><Textarea id={'receipt-ad-'+lang} dir={lang==='ar'?'rtl':'ltr'} maxLength={500} className="min-h-24 resize-none" value={data.text[lang]} onChange={e=>setData({...data,text:{...data.text,[lang]:e.target.value}})}/></div>)}<div><Label htmlFor="receipt-ad-url">{w.link}</Label><Input id="receipt-ad-url" type="url" dir="ltr" value={data.url} onChange={e=>setData({...data,url:e.target.value})}/></div></fieldset><div className="flex gap-3"><Button type="submit" disabled={busy} aria-busy={busy}>{w.save}</Button><Button type="button" variant="outline" disabled={busy} onClick={()=>void load()}>{language==='ar'?'تحديث':language==='fr'?'Actualiser':'Vernieuwen'}</Button></div></form>}{notice&&<p role="status">{notice}</p>}</div>;
}
