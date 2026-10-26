import type {createPostgrestClient} from './postgrest';
import type {InvoicePaymentState} from './invoice-bank-payment';
/** Read the current balance and collection guard; never infer payment from a QR scan. */
export async function invoicePaymentState(client:ReturnType<typeof createPostgrestClient>,document:{id:number;contract_id?:number|null},source:'manual'|'subscription'):Promise<InvoicePaymentState>{
 if(source==='manual'){
  const r=await client.from('manual_invoice_summary').select('balance_cents').eq('id',document.id).single();if(r.error)throw r.error;
  return {collection:'bank',balance_cents:Number(r.data.balance_cents)};
 }
 const r=await client.rpc('security_subscription_document_balance',{p_id:document.id});if(r.error)throw r.error;
 let collection:'bank'|'stripe'='bank';
 if(document.contract_id){const e=await client.from('stripe_enrollments').select('id').eq('contract_id',document.contract_id).limit(1);if(e.error)throw e.error;if(e.data.length)collection='stripe';}
 return {collection,balance_cents:Number(r.data)};
}
