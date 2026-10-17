import {jsPDF} from 'jspdf';
import {configurePdfFonts} from '@/legal/pdf-fonts';
export interface SubscriptionDocument{
 id:number;company_id:number;document_number:string;kind:'invoice'|'credit';original_id:number|null;state:'prepared'|'issued'|'void';is_test:boolean;currency:'EUR';period_start:string;period_end:string;prepared_date:string;issued_date:string|null;due_date:string|null;net_cents:number;vat_cents:number;gross_cents:number;vat_bps:number;tax_category:string;tax_reason:string|null;issuer:Record<string,string>;recipient:Record<string,string>;description:string;reason:string|null;exchange_reference:string|null;
}
export const euro=(cents:number)=>new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR'}).format(Number(cents)/100);
export function subscriptionPdf(d:SubscriptionDocument){
 const pdf=new jsPDF();configurePdfFonts(pdf);let y=23;
 const line=(text:string,size=10)=>{pdf.setFontSize(size);for(const row of pdf.splitTextToSize(text,170)){if(y>270){pdf.addPage();y=22;}pdf.text(row,20,y);y+=size*.48+2;}};
 pdf.setTextColor(16,30,51);line('JOUW DRIVER',23);line(d.kind==='credit'?'NOTE DE CRÉDIT / CREDITNOTA':'FACTURE / FACTUUR',16);line(d.document_number,13);
 if(d.is_test)line('DÉMONSTRATION / DEMO — SANS VALEUR FISCALE',12);
 if(d.state!=='issued')line('DOCUMENT PRÉPARATOIRE — NON ÉMIS / VOORBEREID — NIET UITGEREIKT',11);
 y+=4;line('Émetteur / Leverancier',12);for(const key of ['name','address','vat_number','kbo_number','email'])if(d.issuer[key])line(d.issuer[key]);
 y+=4;line('Client / Klant',12);for(const key of ['name','address','vat_number','kbo_number','email'])if(d.recipient[key])line(d.recipient[key]);
 y+=4;line('Date / Datum: '+(d.issued_date||d.prepared_date));if(d.due_date)line('Échéance / Vervaldatum: '+d.due_date);
 line('Période / Periode: '+d.period_start+' — '+d.period_end);line(d.description);
 if(d.original_id)line('Facture d’origine / Oorspronkelijke factuur: #'+d.original_id);if(d.reason)line('Motif / Reden: '+d.reason);
 y+=5;line('Hors TVA / Excl. btw: '+euro(d.net_cents),12);line('TVA / Btw '+(d.vat_bps/100)+'%: '+euro(d.vat_cents),12);line('TOTAL: '+euro(d.gross_cents),16);
 if(d.tax_reason)line(d.tax_reason);
 y+=5;line('Modalités de paiement communiquées séparément par l’administration. / Betalingsinstructies worden afzonderlijk meegedeeld.');
 if(d.state==='issued')line('Copie PDF. L’échange structuré est suivi séparément. / PDF-kopie. De gestructureerde uitwisseling wordt afzonderlijk opgevolgd.');
 return Buffer.from(pdf.output('arraybuffer'));
}
