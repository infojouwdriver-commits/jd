'use client';
import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {useAuth} from '@/components/auth/AuthProvider';
import {api} from '@/lib/api-client';
import ContractDocument from '@/components/contracts/ContractDocument';
import {Button} from '@/components/ui/button';

interface PrintableContract {id:number; company_id:number; contract_number:string; contract_html_template:string; signed_at?:string;}
export default function ContractPrintPage() {
  const {user, isLoading} = useAuth();
  const {id} = useParams<{id:string}>();
  const router = useRouter();
  const [contract, setContract] = useState<PrintableContract | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isLoading) return;
    if (!user) {router.replace(`/login?redirect=${encodeURIComponent('/contract-print/' + id)}`); return;}
    if (!user.isAdmin) {setError('هذه الوثيقة متاحة للإدارة المخوّلة فقط');return;}
    let active = true;
    api.get<PrintableContract[]>(`/contracts?id=${encodeURIComponent(id)}`).then(data => {
      if (!active) return;
      const record = data.find(item => String(item.id) === id);
      if (!record) throw new Error('العقد غير موجود');
      setContract(record);
    }).catch(error => {if (active) setError(error.message);});
    return () => {active=false;};
  }, [id, user, isLoading, router]);
  if (error) return <main role="alert" className="p-8 text-center">{error}</main>;
  if (!contract) return <main className="p-8 text-center">جاري تحميل الوثيقة…</main>;
  return <main className="contract-print-page max-w-4xl mx-auto p-4 bg-white text-slate-900">
    <div className="contract-print-controls flex flex-wrap items-center justify-between gap-3 border-b p-4 mb-4">
      <div><h1 className="font-bold">{contract.contract_number}</h1><p className="text-sm text-slate-600">طباعة الوثيقة / حفظ PDF · Imprimer / Enregistrer en PDF</p></div>
      <div className="flex gap-2"><Link className="p-2 underline" href={`/admin/companies/${contract.company_id}/contracts`}>العودة</Link><Button onClick={() => window.print()}>طباعة / PDF</Button></div>
    </div>
    <ContractDocument html={contract.contract_html_template} />
    {contract.signed_at ? <section className="contract-document signature-summary"><h2>تاريخ التوقيع المحفوظ · Signature enregistrée</h2><p>{new Date(contract.signed_at).toLocaleString('fr-BE',{timeZone:'Europe/Brussels'})}</p><p>تُراجع بيانات الموقّع وإثبات التوقيع من سجل العقد الأصلي.</p></section> : null}
  </main>;
}
