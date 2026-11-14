import {resolveEmailLanguage, type EmailDesign} from './renderer.ts';

export type InvoiceMailPurpose = 'subscription_invoice' | 'subscription_credit' | 'subscription_reminder';

const copy = {
  ar:{invoice:'فاتورة',credit:'إشعار دائن',reminder:'تذكير باستحقاق الفاتورة',hello:'مرحباً',reference:'المرجع',amount:'الإجمالي',due:'الاستحقاق',balance:'المبلغ المتبقي',pay:'دفع الفاتورة عبر Stripe',bank:'يمكنك التحويل البنكي باستخدام QR في المرفق. يُؤكَّد التحويل بعد مراجعة كشف الحساب.',once:'اختر طريقة دفع واحدة فقط.',auto:'هذه الفاتورة مرتبطة بتحصيل آلي سابق. لا تدفع مرة أخرى.',paid:'لا يوجد مبلغ متبقٍ للدفع.',note:'إرسال PDF لا يثبت التبادل المنظم عبر Peppol.'},
  fr:{invoice:'Facture',credit:'Note de crédit',reminder:'Rappel de facture',hello:'Bonjour',reference:'Référence',amount:'Total',due:'Échéance',balance:'Solde à payer',pay:'Payer avec Stripe',bank:'Vous pouvez effectuer un virement avec le QR du PDF. Le virement est confirmé après vérification bancaire.',once:'Choisissez une seule méthode de paiement.',auto:'Cette facture relève d’un prélèvement existant. Ne payez pas une seconde fois.',paid:'Aucun solde à payer.',note:'L’envoi du PDF ne prouve pas un échange structuré via Peppol.'},
  nl:{invoice:'Factuur',credit:'Creditnota',reminder:'Factuurherinnering',hello:'Hallo',reference:'Referentie',amount:'Totaal',due:'Vervaldatum',balance:'Openstaand bedrag',pay:'Betalen met Stripe',bank:'U kunt het QR in de PDF gebruiken voor een overschrijving. De overschrijving wordt na bankcontrole bevestigd.',once:'Kies één betaalwijze.',auto:'Deze factuur valt onder een bestaande automatische inning. Betaal niet opnieuw.',paid:'Geen openstaand bedrag.',note:'Het versturen van de PDF bewijst geen gestructureerde uitwisseling via Peppol.'},
  en:{invoice:'Invoice',credit:'Credit note',reminder:'Invoice reminder',hello:'Hello',reference:'Reference',amount:'Total',due:'Due date',balance:'Balance due',pay:'Pay with Stripe',bank:'You can use the QR code in the PDF to make a bank transfer. We confirm the transfer after checking the bank statement.',once:'Use one payment method only.',auto:'This invoice is covered by an existing direct debit. Do not pay it again.',paid:'There is no outstanding balance.',note:'Sending a PDF does not establish a structured Peppol exchange.'},
};

export interface InvoiceEmailData {
  language?: string;
  name: string;
  reference: string;
  credit: boolean;
  due?: string | null;
  currency: string;
  total: number;
  balance: number;
  legacyCollection: boolean;
  bankQr: boolean;
  paymentUrl?: string | null;
  filename: string;
}

export function invoiceDesign(data: InvoiceEmailData, purpose: InvoiceMailPurpose): EmailDesign {
  const language = resolveEmailLanguage(data.language);
  const w = copy[language];
  const id = data.credit ? 'credit-note' : purpose === 'subscription_reminder' ? 'invoice-reminder' : 'invoice';
  const title = id === 'credit-note' ? w.credit : id === 'invoice-reminder' ? w.reminder : w.invoice;
  const balanceDue = !data.credit && data.balance > 0;
  const action = balanceDue && !data.legacyCollection && data.paymentUrl ? {label:w.pay, url:data.paymentUrl} : undefined;
  const money = new Intl.NumberFormat(language + '-BE', {style:'currency', currency:data.currency});
  const fields = [{label:w.reference, value:data.reference, ltr:true}, {label:w.amount, value:money.format(data.total / 100), ltr:true}];
  if (!data.credit && data.due) fields.push({label:w.due, value:data.due, ltr:true});
  if (!data.credit) fields.push({label:w.balance, value:money.format(data.balance / 100), ltr:true});
  const note = [!data.credit && (!balanceDue ? w.paid : data.legacyCollection ? w.auto : data.bankQr ? w.bank : ''),
    action && data.bankQr && w.once, w.note].filter(Boolean).join('\n');
  return {
    id, language, title, subject:`JOUW DRIVER — ${title} ${data.reference}`,
    intro:data.name ? `${w.hello} ${data.name},` : `${w.hello},`,
    fields, action, note, filenames:[data.filename],
  };
}
