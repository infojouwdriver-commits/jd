import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateAdminUserToken } from '@/lib/auth';
import { createPostgrestClient } from '@/lib/postgrest';
import { mailEvent } from '@/lib/mail-policy';
import { readBoundedBody } from '@/lib/request-body';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const id = request.headers.get('svix-id')?.trim();
  const timestamp = request.headers.get('svix-timestamp')?.trim();
  const signature = request.headers.get('svix-signature')?.trim();
  if (!secret || !id || id.length > 256 || !timestamp || !signature) {
    return NextResponse.json({error:'Invalid webhook'}, {status:400});
  }
  let verified: unknown;
  try {
    const payload = new TextDecoder().decode(await readBoundedBody(request));
    verified = new Resend().webhooks.verify({payload,headers:{id,timestamp,signature},webhookSecret:secret});
  } catch (error) {
    return NextResponse.json({error:'Invalid webhook'}, {status:error instanceof Response ? error.status : 400});
  }
  let event;
  try { event = mailEvent(verified); } catch { return NextResponse.json({error:'Invalid webhook'}, {status:400}); }
  if (!event) return NextResponse.json({received:true});
  const client = createPostgrestClient(await generateAdminUserToken());
  const recorded = await client.rpc('security_record_mail_event', {
    p_event_id:id,p_provider_id:event.providerId,p_status:event.status,p_event_time:event.eventTime,
  });
  if (recorded.error) return NextResponse.json({error:'Event unavailable'}, {status:503});
  return NextResponse.json({received:true});
}
