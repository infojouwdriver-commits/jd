import {verificationDesign} from './account.ts';
import {contractDesign} from './contract.ts';
import {invoiceDesign} from './invoice.ts';
import {driverReportDesign,tripReceiptDesign} from './receipt.ts';
import {receiptMessage} from '../receipt-email-model.ts';
import type {EmailLanguage,TemplateId,EmailDesign} from './renderer.ts';

const names = {
  ar:{person:'نور عينة',company:'شركة التنقل التجريبية'},
  fr:{person:'Camille Démo',company:'Mobilité Démo'},
  nl:{person:'Noor Demo',company:'Mobiliteit Demo'},
  en:{person:'Sam Demo',company:'Demo Mobility'},
};

export function emailSampleDesign(id:TemplateId, language:EmailLanguage):EmailDesign {
  const {person,company}=names[language];
  switch(id) {
    case 'register': case 'company-registration': case 'reset-password': case 'account-email':
      return verificationDesign(id,'000000',language,person);
    case 'contract-invitation': case 'contract-confirmation':
      return contractDesign({contract_number:'DEMO-CONTRACT-01',contract_language:language,monthly_fee:50,annual_fee:600}, {name:company}, {
        url:'https://app.jouww.com',
        direct:true,
        evidence:id==='contract-confirmation' ? {signer_name:person,signer_email:'signature@example.invalid',signed_at:'2026-11-14 14:30 CET',digest:'0'.repeat(64)} : undefined,
      });
    case 'invoice': case 'credit-note': case 'invoice-reminder':
      return invoiceDesign({
        language,name:person,reference:'DEMO-INVOICE-01',currency:'EUR',total:5000,balance:id==='credit-note'?0:5000,
        credit:id==='credit-note',due:'2026-11-30',legacyCollection:false,bankQr:false,filename:'DEMO-INVOICE-01.pdf',
        paymentUrl:'https://app.jouww.com',
      },id==='invoice-reminder'?'subscription_reminder':'subscription_invoice');
    case 'trip-receipt': {
      const reference='DEMO-TRIP-01';
      const draft=receiptMessage(language,reference,company,{version:1,enabled:false,text:{ar:'عرض',fr:'Démo',nl:'Demo'},url:'https://jouww.com/'});
      return tripReceiptDesign(language,draft.subject,draft.message,reference+'.pdf');
    }
    case 'driver-report':
      return driverReportDesign(language,person,'2026-10-01 – 2026-10-31','DEMO-DRIVER-REPORT.pdf');
  }
}
