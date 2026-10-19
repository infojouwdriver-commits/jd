import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const base={
 APP_ORIGIN:'https://app.example.invalid',
 POSTGREST_URL:'http://postgrest:3000',
 POSTGREST_INTERNAL_NETWORK:'true',
 POSTGREST_SCHEMA:'public',
 SCHEMA_USER:'app_user',
 SCHEMA_ADMIN_USER:'service_user',
 JWT_SECRET:'j'.repeat(32),
 HASH_SALT_KEY:'h'.repeat(32),
 RATE_LIMIT_SECRET:'r'.repeat(32),
 DATA_ENCRYPTION_KEY:'a'.repeat(64),
 PLATFORM_ADMIN_IDS:'1',
 PRIVACY_CONTACT_EMAIL:'privacy@example.invalid',
 PRIVACY_CONTROLLER_ADDRESS:'Synthetic address',
 DEPLOYMENT_MODE:'staging',
 TRUST_PROXY:'true',
 TRIP_RETENTION_YEARS:'7',
 ADMIN_TOTP_SECRETS_JSON:JSON.stringify({1:'A'.repeat(32)}),
};

function preflight(overrides={}){
 return spawnSync(process.execPath,['scripts/preflight.mjs'],{
  cwd:new URL('..',import.meta.url),
  env:{...base,...overrides},
  encoding:'utf8',
 });
}

test('transactional mail may remain explicitly disabled',()=>{
 const result=preflight();
 assert.equal(result.status,0,result.stdout+result.stderr);
});

test('partial transactional mail configuration fails closed',()=>{
 const result=preflight({RESEND_KEY:'synthetic-key'});
 assert.equal(result.status,1);
 assert.match(result.stdout,/sender on RESEND_VERIFIED_DOMAIN/);
 assert.match(result.stdout,/RESEND_WEBHOOK_SECRET required/);
 assert.match(result.stdout,/RESEND_FREE_PLAN_CONFIRMED/);
});

test('complete synthetic transactional mail configuration passes syntax checks',()=>{
 const result=preflight({
  RESEND_KEY:'synthetic-key',
  RESEND_FROM_EMAIL:'Jouw Driver <noreply@example.invalid>',
  RESEND_VERIFIED_DOMAIN:'example.invalid',
  RESEND_FREE_PLAN_CONFIRMED:'true',
  RESEND_WEBHOOK_SECRET:'synthetic-webhook-secret',
  MAIL_METADATA_KEY:'b'.repeat(64),
 });
 assert.equal(result.status,0,result.stdout+result.stderr);
});

test('Brevo cannot start with an unverified sender or unauthenticated delivery events',()=>{
 const result=preflight({MAIL_PROVIDER:'brevo',BREVO_API_KEY:'synthetic-key',BREVO_FROM_EMAIL:'sender@example.invalid'});
 assert.equal(result.status,1);assert.match(result.stdout,/Verified Brevo sender required/);assert.match(result.stdout,/Confirmed Brevo free plan required/);assert.match(result.stdout,/Brevo delivery webhook token required/);
});
test('complete synthetic Brevo free plan configuration preserves the existing runtime',()=>{
 const result=preflight({MAIL_PROVIDER:'brevo',BREVO_API_KEY:'synthetic-key',BREVO_FROM_EMAIL:'sender@example.invalid',BREVO_SENDER_VERIFIED:'true',BREVO_FREE_PLAN_CONFIRMED:'true',BREVO_WEBHOOK_TOKEN:'w'.repeat(48)});
 assert.equal(result.status,0,result.stdout+result.stderr);
});
