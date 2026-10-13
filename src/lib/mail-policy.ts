import {createHmac} from 'node:crypto';
export type MailStatus = 'sending' | 'accepted' | 'uncertain' | 'delivered' | 'delayed' | 'failed' | 'bounced' | 'complained';
export const MAIL_FREE_LIMITS = {daily:90,monthly:2700} as const;
export function mailConfiguration(env:Record<string,string|undefined>) {
 const key=(env.RESEND_API_KEY || env.RESEND_KEY || '').trim();
 const sender=(env.RESEND_FROM_EMAIL || '').trim();
 const metadataKey=(env.MAIL_METADATA_KEY || env.DATA_ENCRYPTION_KEY || '').trim();
 const domain=(env.RESEND_VERIFIED_DOMAIN || '').trim().toLowerCase();
 const address=sender.match(/^(?:[^<>\r\n]+<)?([^<>\s]+@[^<>\s]+)>?$/)?.[1]?.toLowerCase();
 const validDomain=/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain);
 const senderValid=!!address && !/[\r\n]/.test(sender) && address.split('@')[1]===domain && domain!=='resend.dev';
 const reasons=[];
 if(!key)reasons.push('provider_not_configured');
 if(!/^[a-f0-9]{64}$/i.test(metadataKey))reasons.push('metadata_key_required');
 if(!validDomain || !senderValid)reasons.push('verified_sender_required');
 if(env.RESEND_FREE_PLAN_CONFIRMED!=='true')reasons.push('free_plan_confirmation_required');
 return {ready:reasons.length===0,reasons,key,sender,domain,metadataKey};
}
export function mailEventKey(event:string,secret:string) {
 if(!event || event.length>2048 || secret.length<32)throw new Error('Invalid mail event configuration');
 return 'jd-'+createHmac('sha256',secret).update(event).digest('hex');
}
const events:Record<string,MailStatus>={'email.sent':'accepted','email.delivered':'delivered','email.delivery_delayed':'delayed','email.failed':'failed','email.bounced':'bounced','email.complained':'complained'};
export function mailEvent(raw:unknown) {
 if(!raw || typeof raw!=='object')throw new Error('Invalid mail event');
 const event=raw as {type?:unknown;created_at?:unknown;data?:{email_id?:unknown}};
 if(typeof event.type!=='string' || !Object.hasOwn(events,event.type))return null;
 if(typeof event.data?.email_id!=='string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(event.data.email_id) || typeof event.created_at!=='string')throw new Error('Invalid mail event');
 const time=new Date(event.created_at);if(!Number.isFinite(time.getTime()))throw new Error('Invalid mail event time');
 return {providerId:event.data.email_id,status:events[event.type],eventTime:time.toISOString()};
}
export function nextMailStatus(current:MailStatus,incoming:MailStatus,eventTime:string,lastEventTime?:string|null):MailStatus {
 if(current==='complained' || incoming==='complained')return 'complained';
 if(lastEventTime && new Date(eventTime).getTime()<new Date(lastEventTime).getTime())return current;
 if(current==='bounced')return current;
 if(current==='delivered' && ['accepted','delayed'].includes(incoming))return current;
 return incoming;
}
