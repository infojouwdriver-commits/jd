import type {createPostgrestClient} from './postgrest';
import {receiptDocumentUrl} from './document-links';
import {generateVervoerbewijs,getVervoerbewijsArrayBuffer,type VervoerbewijsData} from '@/legal/vervoerbewijs';
import type {IssuedReceipt} from './receipt-email-model';
export async function existingReceipt(client:ReturnType<typeof createPostgrestClient>,tripId:number,actor:number){
 if(!Number.isSafeInteger(tripId)||tripId<1)throw new Response(null,{status:400});
 const trip=await client.from('trips').select('id,user_id,status,is_test').eq('id',tripId).eq('user_id',actor).maybeSingle();
 if(trip.error)throw trip.error;
 if(!trip.data)throw new Response(null,{status:404});
 if(trip.data.status!=='completed')throw new Response(null,{status:409});
 const row=await client.from('invoices').select('id,user_id,invoice_number,receipt_snapshot,invoice_language,status').eq('trip_id',tripId).eq('user_id',actor).eq('invoice_category','trip').eq('status','issued').order('id').limit(1).maybeSingle();
 if(row.error)throw row.error;
 if(!row.data?.receipt_snapshot)throw new Response(null,{status:409});
 const invoice=row.data, snapshot=invoice.receipt_snapshot as VervoerbewijsData;
 if(typeof snapshot.company?.name!=='string'||!snapshot.trip||!Number.isFinite(Number(snapshot.trip.price))||Number(snapshot.trip.price)<0||!snapshot.document_date||!Number.isFinite(Date.parse(snapshot.document_date)))throw new Response(null,{status:409});
 const pdfUrl=receiptDocumentUrl(Number(invoice.id));
 const receipt:IssuedReceipt={trip_id:tripId,invoice_id:Number(invoice.id),reference:invoice.invoice_number,date:snapshot.document_date,company:snapshot.company.name,amount:Number(snapshot.trip.price),currency:snapshot.trip.currency||'EUR',distanceKm:Number(snapshot.trip.distance_km||0),durationMinutes:Number(snapshot.trip.duration_minutes||0),payment:snapshot.trip.payment_method||'',pdfUrl};
 return {receipt,invoice,snapshot,isTest:trip.data.is_test===true,pdf:()=>Buffer.from(getVervoerbewijsArrayBuffer(generateVervoerbewijs({...snapshot,document_url:pdfUrl})))};
}
