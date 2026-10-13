import test from 'node:test';import assert from 'node:assert/strict';
import {mailConfiguration,mailEventKey,mailEvent,nextMailStatus,MAIL_FREE_LIMITS} from '../src/lib/mail-policy.ts';
const env={DATA_ENCRYPTION_KEY:'a'.repeat(64),RESEND_KEY:'synthetic-key',RESEND_FROM_EMAIL:'Jouw Driver <noreply@example.invalid>',RESEND_VERIFIED_DOMAIN:'example.invalid',RESEND_FREE_PLAN_CONFIRMED:'true'};
test('mail requires an explicit verified sender and free plan before sending',()=>{
 assert.equal(mailConfiguration(env).ready,true);
 for(const change of [{DATA_ENCRYPTION_KEY:''},{RESEND_KEY:''},{RESEND_FREE_PLAN_CONFIRMED:'false'},{RESEND_FROM_EMAIL:'onboarding@resend.dev'},{RESEND_FROM_EMAIL:'noreply@another.invalid'},{RESEND_FROM_EMAIL:'sender@example.invalid\r\nBcc: outsider@example.invalid'}])assert.equal(mailConfiguration({...env,...change}).ready,false);
 assert.ok(MAIL_FREE_LIMITS.daily<100);assert.ok(MAIL_FREE_LIMITS.monthly<3000);
});
test('mail keys stay stable for a logical event without exposing addresses or codes',()=>{
 const key=mailEventKey('verification:synthetic@example.invalid:123456','a'.repeat(32));assert.equal(key,mailEventKey('verification:synthetic@example.invalid:123456','a'.repeat(32)));assert.equal(key.includes('123456'),false);assert.equal(key.includes('synthetic'),false);assert.notEqual(key,mailEventKey('verification:synthetic@example.invalid:654321','a'.repeat(32)));assert.throws(()=>mailEventKey('event','short'));
});
test('only explicit delivery events become delivery proof; unknown tracking is ignored',()=>{
 const event={type:'email.delivered',created_at:'2026-01-01T12:00:00Z',data:{email_id:'00000000-0000-4000-8000-000000000001'}};
 assert.equal(mailEvent(event).status,'delivered');assert.equal(mailEvent({...event,type:'email.sent'}).status,'accepted');assert.equal(mailEvent({...event,type:'email.opened'}),null);assert.throws(()=>mailEvent({...event,created_at:'invalid'}));assert.throws(()=>mailEvent({...event,data:{email_id:'invalid'}}));
});
test('out of order events never downgrade a delivery or erase a complaint',()=>{
 assert.equal(nextMailStatus('delivered','accepted','2026-01-02','2026-01-01'),'delivered');assert.equal(nextMailStatus('delivered','delayed','2026-01-02','2026-01-01'),'delivered');assert.equal(nextMailStatus('accepted','delivered','2026-01-01','2026-01-02'),'accepted');assert.equal(nextMailStatus('delivered','bounced','2026-01-02','2026-01-01'),'bounced');assert.equal(nextMailStatus('complained','delivered','2026-01-02'),'complained');
});
