import {createHmac} from 'node:crypto';
import {type NextRequest} from 'next/server';
import {contactSubmission,supportEmail} from '@/lib/public-contact';
import {sendTransactionalMail} from '@/lib/mail-service';
import {contactEmailDesign} from '@/lib/email/operational';
import {consumeRateLimit} from '@/lib/rate-limit';
import {getRequestIp} from '@/lib/api-utils';

const sites=new Set(['jouww.com','www.jouww.com','app.jouww.com']);
const result=(status:number) => Response.json({success:status===200},{status,headers:{'Cache-Control':'no-store'}});

export async function POST(request:NextRequest) {
  const host=request.headers.get('host')?.toLowerCase().replace(/:443$/,'')??'';
  const origin=request.headers.get('origin');
  const local=process.env.NODE_ENV!=='production'&&request.nextUrl.origin===origin;
  if(!(sites.has(host)&&origin==='https://'+host)&&!local)return result(403);
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return result(415);
  if(Number(request.headers.get('content-length')??0)>16000)return result(413);

  const limited=await consumeRateLimit('public-contact:'+getRequestIp(request),3);
  if(limited)return limited;
  let body:unknown;
  try {
    const raw=await request.text();
    if(Buffer.byteLength(raw)>16000)return result(413);
    body=JSON.parse(raw);
  } catch {return result(400);}
  const parsed=contactSubmission.safeParse(body);
  if(!parsed.success)return result(400);
  if(parsed.data.website)return result(200);
  const key=process.env.MAIL_METADATA_KEY||process.env.DATA_ENCRYPTION_KEY||'';
  if(key.length<32)return result(503);
  const {requestId,website,...data}=parsed.data;
  const digest=createHmac('sha256',key).update(JSON.stringify(data)).digest('hex');
  try {
    const delivery=await sendTransactionalMail({to:supportEmail,design:contactEmailDesign(parsed.data),purpose:'public_contact',event:`public-contact:${requestId}:${digest}`});
    return result(delivery.accepted?200:delivery.status==='quota_exceeded'?429:503);
  } catch {return result(503);}
}
