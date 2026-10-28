'use client';
import {Suspense,useEffect,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {api} from '@/lib/api-client';
import {useLanguage} from '@/contexts/LanguageContext';
import {useDriverReceipt,useDriverShift} from '@/components/driver/DriverShiftContext';
import {ExperienceFrame,ReceiptPrinter,experienceWords} from '@/components/driver/DriverExperience';
import ReceiptEmailDialog from '@/components/driver/ReceiptEmailDialog';
import {receiptEmailWords,type IssuedReceipt} from '@/lib/receipt-email-model';
export default function ReceiptPage(){return <Suspense fallback={<p role="status">JOUW DRIVER…</p>}><ReceiptWorkspace/></Suspense>;}
function ReceiptWorkspace(){const id=useSearchParams().get("id"),shift=useDriverShift(),rememberReceipt=useDriverReceipt()?.remember;const {language}=useLanguage(),t=experienceWords[language];const [receipt,setReceipt]=useState<IssuedReceipt|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[email,setEmail]=useState(false);
 useEffect(()=>{let active=true;if(!id){setReceipt(null);setLoading(false);return;}setLoading(true);setError('');setReceipt(null);void api.get<IssuedReceipt>('/trips/receipt?id='+encodeURIComponent(id)).then(r=>{if(active){setReceipt(r);rememberReceipt?.(r.trip_id);}}).catch(()=>{if(active)setError(t.empty);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id,t.empty,rememberReceipt]);
 return <ExperienceFrame screen="receipt" on={!!shift}><main className="jd-panel jd-receipt-panel"><h1>{t.receipt}</h1>{loading?<p className="jd-loading" role="status">{receiptEmailWords[language].loading}</p>:receipt?<><ReceiptPrinter receipt={receipt}/><div className="jd-actions jd-receipt-actions"><a className="jd-btn jd-gold" href={receipt.pdfUrl} target="_blank" rel="noreferrer">↓ {t.download}</a><Link className="jd-btn jd-secondary" href="/driver/trips">{t.close}</Link></div><button className="jd-btn jd-secondary w-full mt-3" onClick={()=>setEmail(true)}>{receiptEmailWords[language].send}</button></>:<p className="jd-sub" role="status">{error||t.empty}</p>}</main>{email&&receipt&&<ReceiptEmailDialog tripId={receipt.trip_id} onClose={()=>setEmail(false)}/>}</ExperienceFrame>;
}
