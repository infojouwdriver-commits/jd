import { jsPDF } from "jspdf";
import { configurePdfFonts } from "@/legal/pdf-fonts";
export interface SubscriptionDocument {
  id: number;
  company_id: number;
  document_number: string;
  kind: "invoice" | "credit";
  original_id: number | null;
  contract_number?: string | null;
  installment_number?: number | null;
  state: "prepared" | "issued" | "void";
  is_test: boolean;
  currency: "EUR";
  period_start: string;
  period_end: string;
  prepared_date: string;
  issued_date: string | null;
  due_date: string | null;
  net_cents: number;
  vat_cents: number;
  gross_cents: number;
  vat_bps: number;
  tax_category: string;
  tax_reason: string | null;
  issuer: Record<string, string>;
  recipient: Record<string, string>;
  description: string;
  reason: string | null;
  exchange_reference: string | null;
}
export const euro = (cents: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(
    Number(cents) / 100,
  );
export function subscriptionPdf(d: SubscriptionDocument) {
  const pdf = new jsPDF();
  configurePdfFonts(pdf);
  const navy=[16,30,51] as const,gold=[175,137,42] as const,muted=[88,101,118] as const;
  let y=24;
  const line=(text:string,size=10,width=174,x=18)=>{pdf.setFontSize(size);for(const row of pdf.splitTextToSize(String(text||''),width)){if(y>258){pdf.addPage();y=24;}pdf.text(row,x,y);y+=size*.48+2;}};
  pdf.setFillColor(...navy);pdf.rect(0,0,210,45,'F');pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');line('JOUW DRIVER',21);pdf.setFont('helvetica','normal');line(d.kind==='credit'?'NOTE DE CRÉDIT / CREDITNOTA':'FACTURE / FACTUUR',11);
  y=56;pdf.setTextColor(...navy);pdf.setFont('helvetica','bold');line(d.document_number,15);pdf.setFont('helvetica','normal');
  if(d.is_test){pdf.setTextColor(...gold);line('DÉMONSTRATION / DEMO — SANS VALEUR FISCALE',10);}
  if(d.state!=='issued'){pdf.setTextColor(...muted);line(d.state==='void'?'ANNULÉ / GEANNULEERD':'DOCUMENT PRÉPARATOIRE — NON ÉMIS / VOORBEREID — NIET UITGEREIKT',9);}
  y+=5;pdf.setTextColor(...navy);const partyTop=y;
  const party=(title:string,values:Record<string,string>,x:number)=>{y=partyTop;pdf.setFont('helvetica','bold');line(title,10,80,x);pdf.setFont('helvetica','normal');pdf.setTextColor(...muted);for(const key of ['name','address','vat_number','kbo_number','email'])if(values[key])line(values[key],9,80,x);return y;};
  const rows=(values:Record<string,string>)=>['name','address','vat_number','kbo_number','email'].reduce((n,key)=>n+(values[key]?pdf.splitTextToSize(String(values[key]),80).length:0),0);
  if(Math.max(rows(d.issuer),rows(d.recipient))>18){for(const [title,values] of [['ÉMETTEUR / LEVERANCIER',d.issuer],['CLIENT / KLANT',d.recipient]] as const){pdf.setTextColor(...navy);pdf.setFont('helvetica','bold');line(title,10);pdf.setFont('helvetica','normal');for(const key of ['name','address','vat_number','kbo_number','email'])if(values[key])line(values[key],9);y+=6;}}
  else{const left=party('ÉMETTEUR / LEVERANCIER',d.issuer,18),right=party('CLIENT / KLANT',d.recipient,112);y=Math.max(left,right)+10;}
  pdf.setTextColor(...navy);
  line('Date / Datum: '+(d.issued_date||d.prepared_date));if(d.due_date)line('Échéance / Vervaldatum: '+d.due_date);
  if(d.contract_number){line('Contrat / Contract: '+d.contract_number);line('Période / Periode: '+d.period_start+' — '+d.period_end);}
  if(d.installment_number)line('Mensualité / Maandtermijn: '+d.installment_number+' / 12');
  y+=7;pdf.setDrawColor(214,220,228);pdf.line(18,y,192,y);y+=8;pdf.setFont('helvetica','bold');line('DESCRIPTION / OMSCHRIJVING',9);pdf.setFont('helvetica','normal');line(d.description,10);if(d.reason)line('Motif / Reden: '+d.reason);if(d.original_id)line('Facture d’origine / Oorspronkelijke factuur: #'+d.original_id);
  y+=8;if(y>175){pdf.addPage();y=24;}pdf.line(18,y,192,y);y+=10;
  const amount=(label:string,value:number,size=10)=>{pdf.setFontSize(size);pdf.text(label,100,y);pdf.text(euro(value),190,y,{align:'right'});y+=9;};
  amount('Hors TVA / Excl. btw',d.net_cents);amount('TVA / Btw '+d.vat_bps/100+'%',d.vat_cents);pdf.setFillColor(...navy);pdf.roundedRect(96,y-6,98,16,2,2,'F');pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');amount('TOTAL EUR',d.gross_cents,12);y+=14;pdf.setFont('helvetica','normal');pdf.setTextColor(...muted);if(d.tax_reason)line(d.tax_reason,9);
  line('Communication / Mededeling: '+d.document_number,9);
  line('Modalités de paiement communiquées séparément par l’administration. / Betalingsinstructies worden afzonderlijk meegedeeld.',8);
  if(d.state==='issued')line('Copie PDF. L’échange structuré est suivi séparément. / PDF-kopie. De gestructureerde uitwisseling wordt afzonderlijk opgevolgd.',8);
  const pages=pdf.getNumberOfPages();for(let page=1;page<=pages;page++){pdf.setPage(page);pdf.setTextColor(...muted);pdf.setFontSize(8);pdf.text(d.document_number,18,282);pdf.text(page+' / '+pages,192,282,{align:'right'});pdf.setDrawColor(...gold);pdf.line(18,275,192,275);}
  return Buffer.from(pdf.output('arraybuffer'));
}
