'use client';
import {useCallback,useEffect,useState} from 'react';
import {useLanguage} from '@/contexts/LanguageContext';
import {Button} from '@/components/ui/button';
import ContractDocument from '@/components/contracts/ContractDocument';
import {OperationForm} from '@/components/operations/OperationForm';
import {operationsCopy} from '@/components/operations/operations-copy';
import {ApiError} from '@/lib/api-client';
import {contractSigningCopy,contractSigningLanguage} from '@/lib/contract-signing-copy';
interface ContractReview {
 contract:{id:number;contract_number:string;contract_html_template:string;contract_language:string;monthly_fee:number;annual_fee:number;contract_start_date:string;contract_end_date:string};
 company:{name:string;email:string};signed:boolean;digest:string;confirmation_accepted?:boolean;
 evidence?:{signer_name:string;signer_email:string;signer_position:string;signed_at:string;signature_ip:string;consent:string};
}
export default function SignContractPage(){
 const {language,setLanguage}=useLanguage(),t=contractSigningCopy[language];
 const [invitation,setInvitation]=useState(''),[data,setData]=useState<ContractReview|null>(null),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[sending,setSending]=useState(false);
 const post=useCallback(async(path:string,body:unknown)=>{
  let response:Response;try{response=await fetch('/next_api/contracts/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',credentials:'omit'});}catch{throw new ApiError(0,'Connection failed');}
  const value=await response.json().catch(()=>null);if(!response.ok||!value?.success)throw new ApiError(response.status,'Request failed');return value.data as ContractReview;
 },[]);
 const load=useCallback(async(token:string)=>{
  setLoading(true);setFailed(false);
  try{const result=await post('verify-token',{signature_token:token});setData(result);setLanguage(contractSigningLanguage(result.contract.contract_language));}catch{setFailed(true);}finally{setLoading(false);}
 },[post,setLanguage]);
 // Fragment is never sent to the server in page URLs or Referrer headers. No local storage.
 useEffect(()=>{const token=window.location.hash.slice(1);setInvitation(token);if(token)void load(token);else{setFailed(true);setLoading(false);}},[]); // eslint-disable-line react-hooks/exhaustive-deps
 const sign=async(values:Record<string,string|boolean>)=>{
  const result=await post('sign',{signature_token:invitation,signer_name:values.name,signer_position:values.position,consent:values.consent});setData(result);
 };
 const money=(value:number)=>new Intl.NumberFormat(language==='ar'?'ar-BE':language+'-BE',{style:'currency',currency:'EUR'}).format(Number(value));
 return <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8" dir={language==='ar'?'rtl':'ltr'} lang={language}>
  <style>{`@media print{.email-contract-controls{display:none!important}.email-contract-proof{break-before:page}body{background:white!important;color:black!important}}`}</style>
  <header className="space-y-2"><p className="text-sm font-semibold" dir="ltr">JOUW DRIVER</p><h1 className="text-2xl font-bold">{t.title}</h1></header>
  {loading?<p role="status">{t.loading}</p>:failed||!data?<section className="space-y-4"><p role="alert">{t.invalid}</p>{invitation&&<Button onClick={()=>void load(invitation)}>{t.retry}</Button>}</section>:<>
   <section className="space-y-2 rounded-2xl border bg-card p-5"><h2 className="text-lg font-semibold">{data.company.name}</h2><p className="break-all" dir="ltr">{data.contract.contract_number}</p><p dir="ltr">{data.contract.contract_start_date} — {data.contract.contract_end_date}</p><p>{money(data.contract.monthly_fee)} × 12 = {money(data.contract.annual_fee)}</p><p className="break-all">{t.email}: <bdi>{data.company.email}</bdi></p></section>
   <ContractDocument html={data.contract.contract_html_template}/>
   {data.signed&&data.evidence?<section className="email-contract-proof space-y-3 rounded-2xl border bg-card p-5" aria-label={t.signed}>
    <h2 className="text-lg font-semibold" role="status">{t.saved}</h2><p>{data.evidence.signer_name} · {data.evidence.signer_position}</p><p dir="ltr" className="break-all">{data.evidence.signer_email}</p><p>{t.date}: <bdi>{new Date(data.evidence.signed_at).toLocaleString(language==='ar'?'ar-BE':language+'-BE',{timeZone:'Europe/Brussels'})} (Europe/Brussels)</bdi></p><p dir="ltr">IP: {data.evidence.signature_ip}</p><p>{data.evidence.consent}</p><p className="break-all text-sm">{t.digest}: <bdi>{data.digest}</bdi></p>
    {data.confirmation_accepted!==undefined&&<p className="email-contract-controls" role="status">{t.confirmation} {data.confirmation_accepted?t.accepted:t.pending}</p>}
    {data.confirmation_accepted===false&&<Button className="email-contract-controls" variant="outline" disabled={sending} onClick={async()=>{setSending(true);try{await sign({name:data.evidence!.signer_name,position:data.evidence!.signer_position,consent:true});}catch{setFailed(true);}finally{setSending(false);}}}>{t.retry}</Button>}
   </section>:<section className="email-contract-controls space-y-4 rounded-2xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">{t.privacy} <a className="underline" href="/privacy-policy" target="_blank" rel="noreferrer">{language==='ar'?'الخصوصية':language==='nl'?'Privacy':'Confidentialité'}</a></p>
    <OperationForm inline title={t.title} intentKey={'email-contract:'+data.contract.id} c={{...operationsCopy[language],loading:t.loading,retry:t.retry,failure:t.failure,pending:t.uncertain}} submitLabel={t.sign} fields={[{key:'name',label:t.name,maxLength:160},{key:'position',label:t.position,maxLength:120},{key:'consent',label:t.consent,type:'checkbox',mustBeTrue:true}]} initial={{name:'',position:'',consent:false}} onClose={()=>{}} onSubmit={sign}/>
   </section>}
   <Button variant="outline" className="email-contract-controls" onClick={()=>window.print()}>{t.print}</Button>
  </>}
 </main>;
}
