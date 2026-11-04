import type {NextRequest} from 'next/server';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {rateLimit} from '@/lib/rate-limit';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive'};
export async function GET(request:NextRequest,context:{params:Promise<{token:string}>}){
 try{
  const {token}=await context.params;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(token))return new Response('Document unavailable',{status:404,headers});
  const limited=await rateLimit(request,'/documents/tariffs');
  if(limited)return limited;
  const {data,error}=await createPostgrestClient(await generateAdminUserToken()).from('company_tariff_documents').select('pdf_base64').eq('id',token).maybeSingle();
  if(error)throw Error('Document unavailable');
  if(!data)return new Response('Document unavailable',{status:404,headers});
  return new Response(Uint8Array.from(Buffer.from(data.pdf_base64,'base64')),{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':`inline; filename="Tarifs-${token}.pdf"`}});
 }catch{return new Response('Document temporarily unavailable',{status:503,headers});}
}
