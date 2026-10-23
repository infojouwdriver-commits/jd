import type {NextRequest} from 'next/server';
import {verifyReceiptCapability, receiptDocumentUrl} from '@/lib/document-links';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {rateLimit} from '@/lib/rate-limit';
import {generateVervoerbewijs, getVervoerbewijsArrayBuffer} from '@/legal/vervoerbewijs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = {'Cache-Control':'private, no-store, max-age=0','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff'};
// The URL itself grants access to this receipt only. It never authenticates a user
// or exposes shift reports. Render exclusively from the invoice's saved snapshot.
export async function GET(request: NextRequest, context: {params: Promise<{token:string}>}) {
  try {
    const limited = await rateLimit(request, '/documents/receipts');
    if (limited) { for (const [k,v] of Object.entries(headers)) limited.headers.set(k,v); return limited; }
    const id = verifyReceiptCapability((await context.params).token);
    if (!id) return new Response('Document unavailable', {status:404,headers});
    const {data,error} = await createPostgrestClient(await generateAdminUserToken()).from('invoices').select('receipt_snapshot').eq('id',id).maybeSingle();
    if (error) return new Response('Document temporarily unavailable', {status:503,headers});
    if (!data?.receipt_snapshot) return new Response('Document unavailable', {status:404,headers});
    const pdf = generateVervoerbewijs({...data.receipt_snapshot, document_url:receiptDocumentUrl(id)});
    return new Response(Buffer.from(getVervoerbewijsArrayBuffer(pdf)), {headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':`inline; filename="Vervoerbewijs-${id}.pdf"`}});
  } catch {
    return new Response('Document temporarily unavailable', {status:503,headers});
  }
}
