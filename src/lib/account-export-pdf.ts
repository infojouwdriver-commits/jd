import {jsPDF} from 'jspdf';
import {configurePdfFonts} from '../legal/pdf-fonts.ts';

type Row = Record<string, unknown>;
export const exportCopy = {
 fr: {title:'Relevé de mes données', profile:'Titulaire du compte', trips:'Courses et déclarations Chiron', invoices:'Factures de course et d’abonnement', payments:'Historique des paiements', empty:'Aucun enregistrement disponible.', note:'Ce relevé décrit les données liées à votre compte. Utilisez le centre de confidentialité pour télécharger le JSON ou exercer vos droits RGPD.', fields:['Identifiant','E-mail','Type de compte','Nom complet','Permis','N° BCE / KBO','Véhicule','Plaque','Inscription','Pays de l’entreprise'], details:['Départ','Arrivée','Distance (km)','Montant','Statut','Chiron','Mode de paiement']},
 nl: {title:'Overzicht van mijn gegevens', profile:'Accounthouder', trips:'Ritten en Chiron-aangiften', invoices:'Rit- en abonnementsfacturen', payments:'Betalingsgeschiedenis', empty:'Geen gegevens beschikbaar.', note:'Dit overzicht bevat gegevens die aan uw account gekoppeld zijn. Via het privacycentrum kunt u JSON downloaden of uw AVG-rechten uitoefenen.', fields:['Identificatie','E-mail','Accounttype','Volledige naam','Rijbewijs','KBO-nummer','Voertuig','Nummerplaat','Inschrijving','Land van de onderneming'], details:['Vertrek','Aankomst','Afstand (km)','Bedrag','Status','Chiron','Betaalwijze']},
 ar: {title:'كشف بيانات حسابي', profile:'صاحب الحساب', trips:'الرحلات وتصاريح شيرون', invoices:'فواتير الرحلات والاشتراك', payments:'سجل المدفوعات', empty:'لا توجد سجلات متاحة.', note:'يعرض هذا الكشف بيانات مرتبطة بحسابك. استخدم مركز الخصوصية لتنزيل JSON أو ممارسة حقوقك وفق اللائحة العامة لحماية البيانات.', fields:['معرّف الحساب','البريد الإلكتروني','نوع الحساب','الاسم الكامل','رقم الرخصة','رقم المؤسسة','المركبة','اللوحة','تاريخ التسجيل','بلد الشركة'], details:['الانطلاق','الوصول','المسافة (كم)','المبلغ','الحالة','شيرون','طريقة الدفع']},
} as const;
export type ExportLocale = keyof typeof exportCopy;

export function accountExportPdf(locale: ExportLocale, generated: Date, account: unknown[], trips: Row[], invoices: Row[], payments: Row[]) {
 const copy = exportCopy[locale];
 const doc = new jsPDF({compress:true, putOnlyUsedFonts:true});
 configurePdfFonts(doc);
 const rtl = locale === 'ar';
 const date = new Intl.DateTimeFormat(`${locale}-BE`, {timeZone:'Europe/Brussels',dateStyle:'medium',timeStyle:'medium'});
 const renderDate = (value: unknown) => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return '—';
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : date.format(new Date(value));
 };
 let y = 0;
 const page = () => {
  doc.setFillColor(11,20,35);
  doc.rect(0,0,210,21,'F');
  doc.setFont('helvetica','bold').setFontSize(12).setTextColor(242,211,128);
  doc.text('JOUW DRIVER',16,13);
  doc.text(String(doc.getNumberOfPages()),194,13,{align:'right'});
  y = 33;
 };
 const line = (value: string, size = 10, bold = false) => {
  doc.setFont('helvetica',bold ? 'bold' : 'normal').setFontSize(size).setTextColor(20,34,56);
  for (const text of doc.splitTextToSize(value,178) as string[]) {
   if (y > 277) { pageWithBreak(); doc.setFont('helvetica',bold ? 'bold' : 'normal').setFontSize(size).setTextColor(20,34,56); }
   doc.text(text,rtl ? 194 : 16,y,{align:rtl ? 'right' : 'left'});
   y += size * 0.46;
  }
 };
 function pageWithBreak() { doc.addPage(); page(); }
 const section = (title: string, count?: number) => {
  y += 5;
  if (y > 263) pageWithBreak();
  line(count === undefined ? title : `${title} (${count})`,14,true);
  y += 2;
 };
 const entry = (label: string, value: unknown) => `${label} · ${value ?? '—'}`;
 page();
 line(copy.title,22,true);
 y += 4;
 line(date.format(generated));
 section(copy.profile);
 copy.fields.forEach((field,index) => line(entry(field,index === 8 ? renderDate(account[index]) : account[index])));
 section(copy.trips,trips.length);
 if (!trips.length) line(copy.empty);
 for (const trip of trips) {
  line(`#${trip.id} · ${renderDate(trip.start_time)} → ${renderDate(trip.end_time)}`,10,true);
  line([entry(copy.details[2],trip.distance_km),entry(copy.details[3],trip.price == null ? null : `${trip.price} ${trip.currency ?? 'EUR'}`),entry(copy.details[4],trip.status)].join(' | '));
  line([entry(copy.details[5],[trip.chiron_environment,trip.chiron_sync_state].filter(Boolean).join(' / ') || null),entry(copy.details[6],trip.payment_method)].join(' | '));
 }
 section(copy.invoices,invoices.length);
 if (!invoices.length) line(copy.empty);
 for (const invoice of invoices) line(`${invoice.reference} · ${renderDate(invoice.date)} · ${invoice.amount ?? '—'} ${invoice.currency ?? 'EUR'}`);
 section(copy.payments,payments.length);
 if (!payments.length) line(copy.empty);
 for (const payment of payments) line(`${payment.document_number} · ${renderDate(payment.payment_date)} · ${payment.amount ?? '—'} ${payment.currency ?? 'EUR'} · ${payment.payment_method ?? '—'}`);
 y += 7;
 line(copy.note,9);
 return new Uint8Array(doc.output('arraybuffer'));
}
