import {brevoProviderId,brevoIdempotencyKey} from './brevo-mail';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {mailConfiguration,mailEventKey} from './mail-policy';
import {renderEmail,type EmailDesign} from './email/renderer';
import {emailEdits,readEmailSettings} from './email/settings';
type MailPurpose = 'verification'|'contract_invitation'|'contract_confirmation'|'subscription_invoice'|'subscription_credit'|'subscription_reminder'|'driver_receipt';
interface MailAttachment {filename:string;content:Buffer}
type MailMessage = {to:string;design:EmailDesign;event:string;attachments?:MailAttachment[]} &
 ({purpose:MailPurpose;sample?:never}|{purpose:'template_test';sample:true});
export interface MailResult {accepted:boolean;status:string;delivery_id?:number;}
export async function sendTransactionalMail(message:MailMessage):Promise<MailResult> {
 const config=mailConfiguration(process.env);
 if(!config.ready)return {accepted:false,status:'not_configured'};
 if(message.to.length>254||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(message.to))return {accepted:false,status:'invalid_message'};
 const attachments=message.attachments||[];
 if(attachments.length>4||new Set(attachments.map(a=>a.filename)).size!==attachments.length
  ||attachments.reduce((size,a)=>size+a.content.length,0)>4000000
  ||attachments.some(a=>!/^[A-Z][A-Z0-9-]{2,80}\.pdf$/.test(a.filename)||a.content.subarray(0,5).toString()!=='%PDF-')
  ||JSON.stringify(message.design.filenames||[])!==JSON.stringify(attachments.map(a=>a.filename)))return {accepted:false,status:'invalid_message'};
 const secret=config.metadataKey;
 const eventKey=mailEventKey(message.event,secret);
 const recipientKey=mailEventKey('recipient:'+message.to.trim().toLowerCase(),secret);
 const client=createPostgrestClient(await generateAdminUserToken());
 const settings=await readEmailSettings(client,message.design.language).catch(()=>null);
 if(!settings&&message.sample)return {accepted:false,status:'record_unavailable'};
 const edits=settings?emailEdits(message.design,settings.settings):{};
 const {subject,html,text}=renderEmail(message.design,edits,{sample:message.sample});
 if(!subject||subject.length>350||!text||html.length>128000)return {accepted:false,status:'invalid_message'};
 const reserved=await client.rpc('security_reserve_mail',{p_event_key:eventKey,p_recipient_key:recipientKey,p_purpose:message.purpose});
 if(reserved.error || !reserved.data)return {accepted:false,status:'record_unavailable'};
 const reservation=reserved.data as {reserved:boolean;id:number;status:string};
 if(!reservation.reserved)return {accepted:['accepted','delivered','delayed'].includes(reservation.status),status:reservation.status,delivery_id:reservation.id};
 let status:'accepted'|'uncertain'|'failed'='uncertain';let providerId:string|null=null;
 try {
  const brevo=config.provider==='brevo';
  const response=await fetch(brevo?'https://api.brevo.com/v3/smtp/email':'https://api.resend.com/emails',{
   method:'POST',headers:brevo?{'api-key':config.key,'Content-Type':'application/json'}:{Authorization:'Bearer '+config.key,'Content-Type':'application/json','Idempotency-Key':eventKey},
   body:JSON.stringify(brevo?{sender:{name:'JOUW DRIVER',email:config.sender},replyTo:{name:'JOUW DRIVER',email:config.sender},to:[{email:message.to}],subject,htmlContent:html,textContent:text,headers:{idempotencyKey:brevoIdempotencyKey(eventKey)},...(message.attachments?{attachment:message.attachments.map(a=>({name:a.filename,content:a.content.toString('base64')}))}:{})}:{from:config.sender,to:[message.to],subject,html,text,...(message.attachments?{attachments:message.attachments.map(a=>({filename:a.filename,content:a.content.toString('base64')}))}:{})}),signal:AbortSignal.timeout(10000)});
  if(response.ok){
   const data=await response.json();
   if(brevo){providerId=brevoProviderId(data.messageId);status='accepted';}
   else if(typeof data.id==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(data.id)){providerId=data.id;status='accepted';}
  }
  else if(response.status>=400 && response.status<500)status='failed';
 } catch { /* Connection failure cannot establish whether the provider accepted the message. */ }
 const completed=await client.rpc('security_complete_mail',{p_id:reservation.id,p_status:status,p_provider_id:providerId});
 if(completed.error)return {accepted:false,status:'uncertain',delivery_id:reservation.id};
 const final=(completed.data as {status?:string})?.status || status;
 return {accepted:['accepted','delivered','delayed'].includes(final),status:final,delivery_id:reservation.id};
}
