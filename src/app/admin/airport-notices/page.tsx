'use client';

import {useEffect,useState,type FormEvent} from 'react';
import {api} from '@/lib/api-client';
import type {AirportNotice} from '../../../../driver-app/src/road-alerts';

const airportEndpoint = '/admin/airport-notices';
const kinds = {meeting_changed:'تغيير نقطة الالتقاء',taxi_entrance_closed:'إغلاق مدخل موقف التاكسي'};
export default function AirportNotices() {
 const [rows,setRows] = useState<AirportNotice[]>([]);
 const [kind,setKind] = useState<AirportNotice['kind']>('meeting_changed');
 const [detail,setDetail] = useState('');
 const [minutes,setMinutes] = useState(60);
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState(false);
 async function refresh() {setRows(await api.get<AirportNotice[]>(airportEndpoint));}
 useEffect(()=>{void refresh().catch(()=>setError(true));},[]);
 async function update(command: object) {
  if(busy) return false;
  setBusy(true);setError(false);
  try {await api.post(airportEndpoint,command);await refresh();return true;}
  catch {setError(true);return false;}
  finally {setBusy(false);}
 }
 async function publish(event:FormEvent) {
  event.preventDefault();
  if(await update({action:'publish',kind,detail,minutes})) setDetail('');
 }
 return <main dir="rtl" className="mx-auto max-w-3xl p-6 space-y-6">
  <h1 className="text-2xl font-bold">تنبيهات مطار بروكسل</h1>
  <p>تظهر التنبيهات على خريطة الرحلة للسائقين القريبين من مطار زافنتم.</p>
  <form onSubmit={publish} className="grid gap-4 rounded-xl border p-4">
   <label className="grid gap-1">نوع التنبيه<select className="rounded border bg-background p-2" value={kind} onChange={event=>setKind(event.target.value as AirportNotice['kind'])}>
    <option value="meeting_changed">{kinds.meeting_changed}</option><option value="taxi_entrance_closed">{kinds.taxi_entrance_closed}</option>
   </select></label>
   <label className="grid gap-1">التفاصيل<textarea className="rounded border bg-background p-2" required minLength={3} maxLength={240} value={detail} onChange={event=>setDetail(event.target.value)}/></label>
   <label className="grid gap-1">المدة بالدقائق<input className="rounded border bg-background p-2" required type="number" min={15} max={720} value={minutes} onChange={event=>setMinutes(Number(event.target.value))}/></label>
   <button className="rounded-lg bg-[#e0bd5b] text-[#0b1423] p-3 font-semibold" disabled={busy}>نشر التنبيه</button>
  </form>
  {error&&<p role="alert">تعذّر إكمال العملية. حاول مجددًا.</p>}
  <section className="space-y-3"><h2 className="font-bold">التنبيهات النشطة</h2>
   {!rows.length&&<p>لا توجد تنبيهات نشطة.</p>}
   {rows.map(row=><article key={row.id} className="rounded-xl border p-4 space-y-2"><h3>{kinds[row.kind]}</h3><p>{row.detail}</p><p>{new Intl.DateTimeFormat('ar-BE',{timeZone:'Europe/Brussels',dateStyle:'short',timeStyle:'short'}).format(new Date(row.expires_at))}</p>
    <button className="underline" disabled={busy} onClick={()=>void update({action:'end',id:row.id})}>إنهاء التنبيه</button>
   </article>)}
  </section>
 </main>;
}
