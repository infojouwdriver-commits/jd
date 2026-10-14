/** Chiron r3.0: https://www.vlaanderen.be/mobiliteit-en-openbare-werken/taxi/rittendatabank-chiron */
export class ChironError extends Error {
 constructor(message:string,public status=422,public code='CHIRON_CONFIGURATION',public uncertain=false){super(message);}
}
/** Accept both persisted legacy uppercase values and the canonical event values. */
export function canonicalChironEnvironment(value:unknown):'test'|'production' {
 if(value==='TEST'||value==='test')return 'test';
 if(value==='PRODUCTION'||value==='production')return 'production';
 throw new ChironError('بيئة Chiron المخزنة غير صالحة. راجع إعدادات الرحلة.',409,'CHIRON_ENVIRONMENT_INVALID');
}
export function chironDestination(input:string,mode:'TEST'|'PRODUCTION',kind:'auth'|'trip'|'hello'):string{
 const host=mode==='TEST'?'mow-acc.api.vlaanderen.be':'mow.api.vlaanderen.be';
 const path=kind==='auth'?'/oauth/token':kind==='trip'?'/chiron/taxirit':'/chiron/hello';
 let url:URL;try{url=new URL(input);}catch{throw new ChironError('رابط Chiron غير صالح');}
 if(url.protocol!=='https:'||url.hostname!==host||url.port||url.username||url.password||url.pathname!==path||url.search||url.hash)throw new ChironError('استخدم رابط Chiron الرسمي المطابق لبيئة الشركة');
 return url.toString();
}
function numeric(value:unknown,minimum:number,maximum:number,digits:number,label:string){
 if(value===null||value===undefined||value===''||!Number.isFinite(Number(value))||Number(value)<minimum||Number(value)>maximum)throw new ChironError('بيانات الرحلة غير مكتملة: '+label);
 return Number(Number(value).toFixed(digits));
}
function timestamp(value:unknown){const date=new Date(String(value));if(!Number.isFinite(date.getTime()))throw new ChironError('توقيت الرحلة غير صالح');return date.toISOString();}
export function rideMessage(status:'vertrek'|'aankomst',company:any,driver:any,vehicle:any,trip:any,contract?:any){
 const kbo=String(company.kbo_number||'').replace(/\./g,'');
 if(!/^\d{10}$/.test(kbo)||!company.name||!driver.capacity_certificate_number||!vehicle.plate_number||!trip.ritnummer||String(trip.ritnummer).length>100)throw new ChironError('أكمل رقم KBO وبطاقة السائق ولوحة المركبة ومعرّف الرحلة');
 if(String(driver.company_id)!==String(company.id)||String(vehicle.company_id)!==String(company.id))throw new ChironError('السائق والمركبة يجب أن يتبعا الشركة نفسها');
 const rit:any={taxibedrijf:{aanbieder:{registratie:kbo,naam:company.name}},voertuig:{nummerplaat:vehicle.plate_number},uitvoerder:{bestuurderspasnummer:driver.capacity_certificate_number},vertrektijdstip:timestamp(trip.start_time),vertrekpunt:{lengtegraad:numeric(trip.start_lon,-180,180,3,'خط طول الانطلاق'),breedtegraad:numeric(trip.start_lat,-90,90,3,'خط عرض الانطلاق')}};
 if(contract)rit.taxibedrijf.contract={contractnummer:contract.contract_number,contractant:contract.contractor_name};
 if(status==='aankomst'){
  rit.aankomsttijdstip=timestamp(trip.end_time);if(Date.parse(rit.aankomsttijdstip)<=Date.parse(rit.vertrektijdstip))throw new ChironError('وقت الوصول يجب أن يلي وقت الانطلاق');
  rit.aankomstpunt={lengtegraad:numeric(trip.end_lon,-180,180,3,'خط طول الوصول'),breedtegraad:numeric(trip.end_lat,-90,90,3,'خط عرض الوصول')};
  rit.afstand={waarde:numeric(trip.distance_km,0,100000,3,'المسافة')};rit.kostprijs={waarde:numeric(trip.price,0,1000000,2,'السعر')};
  if(rit.kostprijs.waarde===0&&!contract)throw new ChironError('الرحلة ذات السعر صفر تحتاج بيانات العقد');
 }
 return {status,ritnummer:String(trip.ritnummer),broncreatiedatum:new Date().toISOString(),rit};
}
