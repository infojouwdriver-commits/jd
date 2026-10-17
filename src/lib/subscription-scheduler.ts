import {randomUUID} from 'node:crypto';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {sendTransactionalMail,type MailMessage} from './mail-service';
import {subscriptionPdf,euro,type SubscriptionDocument} from './subscription-document';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function subscriptionTick(){
 const client=createPostgrestClient(await generateAdminUserToken());
 const tick=await client.rpc('security_subscription_tick');if(tick.error)throw Error('Subscription scheduler unavailable');
 for(let i=0;i<5;i++){
  const lease=randomUUID(),claimed=await client.rpc('security_claim_subscription_mail',{p_lease:lease});if(claimed.error)throw Error('Subscription queue unavailable');if(!claimed.data)break;
  const job=claimed.data as {id:number;event_key:string;purpose:MailMessage['purpose'];document:SubscriptionDocument;balance_cents:number},d=job.document;
  const language=['ar','nl'].includes(d.recipient.language)?d.recipient.language:'fr';
  const copy={ar:{invoice:'فاتورة الاشتراك',credit:'إشعار دائن',reminder:'تذكير باستحقاق فاتورة الاشتراك',due:'تاريخ الاستحقاق',balance:'المبلغ المتبقي',service:'هذا تذكير فقط. تبقى الخدمة والرحلات متاحة. يرجى التواصل مع إدارة الشركة لترتيب الدفع.'},fr:{invoice:'Facture d’abonnement',credit:'Note de crédit',reminder:'Rappel de facture d’abonnement',due:'Échéance',balance:'Solde restant',service:'Ce message est un rappel. Le service et les trajets restent disponibles. Contactez l’administration pour les modalités de paiement.'},nl:{invoice:'Abonnementsfactuur',credit:'Creditnota',reminder:'Herinnering abonnementsfactuur',due:'Vervaldatum',balance:'Resterend saldo',service:'Dit is een herinnering. De dienst en ritten blijven beschikbaar. Neem contact op met de administratie voor de betalingswijze.'}}[language as 'ar'|'fr'|'nl'];
  const heading=job.purpose==='subscription_reminder'?copy.reminder:d.kind==='credit'?copy.credit:copy.invoice;
  const text=`${heading} ${d.document_number}\n${d.recipient.name}\n${euro(d.gross_cents)}\n${copy.due}: ${d.due_date}\n${copy.balance}: ${euro(job.balance_cents??0)}\n${copy.service}`;
  const result=await sendTransactionalMail({to:d.recipient.email,subject:`JOUW DRIVER — ${heading} ${d.document_number}`,text,html:`<!doctype html><html lang="${language}" dir="${language==='ar'?'rtl':'ltr'}"><head><title>${escape(heading)}</title></head><body style="font-family:Arial,sans-serif;color:#101e33;font-size:16px;line-height:1.7;max-width:600px;margin:24px auto;padding:24px"><p>JOUW DRIVER</p><h1 style="font-size:24px">${escape(heading)}</h1><p>${escape(d.document_number)}</p><p>${escape(d.recipient.name)}</p><p>${escape(euro(d.gross_cents))}</p><p>${escape(copy.due)}: ${escape(d.due_date||'')}</p><p>${escape(copy.balance)}: ${escape(euro(job.balance_cents??0))}</p><p>${escape(copy.service)}</p></body></html>`,purpose:job.purpose,event:'subscription:'+job.event_key,attachments:[{filename:d.document_number+'.pdf',content:subscriptionPdf(d)}]});
  const finished=await client.rpc('security_finish_subscription_mail',{p_id:job.id,p_lease:lease,p_status:result.status});if(finished.error)throw Error('Subscription result unavailable');
 }
}
export function startSubscriptionScheduler(){
 const key=globalThis as typeof globalThis & {jdSubscriptionTimer?:ReturnType<typeof setTimeout>};if(key.jdSubscriptionTimer)return;
 const run=async()=>{try{await subscriptionTick();}catch{console.error('Subscription scheduler temporarily unavailable');}finally{key.jdSubscriptionTimer=setTimeout(run,60000);key.jdSubscriptionTimer.unref();}};
 key.jdSubscriptionTimer=setTimeout(run,15000);key.jdSubscriptionTimer.unref();
}
