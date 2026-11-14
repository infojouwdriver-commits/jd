import type {createPostgrestClient} from './postgrest';
import {invoiceRpc,type InvoiceSource} from './invoice-checkout';
import {invoicePaymentUrl} from './invoice-payment-link';
import {invoicePaymentState} from './invoice-payment-state';
import {subscriptionPdf,type SubscriptionDocument} from './subscription-document';
import {sendTransactionalMail} from './mail-service';
import {stripeConfiguration} from './stripe-billing-core';
import {invoiceBankPayload} from './invoice-bank-payment';
import {invoiceDesign,type InvoiceMailPurpose} from './email/invoice';
export async function sendInvoiceEmail(client:ReturnType<typeof createPostgrestClient>,source:InvoiceSource,documentId:number,actor:number,event:string){
 const d=await invoiceRpc(client,'security_invoice_email_issue',{p_source:source,p_document:documentId,p_actor:actor});
 return deliverInvoiceEmail(client,source,d,event);
}
export async function deliverInvoiceEmail(client:ReturnType<typeof createPostgrestClient>,source:InvoiceSource,d:SubscriptionDocument,event:string,purpose:InvoiceMailPurpose='subscription_invoice'){
 if(d.state!=='issued'||d.is_test)throw Error('Issued real document required');
 const state=await invoicePaymentState(client,d,source);
 let url:string|null=null;
 if(d.kind==='invoice'&&state.balance_cents>0&&state.collection==='bank'){
  const config=stripeConfiguration();url=invoicePaymentUrl(source,d,config.origin,process.env.JWT_SECRET||'');
 }
 const filename=d.document_number+'.pdf';
 const design=invoiceDesign({
   language:d.recipient.language,name:d.recipient.name,reference:d.document_number,
   currency:d.currency||'EUR',total:d.gross_cents,balance:state.balance_cents,
   credit:d.kind==='credit',due:d.due_date,legacyCollection:state.collection==='stripe',
   bankQr:!!invoiceBankPayload(d,state),paymentUrl:url,filename,
 },purpose);
 const doc=source==='manual'?{...d,period_start:d.prepared_date,period_end:d.prepared_date,original_id:null,reason:null,tax_category:d.vat_bps?'S':'E'}:d;
 return sendTransactionalMail({to:d.recipient.email,design,purpose,event,attachments:[{filename,content:subscriptionPdf(doc,state)}]});
}
