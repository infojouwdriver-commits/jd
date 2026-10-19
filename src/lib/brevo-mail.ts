import {createHash,timingSafeEqual} from 'node:crypto';
/** Provider UUID derives from the private ledger key; it never changes ledger identity. */
export function brevoIdempotencyKey(eventKey:string) {
 if(!/^jd-[a-f0-9]{64}$/.test(eventKey))throw new Error('Invalid mail event key');
 const bytes=Buffer.from(eventKey.slice(3,35),'hex');
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const h=bytes.toString('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
/** Namespaced UUID keeps existing private delivery ledger and Resend history unchanged. */
export function brevoProviderId(raw:unknown) {
 if(typeof raw!=='string'||raw.length>512||/[\r\n]/.test(raw))throw new Error('Invalid Brevo message ID');
 const id=raw.trim().replace(/^<|>$/g,'');
 if(!id||!id.includes('@'))throw new Error('Invalid Brevo message ID');
 const bytes=createHash('sha256').update('brevo:'+id).digest().subarray(0,16);
 bytes[6]=(bytes[6]&15)|80;bytes[8]=(bytes[8]&63)|128;
 const h=bytes.toString('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
export function brevoWebhookAuthorized(header:string|null,secret:string|undefined) {
 if(!secret||secret.length<32||!header||header.length>1024)return false;
 return timingSafeEqual(createHash('sha256').update(header).digest(),createHash('sha256').update('Bearer '+secret).digest());
}
export function brevoMailEvent(raw:unknown) {
 if(!raw||typeof raw!=='object')throw new Error('Invalid mail event');
 const event=raw as Record<string,unknown>;
 const statuses={request:'accepted',sent:'accepted',delivered:'delivered',deferred:'delayed',soft_bounce:'delayed',hard_bounce:'bounced',blocked:'failed',invalid_email:'failed',error:'failed',spam:'complained'} as const;
 if(typeof event.event!=='string'||!Object.hasOwn(statuses,event.event))return null;
 const seconds=event.ts_event??event.ts;
 if(typeof seconds!=='number'||!Number.isFinite(seconds)||seconds<=0)throw new Error('Invalid mail event time');
 const time=new Date(seconds*1000);if(!Number.isFinite(time.getTime()))throw new Error('Invalid mail event time');
 const providerId=brevoProviderId(event['message-id']);
 const status=statuses[event.event as keyof typeof statuses];
 const eventTime=time.toISOString();
 return {providerId,status,eventTime,eventId:'brevo-'+createHash('sha256').update(JSON.stringify([providerId,event.event,eventTime])).digest('hex')};
}
