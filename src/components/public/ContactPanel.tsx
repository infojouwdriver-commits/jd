'use client';
import {useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {contactCopy,contactSubmission,contactTopics,supportEmail,supportPhone,supportPhoneLabel,supportWhatsApp} from '@/lib/public-contact';
import type {EmailLanguage} from '@/lib/email/renderer';

const control='block w-full rounded-lg border border-slate-500 bg-[#101e34] px-3 py-2.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6c17e]';
const direct='group block rounded-lg border border-slate-600 px-4 py-3 transition-colors hover:border-[#e6c17e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6c17e]';

export default function ContactPanel({locale,policy}:{locale:EmailLanguage;policy:string}) {
  const t=contactCopy[locale];
  const [state,setState]=useState<'sending'|'success'|'invalid'|'limited'|'failure'|null>(null);
  const flight=useRef(false);
  const retry=useRef<{id:string;body:string}|null>(null);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(flight.current)return;
    const form=event.currentTarget;
    const data={...Object.fromEntries(new FormData(form)),language:locale};
    const body=JSON.stringify(data);
    const requestId=retry.current?.body===body?retry.current.id:crypto.randomUUID();
    const parsed=contactSubmission.safeParse({...data,requestId});
    if(!parsed.success){setState('invalid');return;}
    retry.current={id:requestId,body};
    flight.current=true;
    setState('sending');
    try {
      const response=await fetch('/contact/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed.data),signal:AbortSignal.timeout(20000)});
      if(!response.ok){setState(response.status===429?'limited':response.status===400?'invalid':'failure');return;}
      retry.current=null;
      form.reset();
      setState('success');
    } catch {setState('failure');}
    finally {flight.current=false;}
  }
  return <div lang={locale} className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]">
    <section className="space-y-3 rounded-2xl border border-slate-700 bg-[#142943] p-5 sm:p-6">
      <h2 className="mb-4 text-xl font-semibold text-[#e6c17e]">{t.direct}</h2>
      <a className={direct} href={'mailto:'+supportEmail}><span className="block text-sm text-slate-300">{t.email}</span><bdi dir="ltr" className="break-all font-semibold">{supportEmail}</bdi></a>
      <a className={direct} href={'tel:'+supportPhone}><span className="block text-sm text-slate-300">{t.phone}</span><bdi dir="ltr" className="font-semibold">{supportPhoneLabel}</bdi></a>
      <a className={direct} href={supportWhatsApp} target="_blank" rel="noopener noreferrer"><span className="font-semibold">WhatsApp</span><span aria-hidden="true" className="ms-2 text-[#e6c17e]">↗</span></a>
    </section>
    <section className="rounded-2xl border border-slate-700 bg-[#142943] p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-semibold">{t.form}</h2>
      <form onSubmit={submit} className="space-y-4" aria-busy={state==='sending'}>
        <fieldset disabled={state==='sending'} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm"><span>{t.name}</span><input name="name" autoComplete="name" required maxLength={100} dir="auto" className={control}/></label>
            <label className="space-y-2 text-sm"><span>{t.email}</span><input name="email" type="email" autoComplete="email" required maxLength={254} dir="ltr" className={control}/></label>
          </div>
          <div className="space-y-2 text-sm"><label htmlFor="contact-topic">{t.topic}</label><select id="contact-topic" name="topic" required className={control}>{contactTopics.map(topic=><option key={topic} value={topic}>{t.topics[topic]}</option>)}</select></div>
          <label className="block space-y-2 text-sm"><span>{t.message}</span><textarea name="message" required minLength={10} maxLength={2000} rows={5} dir="auto" aria-describedby="contact-note" className={control+' min-h-32 resize-y'}/></label>
          <div hidden><label>Website <input name="website" tabIndex={-1} autoComplete="off"/></label></div>
          <p id="contact-note" className="text-sm text-slate-300">{t.note} <Link href="/privacy-policy" className="text-[#e6c17e] underline">{policy}</Link></p>
          <button className="rounded-lg bg-[#e6c17e] px-5 py-3 font-semibold text-[#101e34] hover:bg-[#f0d29c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6c17e] disabled:opacity-60" type="submit">{state==='sending'?t.sending:t.send}</button>
        </fieldset>
        <p role="status" className={state==='success'?'text-emerald-200':'text-amber-200'}>{state&&state!=='sending'?t[state]:''}</p>
      </form>
    </section>
  </div>;
}
