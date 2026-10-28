'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useAuth} from '@/components/auth/AuthProvider';
import {useLanguage} from '@/contexts/LanguageContext';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {api,ApiError} from '@/lib/api-client';
import {receiptEmailWords,receiptSendSchema,type ReceiptLanguage} from '@/lib/receipt-email-model';
interface Draft {subject:string;message:string;language:ReceiptLanguage;settings_version:number;reference:string;}
type Pending=Draft&{to:string;request_id:string};
const pending=new Map<string,Pending>();
export default function ReceiptEmailDialog({tripId,onClose}:{tripId:number;onClose:()=>void}){
 const {language}=useLanguage(),w=receiptEmailWords[language],{user}=useAuth(),key=`${user?.sub}:${tripId}`;
 const retained=pending.get(key);
 const [draft,setDraft]=useState<Draft|null>(retained||null),[to,setTo]=useState(retained?.to||''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(!retained),[notice,setNotice]=useState(''),[sent,setSent]=useState(false),[frozen,setFrozen]=useState<Pending|null>(retained||null),[invalid,setInvalid]=useState('');
 const flight=useRef(false),generation=useRef(0);
 const load=useCallback(async(locale:ReceiptLanguage)=>{const gen=++generation.current;setLoading(true);setNotice('');try{const d=await api.get<Draft>(`/trips/receipt-email?id=${tripId}&language=${locale}`);if(gen===generation.current)setDraft(d);}catch{if(gen===generation.current)setNotice(w.failed);}finally{if(gen===generation.current)setLoading(false);}},[tripId,w.failed]);
 useEffect(()=>{const epoch=generation;if(!pending.has(key))void load(language);return()=>{epoch.current++;};},[key,language,load]);
 async function send(e:React.FormEvent){e.preventDefault();if(flight.current||!draft)return;
 const value=frozen||{...draft,to:to.trim(),request_id:crypto.randomUUID()};
 const parsed=receiptSendSchema.safeParse({request_id:value.request_id,to:value.to,subject:value.subject,message:value.message,language:value.language,settings_version:value.settings_version});
 if(!parsed.success){const field=String(parsed.error.issues[0]?.path[0]||'to');setInvalid(field);setNotice(w.failed);document.getElementById('receipt-email-'+field)?.focus();return;}
 flight.current=true;setBusy(true);setNotice('');setInvalid('');setFrozen(value);pending.set(key,value);
 try{const r=await api.post<{accepted:boolean;status:string}>(`/trips/receipt-email?id=${tripId}`,parsed.data);
 if(r.accepted){pending.delete(key);setFrozen(null);setSent(true);setNotice(w.accepted);}
 else if(['uncertain','sending','record_unavailable'].includes(r.status)){setNotice(w.uncertain);}
 else {pending.delete(key);setFrozen(null);setNotice(w.failed);}
 }catch(e){if(e instanceof ApiError&&e.status>0&&e.status<500){pending.delete(key);setFrozen(null);setNotice(e.status===409?`${w.failed} ${language==='ar'?'أغلق النموذج وافتحه لتحديث الرسالة.':language==='fr'?'Fermez puis rouvrez pour actualiser le message.':'Sluit en open opnieuw om te vernieuwen.'}`:w.failed);}else setNotice(w.uncertain);}
 finally{flight.current=false;setBusy(false);}}
 return <Dialog open onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent closeDisabled={busy} closeLabel={w.cancel} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{w.send}</DialogTitle><DialogDescription>{w.intro}</DialogDescription></DialogHeader>
 {loading&&<p role="status">{w.loading}</p>}
 {!loading&&!draft&&<Button onClick={()=>void load(language)}>{w.retry}</Button>}
 {draft&&<form noValidate onSubmit={send} className="space-y-4" aria-label={w.send}>
 <p className="text-sm font-mono" dir="ltr">{draft.reference} · PDF</p>
 <fieldset disabled={busy||!!frozen||sent||loading} className="space-y-4">
 <div><Label htmlFor="receipt-email-to">{w.to}</Label><Input id="receipt-email-to" type="email" autoComplete="email" value={to} onChange={e=>setTo(e.target.value)} aria-invalid={invalid==='to'} aria-describedby={invalid==='to'?'receipt-email-notice':undefined}/></div>
 <div><Label htmlFor="receipt-email-language">{w.language}</Label><Select value={draft.language} onValueChange={v=>void load(v as ReceiptLanguage)}><SelectTrigger id="receipt-email-language"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ar">العربية</SelectItem><SelectItem value="fr">Français</SelectItem><SelectItem value="nl">Nederlands</SelectItem></SelectContent></Select></div>
 <div><Label htmlFor="receipt-email-subject">{w.subject}</Label><Input id="receipt-email-subject" maxLength={200} value={draft.subject} onChange={e=>setDraft({...draft,subject:e.target.value})} aria-invalid={invalid==='subject'}/></div>
 <div><Label htmlFor="receipt-email-message">{w.message}</Label><Textarea id="receipt-email-message" className="min-h-52 resize-none" maxLength={8000} dir={draft.language==='ar'?'rtl':'ltr'} value={draft.message} onChange={e=>setDraft({...draft,message:e.target.value})} aria-invalid={invalid==='message'}/></div>
 </fieldset><div className="flex gap-2"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>{w.cancel}</Button>{!sent&&<Button type="submit" disabled={busy||loading} aria-busy={busy}>{busy?w.loading:frozen?w.retry:w.send}</Button>}</div>
 </form>}{notice&&<p id="receipt-email-notice" role={sent?'status':'alert'} className="text-sm">{notice}</p>}
 </DialogContent></Dialog>;
}
