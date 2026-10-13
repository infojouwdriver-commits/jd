const env = process.env;
const errors=[];
for (const key of ['APP_ORIGIN','POSTGREST_URL','POSTGREST_SCHEMA','SCHEMA_USER','SCHEMA_ADMIN_USER','JWT_SECRET','HASH_SALT_KEY','RATE_LIMIT_SECRET','DATA_ENCRYPTION_KEY','PLATFORM_ADMIN_IDS','PRIVACY_CONTACT_EMAIL','PRIVACY_CONTROLLER_ADDRESS']) if (!env[key]) errors.push(`${key} required`);
for (const key of ['JWT_SECRET','HASH_SALT_KEY','RATE_LIMIT_SECRET']) if ((env[key] || '').length<32) errors.push(`${key} needs at least 32 random characters`);
if (!/^[a-f0-9]{64}$/i.test(env.DATA_ENCRYPTION_KEY || '')) errors.push('DATA_ENCRYPTION_KEY must be 64 hex characters');
for (const key of ['APP_ORIGIN','POSTGREST_URL']) {
 try {
  const url=new URL(env[key]);
  const internal=key==='POSTGREST_URL' && env.POSTGREST_INTERNAL_NETWORK==='true' && url.origin==='http://postgrest:3000' && url.pathname==='/' && !url.search && !url.hash && !url.username && !url.password;
  if(url.protocol!=='https:'&&!internal) errors.push(`${key} must use HTTPS or the declared private Docker gateway`);
 } catch {errors.push(`${key} invalid`);}
}
if (!['staging','production'].includes(env.DEPLOYMENT_MODE || '')) errors.push('Set DEPLOYMENT_MODE to staging or production');
if (env.DEPLOYMENT_MODE==='production' && env.SCHEMA_VALIDATED!=='true') errors.push('Production requires a verified schema and SCHEMA_VALIDATED=true');
if (env.DEPLOYMENT_MODE==='production' && !['independent','zoer-verified'].includes(env.SCHEMA_SOURCE||'')) errors.push('Production requires SCHEMA_SOURCE=independent or zoer-verified');
if(env.TRIAL_MODE==='true') errors.push('Hosted trial configuration cannot be used for this release');
if(!/^[0-9]+(?:,[0-9]+)*$/.test(env.PLATFORM_ADMIN_IDS||'')) errors.push('PLATFORM_ADMIN_IDS must be reviewed numeric user IDs');
if (env.TRUST_PROXY!=='true') errors.push('Configure a trusted proxy that overwrites x-real-ip, then set TRUST_PROXY=true');
if (!Number.isInteger(Number(env.TRIP_RETENTION_YEARS)) || Number(env.TRIP_RETENTION_YEARS)<1 || Number(env.TRIP_RETENTION_YEARS)>20) errors.push('Set documented TRIP_RETENTION_YEARS (1..20) after legal review');
try {
 const secrets=JSON.parse(env.ADMIN_TOTP_SECRETS_JSON||'{}');
 for(const id of (env.PLATFORM_ADMIN_IDS||'').split(',').filter(Boolean)) if(typeof secrets[id]!=='string'||!/^[A-Z2-7]{32,128}$/.test(secrets[id]))errors.push(`Enroll administrator MFA for user ${id}`);
} catch {errors.push('ADMIN_TOTP_SECRETS_JSON invalid');}
const mailKeys=['RESEND_KEY','RESEND_FROM_EMAIL','RESEND_VERIFIED_DOMAIN','RESEND_WEBHOOK_SECRET','MAIL_METADATA_KEY'];
const mailConfigured=mailKeys.some(key=>(env[key]||'').trim()) || env.RESEND_FREE_PLAN_CONFIRMED==='true';
if(mailConfigured){
 const domain=(env.RESEND_VERIFIED_DOMAIN||'').trim().toLowerCase();
 const sender=(env.RESEND_FROM_EMAIL||'').trim();
 const address=sender.match(/^(?:[^<>\r\n]+<)?([^<>\s]+@[^<>\s]+)>?$/)?.[1]?.toLowerCase();
 if(!(env.RESEND_KEY||'').trim())errors.push('RESEND_KEY required when transactional mail is configured');
 if(!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)||domain==='resend.dev'||!address||address.split('@')[1]!==domain||/[\r\n]/.test(sender))errors.push('Transactional mail requires a sender on RESEND_VERIFIED_DOMAIN');
 if(env.RESEND_FREE_PLAN_CONFIRMED!=='true')errors.push('Set RESEND_FREE_PLAN_CONFIRMED=true only after confirming the provider plan');
 if(!(env.RESEND_WEBHOOK_SECRET||'').trim())errors.push('RESEND_WEBHOOK_SECRET required to verify delivery events');
 if(!/^[a-f0-9]{64}$/i.test((env.MAIL_METADATA_KEY||env.DATA_ENCRYPTION_KEY||'').trim()))errors.push('MAIL_METADATA_KEY or DATA_ENCRYPTION_KEY must provide 64 hex characters');
}
console.log(errors.length ? errors.join('\n') : 'Configuration syntax checks passed. Database, provider agreements and deployment controls require separate verification.');
process.exitCode=errors.length ? 1 : 0;
