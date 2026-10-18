'use client';
import {useState} from 'react';
import {toast} from 'sonner';
import {useLanguage} from '@/contexts/LanguageContext';
import {api} from '@/lib/api-client';
import {subscriptionOfferCopy} from '@/lib/subscription-offer';
import {Button} from '@/components/ui/button';
import ContractDocument from '@/components/contracts/ContractDocument';
import {OperationForm} from './OperationForm';
import {operationsCopy} from './operations-copy';
import {useOperationData} from './useOperationData';
interface Contract {id:number;contract_number:string;contract_status:string;contract_start_date:string;contract_end_date:string;monthly_fee:number;annual_fee:number;signed_at:string|null;contract_html_template:string;updated_at:string;vat_bps:number|null;}
export default function ContractBillingPanel({companyId,admin,linked,onChanged}:{companyId:number;admin:boolean;linked:boolean;onChanged:()=>void}){
 const {language}=useLanguage(),c=operationsCopy[language],t=subscriptionOfferCopy[language];
 const [offset,setOffset]=useState(0),[target,setTarget]=useState<Contract|null>(null);
 const base=admin?'/contract-billing':'/company-portal/contracts',path=base+'?company_id='+companyId;
 const {data,error,loading,reload}=useOperationData<{rows:Contract[];total:number;can_sign:boolean}>(path+'&offset='+offset+'&limit=10');
 const money=(v:number)=>new Intl.NumberFormat(language==='ar'?'ar-BE':language+'-BE',{style:'currency',currency:'EUR'}).format(Number(v));
 return <section className="space-y-4 rounded-2xl border bg-card p-4" aria-label={t.contracts}>
  <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{t.contracts}</h3><Button variant="outline" disabled={loading} onClick={reload}>{c.refresh}</Button></div>
  {loading&&<p role="status">{c.loading}</p>}{error&&<p role="alert" className="text-destructive">{c.error}</p>}
  {data?.rows.length===0&&<p>{t.empty}</p>}
  {data?.rows.map(k=><article key={k.id} className="space-y-3 rounded-xl border p-4">
   <div className="flex flex-wrap justify-between gap-2"><strong className="break-all" dir="ltr">{k.contract_number}</strong><span>{k.signed_at?t.signed:k.contract_status==='pending_signature'?t.pending:k.contract_status}</span></div>
   <p dir="ltr">{k.contract_start_date} — {k.contract_end_date}</p>
   <p className="font-semibold tabular-nums">{money(k.monthly_fee)} × 12 = {money(k.annual_fee)} {k.vat_bps!=null&&<> · TVA {k.vat_bps/100}%</>}</p>
   <details><summary className="min-h-11 cursor-pointer py-2 font-medium focus-visible:outline focus-visible:outline-2">{t.preview}</summary><div className="max-h-[60vh] overflow-auto rounded-xl border"><ContractDocument html={k.contract_html_template||''}/></div></details>
   {data.can_sign&&!k.signed_at&&k.contract_status==='pending_signature'&&<Button onClick={()=>setTarget(k)}>{t.sign}</Button>}
   {admin&&!linked&&k.signed_at&&k.contract_status==='active'&&<Button variant="outline" onClick={()=>setTarget(k)}>{t.link}</Button>}
  </article>)}
  {data&&data.total>10&&<div className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={loading||offset===0} onClick={()=>setOffset(Math.max(0,offset-10))}>{c.previous}</Button><span>{offset+1}–{Math.min(offset+10,data.total)} / {data.total}</span><Button variant="outline" disabled={loading||offset+10>=data.total} onClick={()=>setOffset(offset+10)}>{c.next}</Button></div>}
  {target&&<OperationForm key={target.id} title={admin?t.link:t.sign} description={target.contract_number} submitLabel={admin?t.link:t.confirm} c={c} intentKey={'contract:'+companyId+':'+target.id+':'+(admin?'link':'sign')} fields={admin?[]:[{key:'name',label:t.signName,maxLength:160},{key:'position',label:t.position,maxLength:120,optional:true},{key:'consent',label:t.consent,type:'checkbox',mustBeTrue:true}]} initial={{name:'',position:'',consent:false}} onClose={()=>setTarget(null)} onSubmit={async(v,request)=>{
   await api.post(path,admin?{action:'link',contract_id:target.id}:{action:'sign',contract_id:target.id,request_id:request,expected:target.updated_at,signer_name:v.name,signer_position:v.position,consent:v.consent});
   toast.success(t.saved);reload();onChanged();
  }}><div className="max-h-[40vh] overflow-auto rounded-xl border"><ContractDocument html={target.contract_html_template||''}/></div><p className="text-sm text-muted-foreground">{t.noIssuer}</p></OperationForm>}
 </section>;
}
