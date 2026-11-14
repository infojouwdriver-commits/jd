import type {EmailDesign, EmailLanguage} from './renderer.ts';

export function tripReceiptDesign(language:EmailLanguage, subject:string, message:string, filename:string): EmailDesign {
  return {id:'trip-receipt', language, subject, title:subject, message, filenames:[filename]};
}

const reports = {
  ar:{title:'كشف حساب السائق',name:'السائق',period:'الفترة المالية',message:'يتضمن الكشف المرفق ملخص الإيرادات والمصروفات ورصيد الفترة.'},
  fr:{title:'Relevé du chauffeur',name:'Chauffeur',period:'Période comptable',message:'Le relevé joint récapitule les recettes, les dépenses et le solde de la période.'},
  nl:{title:'Chauffeursoverzicht',name:'Chauffeur',period:'Boekhoudperiode',message:'Het bijgevoegde overzicht bevat de inkomsten, uitgaven en het saldo van de periode.'},
  en:{title:'Driver statement',name:'Driver',period:'Financial period',message:'The attached statement summarizes income, expenses and the balance for the period.'},
};

export function driverReportDesign(language:EmailLanguage, driver:string, period:string, filename:string): EmailDesign {
  const w=reports[language];
  return {id:'driver-report', language, subject:`JOUW DRIVER — ${w.title}`, title:w.title, message:w.message,
    fields:[{label:w.name,value:driver},{label:w.period,value:period,ltr:true}], filenames:[filename]};
}
