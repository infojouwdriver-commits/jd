import {NextRequest,NextResponse} from 'next/server';
import {brevoWebhookAuthorized,brevoMailEvent} from '@/lib/brevo-mail';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 if(process.env.MAIL_PROVIDER!=='brevo'||!brevoWebhookAuthorized(request.headers.get('authorization'),process.env.BREVO_WEBHOOK_TOKEN))return NextResponse.json({error:'Invalid webhook'},{status:401});
 let event;
 try{
  const text=await request.text();if(text.length>65536)throw new Error('Invalid size');
  event=brevoMailEvent(JSON.parse(text));
 }catch{return NextResponse.json({error:'Invalid webhook'},{status:400});}
 if(!event)return NextResponse.json({received:true});
 const client=createPostgrestClient(await generateAdminUserToken());
 const recorded=await client.rpc('security_record_mail_event',{p_event_id:event.eventId,p_provider_id:event.providerId,p_status:event.status,p_event_time:event.eventTime});
 if(recorded.error)return NextResponse.json({error:'Event unavailable'},{status:503});
 return NextResponse.json({received:true});
}
