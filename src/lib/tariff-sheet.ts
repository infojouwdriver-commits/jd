import {jsPDF} from 'jspdf';
import {configurePdfFonts} from '@/legal/pdf-fonts';
import {drawPdfQr} from './pdf-qr';
import {documentOrigin} from './document-links';
import type {CompanyTariff} from './company-pricing';

export const tariffSheetUrl = (id:string) => `${documentOrigin}/documents/tariffs/${id}`;
export interface TariffSheet {
 id:string; issuedAt:string; language:'fr'|'nl';
 company:{name:string;address:string;vat:string;email:string;phone:string};
 tariffs:CompanyTariff[];
}

export function renderTariffSheet(sheet:TariffSheet, logo?:Buffer) {
 const nl=sheet.language==='nl';
 const doc=new jsPDF({format:'a4',compress:true});
 configurePdfFonts(doc);
 doc.setProperties({title:nl?'Indicatieve tarieven':'Tarifs indicatifs',author:'JOUW DRIVER'});
 const navy='#0B1423', gold='#E0BD5B', muted='#526178';
 const money=new Intl.NumberFormat(nl?'nl-BE':'fr-BE',{style:'currency',currency:'EUR'});
 const title=nl?'Indicatieve tarieven':'Tarifs indicatifs';
 const columns=[16,35,115,137,158,179];
 const labels=nl?['Code','Tarief','Start','/ km','/ min','Minimum']:['Code','Tarif','Départ','/ km','/ min','Minimum'];
 const date=new Intl.DateTimeFormat(nl?'nl-BE':'fr-BE',{dateStyle:'long',timeZone:'Europe/Brussels'}).format(new Date(sheet.issuedAt));
 function header(continuation=false) {
  doc.setFillColor(navy);doc.rect(0,0,210,48,'F');
  doc.setFillColor(gold);doc.rect(0,48,210,1.5,'F');
  if(logo)doc.addImage(logo,'PNG',15,9,10,10,'brand','FAST');
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(gold);
  doc.text('JOUW DRIVER',logo?29:16,16);
  doc.setFontSize(23);doc.setTextColor('#FFFFFF');doc.text(title,16,36);
  doc.setTextColor(navy);
  if(continuation)return 60;
  doc.setFontSize(14);
  const name=doc.splitTextToSize(sheet.company.name,177);
  doc.text(name,16,61);
  let y=61+name.length*6;
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(muted);
  const info=doc.splitTextToSize([sheet.company.address,`${nl?'BTW':'TVA'} ${sheet.company.vat}`,sheet.company.email,sheet.company.phone].filter(Boolean).join('  ·  '),177);
  doc.text(info,16,y);y+=info.length*4+9;
  return y;
 }
 function tableHeader(y:number) {
  doc.setFillColor(navy);doc.roundedRect(12,y,186,11,2,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor('#FFFFFF');
  labels.forEach((label,i)=>doc.text(label,columns[i],y+7));
  return y+11;
 }
 let y=tableHeader(header());
 for(const tariff of sheet.tariffs){
  doc.setFontSize(8);doc.setFont('helvetica','normal');
  const text=doc.splitTextToSize([tariff.name,tariff.description].filter(Boolean).join(' — '),75);
  const height=Math.max(12,7+text.length*4);
  if(y+height>258){doc.addPage();y=tableHeader(header(true));}
  doc.setFillColor('#F4F6FA');doc.rect(12,y,186,height,'F');
  doc.setTextColor(navy);doc.text(tariff.code,columns[0],y+6);doc.text(text,columns[1],y+6);
  const {settings:p}=tariff;
  [tariff.base_fee,p.base_rate_per_km,p.base_rate_per_minute,p.minimum_fare].forEach((amount,i)=>doc.text(money.format(amount),columns[i+2],y+6));
  y+=height+1;
 }
 if(y>206){doc.addPage();y=header(true);}
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(navy);
 const notice=nl
  ? 'De tarieven worden gebruikt om prijzen te ramen op basis van routes, afstanden en reistijden uit kaartdiensten. Het voorgestelde bedrag is indicatief. De chauffeur kan de eindprijs aanpassen binnen de toepasselijke tariefregels.\n\nJOUW DRIVER is software voor ritbeheer en prijsramingen. Het is geen gehomologeerde taximeter.'
  : 'Les tarifs présentés sont utilisés pour calculer des estimations de prix à partir des itinéraires, distances et durées estimés par les services cartographiques. Le montant proposé est indicatif. Le prix final peut être ajusté par le chauffeur, dans le respect des règles tarifaires applicables.\n\nJOUW DRIVER est un logiciel d’estimation et de gestion des trajets. Il ne constitue pas un taximètre homologué.';
 doc.text(doc.splitTextToSize(notice,177),16,y+12);
 const url=tariffSheetUrl(sheet.id);
 drawPdfQr(doc,url,166,254,28);
 doc.setFontSize(8);doc.setTextColor(muted);
 doc.text(`${nl?'Uitgiftedatum':'Date d’émission'} · ${date}`,16,264);
 doc.text(`${nl?'Versie':'Version'} · ${sheet.id}`,16,270);
 doc.text(nl?'Scan de QR-code om deze versie te openen.':'Scannez le QR code pour ouvrir cette version.',16,276);
 for(let page=1;page<=doc.getNumberOfPages();page++){
  doc.setPage(page);doc.setFontSize(8);doc.setTextColor(muted);doc.text(`${page} / ${doc.getNumberOfPages()}`,194,289,{align:'right'});
 }
 return Buffer.from(doc.output('arraybuffer'));
}
