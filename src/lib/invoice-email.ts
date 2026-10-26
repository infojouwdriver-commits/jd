import type {createPostgrestClient} from './postgrest';
import {invoiceRpc,type InvoiceSource} from './invoice-checkout';
import {invoicePaymentUrl} from './invoice-payment-link';
import {invoicePaymentState} from './invoice-payment-state';
import {subscriptionPdf,euro,type SubscriptionDocument} from './subscription-document';
import {sendTransactionalMail} from './mail-service';
import {stripeConfiguration} from './stripe-billing-core';
const esc=(s:string)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function sendInvoiceEmail(client:ReturnType<typeof createPostgrestClient>,source:InvoiceSource,documentId:number,actor:number,event:string){
 const d=await invoiceRpc(client,'security_invoice_email_issue',{p_source:source,p_document:documentId,p_actor:actor});
 return deliverInvoiceEmail(client,source,d,event);
}
export async function deliverInvoiceEmail(client:ReturnType<typeof createPostgrestClient>,source:InvoiceSource,d:SubscriptionDocument,event:string,purpose:'subscription_invoice'|'subscription_credit'|'subscription_reminder'='subscription_invoice'){
 if(d.state!=='issued'||d.is_test)throw Error('Issued real document required');
 const state=await invoicePaymentState(client,d,source);
 const lang=['ar','nl'].includes(d.recipient.language)?d.recipient.language as 'ar'|'nl':'fr';
 const w={ar:{title:'فاتورة',pay:'دفع الفاتورة عبر Stripe',bank:'أو التحويل البنكي باستخدام QR في المرفق. اختر طريقة واحدة فقط. التحويل البنكي يتأكد بعد مراجعة كشف الحساب.',due:'الاستحقاق',balance:'المبلغ المتبقي',note:'دفعة واحدة لهذه الفاتورة، دون خصم تلقائي. إرسال PDF لا يثبت التبادل المنظم عبر Peppol.',auto:'هذه الفاتورة مرتبطة بتحصيل آلي سابق. لا تدفع مرة أخرى.',paid:'لا يوجد مبلغ متبقٍ للدفع.'},fr:{title:'Facture',pay:'Payer avec Stripe',bank:'Ou effectuez un virement avec le QR du PDF. Choisissez une seule méthode. Le virement est confirmé après vérification bancaire.',due:'Échéance',balance:'Solde à payer',note:'Paiement unique de cette facture, sans prélèvement automatique. Le PDF ne prouve pas un échange structuré Peppol.',auto:'Cette facture relève d’un prélèvement existant. Ne payez pas une seconde fois.',paid:'Aucun solde à payer.'},nl:{title:'Factuur',pay:'Betalen met Stripe',bank:'Of betaal via overschrijving met de QR in de PDF. Kies één betaalwijze. De overschrijving wordt na bankcontrole bevestigd.',due:'Vervaldatum',balance:'Openstaand bedrag',note:'Eenmalige betaling van deze factuur, zonder automatische afschrijving. Een PDF bewijst geen gestructureerde Peppol-uitwisseling.',auto:'Deze factuur valt onder een bestaande automatische inning. Betaal niet opnieuw.',paid:'Geen openstaand bedrag.'}}[lang];
 let url:string|null=null;
 if(d.kind==='invoice'&&state.balance_cents>0&&state.collection==='bank'){
  const config=stripeConfiguration();url=invoicePaymentUrl(source,d,config.origin,process.env.JWT_SECRET||'');
 }
 const text=`${w.title} ${d.document_number}\n${d.recipient.name}\n${w.due}: ${d.due_date||''}\n${w.balance}: ${euro(state.balance_cents)}\n${url?w.pay+': '+url+'\n'+w.bank:state.collection==='stripe'?w.auto:w.paid}\n${w.note}`;
 const html=`<!doctype html><html lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}"><head><title>${esc(w.title)}</title></head><body style="font-family:Arial,sans-serif;color:#101e33;font-size:16px;line-height:1.7;max-width:600px;margin:24px auto;padding:24px"><p>JOUW DRIVER</p><h1>${esc(w.title)} ${esc(d.document_number)}</h1><p>${esc(d.recipient.name)}</p><p>${esc(w.due)}: ${esc(d.due_date||'')}</p><p>${esc(w.balance)}: <strong>${esc(euro(state.balance_cents))}</strong></p>${url?`<p><a href="${esc(url)}" style="display:inline-block;padding:14px 24px;background:#101e33;color:white;border-radius:8px">${esc(w.pay)}</a></p><p>${esc(w.bank)}</p>`:`<p>${esc(state.collection==='stripe'?w.auto:w.paid)}</p>`}<p style="font-size:13px">${esc(w.note)}</p></body></html>`;
 const doc=source==='manual'?{...d,period_start:d.prepared_date,period_end:d.prepared_date,original_id:null,reason:null,tax_category:d.vat_bps?'S':'E'}:d;
 return sendTransactionalMail({to:d.recipient.email,subject:`JOUW DRIVER — ${w.title} ${d.document_number}`,text,html,purpose,event,attachments:[{filename:d.document_number+'.pdf',content:subscriptionPdf(doc,state)}]});
}
