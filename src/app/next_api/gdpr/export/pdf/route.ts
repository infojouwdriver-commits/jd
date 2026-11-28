import { requestMiddleware } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { createErrorResponse } from '@/lib/create-response';
import { createPostgrestClient } from '@/lib/postgrest';
import {consumeRateLimit} from '@/lib/rate-limit';
import { accountExportPdf } from '@/lib/account-export-pdf';

type Row = Record<string, unknown>;
type PageResult = PromiseLike<{data: Row[] | null; error: unknown}>;
async function readAll(page: (from: number, to: number) => PageResult) {
 const rows: Row[] = [];
 for (let from = 0; from < 20000; from += 500) {
  const {data,error} = await page(from,from+499);
  if (error || !data) throw Error('Export unavailable');
  rows.push(...data);
  if (data.length < 500) return rows;
 }
 throw Error('Export exceeds interactive limit');
}

export const GET = requestMiddleware(async (request, context) => {
 const actor = Number(context.payload?.sub);
 if (!Number.isSafeInteger(actor) || actor < 1) return createErrorResponse({status:401,errorMessage:'Session required'});
 const limited = await consumeRateLimit(`account-pdf:${actor}`,6);
 if (limited) return limited;
 const language = request.nextUrl.searchParams.get('lang');
 const locale = language === 'ar' || language === 'nl' ? language : 'fr';
 const client = createPostgrestClient(await generateAdminUserToken());
 const [user,driver,ownerLinks] = await Promise.all([
  client.from('users').select('id,email,user_type,created_at,display_name').eq('id',actor).single(),
  client.from('drivers').select('id,full_name,driver_license,company_id,current_vehicle_id,assigned_vehicle_id,created_at').eq('user_id',actor).is('archived_at',null).order('id').limit(1).maybeSingle(),
  client.from('company_users').select('company_id').eq('user_id',actor).eq('is_active',true).in('role',['owner','portal_owner']),
 ]);
 if (user.error || driver.error || ownerLinks.error) throw Error('Export unavailable');
 const companyIds = [...new Set(ownerLinks.data.map(row=>row.company_id))];
 const vehicleId = driver.data?.current_vehicle_id || driver.data?.assigned_vehicle_id;
 const companyId = driver.data?.company_id ?? companyIds[0];
 const [company,vehicle,trips,receipts,subscriptionInvoices,payments] = await Promise.all([
  companyId ? client.from('companies').select('name,kbo_number').eq('id',companyId).maybeSingle() : null,
  vehicleId && driver.data?.company_id ? client.from('vehicles').select('brand,model,plate_number').eq('id',vehicleId).eq('company_id',driver.data.company_id).maybeSingle() : null,
  readAll((from,to)=>client.from('trips').select('id,start_time,end_time,distance_km,price,currency,status,payment_method,chiron_environment,chiron_sync_state').eq('user_id',actor).order('id',{ascending:false}).range(from,to)),
  readAll((from,to)=>client.from('invoices').select('id,invoice_number,invoice_date,total_tvac,paid_at,payment_method,receipt_snapshot').eq('user_id',actor).eq('invoice_category','trip').eq('status','issued').order('id',{ascending:false}).range(from,to)),
  companyIds.length ? readAll((from,to)=>client.from('subscription_documents').select('id,document_number,issued_date,gross_cents,currency').in('company_id',companyIds).eq('state','issued').eq('kind','invoice').eq('is_test',false).order('id',{ascending:false}).range(from,to)) : [],
  companyIds.length ? readAll((from,to)=>client.from('subscription_payments').select('invoice_id,payment_date,amount_cents,payment_method').in('company_id',companyIds).order('request_id').range(from,to)) : [],
 ]);
 if (company?.error || vehicle?.error) throw Error('Export unavailable');
 const invoiceReferences = new Map(subscriptionInvoices.map(row=>[row.id,row.document_number]));
 const euro = (cents:unknown) => (Number(cents)/100).toFixed(2);
 const bytes = accountExportPdf(locale,new Date(),[
  user.data.id,user.data.email,user.data.user_type,driver.data?.full_name ?? user.data.display_name ?? (companyIds.includes(companyId) ? company?.data?.name : undefined),
  driver.data?.driver_license,company?.data?.kbo_number,[vehicle?.data?.brand,vehicle?.data?.model].filter(Boolean).join(' ') || null,
  vehicle?.data?.plate_number,user.data.created_at ?? driver.data?.created_at,
  /^\d{10}$/.test(company?.data?.kbo_number ?? '') ? 'BE' : null,
 ],trips,[
  ...receipts.map(row=>{
   const snapshot = row.receipt_snapshot as {document_date?:string; trip?:{price?:number;currency?:string}} | null;
   return {reference:row.invoice_number,date:snapshot?.document_date ?? row.invoice_date,amount:snapshot?.trip?.price ?? row.total_tvac,currency:snapshot?.trip?.currency};
  }),
  ...subscriptionInvoices.map(row=>({reference:row.document_number,date:row.issued_date,amount:euro(row.gross_cents),currency:row.currency})),
 ],[
  ...receipts.filter(row=>row.paid_at).map(row=>({document_number:row.invoice_number,payment_date:row.paid_at,amount:row.total_tvac,payment_method:row.payment_method})),
  ...payments.filter(row=>invoiceReferences.has(row.invoice_id)).map(row=>({...row,document_number:invoiceReferences.get(row.invoice_id),amount:euro(row.amount_cents)})),
 ]);
 return new Response(bytes,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="jouw-driver-account.pdf"','Cache-Control':'private, no-store'}});
});
