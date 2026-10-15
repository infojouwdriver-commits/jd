import {jsPDF} from 'jspdf';
import {configurePdfFonts} from '../legal/pdf-fonts';
import {acceptanceSummary,reportEventAccepted,isAcceptedTestMessage,type AcceptanceReportData,type ChironTestMessage} from './chiron-test-result';

/** Technical evidence only: an HTTP response is not a municipal approval. */
export function generateAcceptanceReportPdf(data:AcceptanceReportData):jsPDF {
 const doc=new jsPDF();configurePdfFonts(doc);doc.setCharSpace(0);
 const ink=[27,46,65] as const,muted=[91,105,119] as const,gold=[170,134,55] as const,green=[23,116,88] as const,red=[170,56,56] as const;
 const summary=acceptanceSummary(data);let y=35;
 const color=(c:readonly[number,number,number])=>doc.setTextColor(c[0],c[1],c[2]);
 const text=(v:unknown)=>typeof v==='string'&&v.trim()?v.trim().slice(0,2000):typeof v==='number'&&Number.isFinite(v)?String(v):'Niet geregistreerd';
 const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v))?new Intl.DateTimeFormat('nl-BE',{timeZone:'Europe/Brussels',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(v)):'Niet geregistreerd';
 function header(){doc.setFillColor(...ink);doc.rect(0,0,210,23,'F');doc.setTextColor(255,255,255);doc.setFontSize(13);doc.text('JOUW DRIVER',18,14);doc.setFontSize(8);doc.text('CHIRON / TECHNISCH TESTDOSSIER',192,14,{align:'right'});doc.setDrawColor(...gold);doc.setLineWidth(1);doc.line(18,27,192,27);}
 function page(){doc.addPage();header();y=36;}
 function ensure(h:number){if(y+h>272)page();}
 function line(label:string,value:unknown,size=9){doc.setFontSize(size);const lines=doc.splitTextToSize(`${label}${label?': ':''}${text(value)}`,174) as string[];const h=lines.length*4.8;ensure(h+2);doc.setFontSize(size);doc.setTextColor(...muted);doc.text(lines,18,y);y+=h+1;}
 function heading(value:string){ensure(17);y+=3;doc.setTextColor(...ink);doc.setFontSize(12);doc.text(value,18,y);y+=8;}
 function event(label:string,events:ChironTestMessage[]){
  const m=events[0];let value=reportEventAccepted(events)?'HTTP-ontvangst bevestigd':!m?'Niet geregistreerd':events.length>1?'Meerdere resultaten - controle vereist':m.deliveryState==='not_sent'?'Niet verzonden':m.deliveryState==='uncertain'?'Ontvangst niet bevestigd':isAcceptedTestMessage(m)&&!Number.isInteger(m.httpStatus)?'Geslaagd geregistreerd; HTTP-status ontbreekt':'Niet bevestigd / mislukt';
  if(m&&Number.isInteger(m.httpStatus))value+=` (HTTP ${m.httpStatus})`;
  ensure(7);color(reportEventAccepted(events)?green:red);doc.setFontSize(9);doc.text(`${label}: ${value}`,18,y);y+=6;
 }
 function coords(lat:unknown,lon:unknown){return typeof lat==='number'&&typeof lon==='number'&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?`${lat.toFixed(6)}, ${lon.toFixed(6)}`:'Niet geregistreerd';}
 header();doc.setTextColor(...ink);doc.setFontSize(19);doc.text('Chiron acceptatietest',18,y);y+=9;
 line('Doel','Technisch dossier voor beoordeling door de bevoegde gemeente');
 line('Omgeving','TEST (acceptatie) - geen productie- of vergunningsbewijs');
 heading('Bedrijfsinformatie');
 for(const [label,value] of [['Bedrijfsnaam',data.company.name],['KBO-nummer',data.company.kbo_number],['BTW-nummer',data.company.vat_number],['Adres',data.company.address],['E-mail',data.company.email],['Telefoon',data.company.phone]])line(label as string,value);
 heading('Chauffeur en voertuig');
 line('Chauffeur',data.driver.full_name);line('Bestuurderspas / capaciteitsbewijs',data.driver.capacity_certificate_number);line('Telefoon chauffeur',data.driver.phone);
 line('Voertuig',[data.vehicle.brand,data.vehicle.model].filter(Boolean).join(' '));line('Nummerplaat',data.vehicle.plate_number);
 heading('Test en resultaten');line('Testdatum (Europe/Brussels)',date(data.testDate));
 ensure(30);const boxes=[['Berichten',summary.total],['HTTP bevestigd',summary.accepted],['Niet bevestigd',summary.unconfirmed]] as const;
 boxes.forEach(([label,n],i)=>{const x=18+i*59;doc.setFillColor(241,244,246);doc.roundedRect(x,y,56,23,2,2,'F');doc.setFontSize(18);color(i===1?green:i===2&&n?red:ink);doc.text(String(n),x+28,y+10,{align:'center'});doc.setFontSize(8);doc.setTextColor(...muted);doc.text(label,x+28,y+18,{align:'center'});});y+=31;
 line('Testopzet','5 vooraf ingestelde testritten, met 5 VERTREK- en 5 AANKOMST-berichten. Adressen en coördinaten zijn testgegevens, geen gemeten taxiritten.');
 line('Interpretatie','Een HTTP-bevestiging documenteert de ontvangst van een testbericht. Dit rapport bewijst geen productieacceptatie of gemeentelijke goedkeuring.');
 page();heading('Ritdetails - vertrek en aankomst');
 summary.trips.forEach((trip,index)=>{
  // Keep ordinary ride blocks together; long text still wraps and paginates safely.
  const d=trip.details;doc.setFontSize(9);
  const height=68+Math.max(0,doc.splitTextToSize(text(d.startAddress),174).length-1)*4.8+Math.max(0,doc.splitTextToSize(text(d.endAddress),174).length-1)*4.8;
  ensure(Math.min(height,230));heading(`Rit ${index+1}`);line('Ritnummer',trip.ritnummer);
  line('Vertrektijd (Brussel)',date(d.startTime));line('Aankomsttijd (Brussel)',date(d.endTime));
  line('Van',d.startAddress);line('Coördinaten vertrek',coords(d.startLat,d.startLon),8);
  line('Naar',d.endAddress);line('Coördinaten aankomst',coords(d.endLat,d.endLon),8);
  event('VERTREK',trip.departure);event('AANKOMST',trip.arrival);
  if(trip.conflictingDetails)line('Controle','De opgeslagen details van vertrek en aankomst verschillen; handmatige controle vereist.');
  ensure(5);doc.setDrawColor(211,220,227);doc.setLineWidth(0.2);doc.line(18,y,192,y);y+=5;
 });
 heading('Conclusie');line('',summary.complete?'Alle vijf berichtparen hebben een bevestigde HTTP-ontvangst in TEST.':'De gegevens bewijzen geen volledige bevestiging van alle vijf berichtparen. Controleer ontbrekende of niet-bevestigde resultaten.');
 line('Voorlegging','Dit dossier kan als technische bijlage worden voorgelegd. De beoordeling en eventuele goedkeuring blijven bij de bevoegde overheid.');
 const pages=doc.getNumberOfPages();for(let p=1;p<=pages;p++){doc.setPage(p);doc.setDrawColor(211,220,227);doc.line(18,281,192,281);doc.setFontSize(8);doc.setTextColor(...muted);doc.text(`Pagina ${p} van ${pages}`,18,287);doc.text('Tijden: Europe/Brussels | TEST',192,287,{align:'right'});}
 return doc;
}
