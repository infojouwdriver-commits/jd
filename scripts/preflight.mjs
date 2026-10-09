const env = process.env;
const errors=[];
for (const key of ['APP_ORIGIN','POSTGREST_URL','POSTGREST_SCHEMA','POSTGREST_API_KEY','SCHEMA_USER','SCHEMA_ADMIN_USER','JWT_SECRET','HASH_SALT_KEY','RATE_LIMIT_SECRET','DATA_ENCRYPTION_KEY','PLATFORM_ADMIN_IDS','PRIVACY_CONTACT_EMAIL','PRIVACY_CONTROLLER_ADDRESS']) if (!env[key]) errors.push(`${key} required`);
for (const key of ['JWT_SECRET','HASH_SALT_KEY','RATE_LIMIT_SECRET']) if ((env[key] || '').length<32) errors.push(`${key} needs at least 32 random characters`);
if (!/^[a-f0-9]{64}$/i.test(env.DATA_ENCRYPTION_KEY || '')) errors.push('DATA_ENCRYPTION_KEY must be 64 hex characters');
for (const key of ['APP_ORIGIN','POSTGREST_URL']) {try {if(new URL(env[key]).protocol!=='https:') errors.push(`${key} must use HTTPS`);} catch {errors.push(`${key} invalid`);}}
if (env.TRUST_PROXY!=='true') errors.push('Configure a trusted proxy that overwrites x-real-ip, then set TRUST_PROXY=true');
if (!Number.isInteger(Number(env.TRIP_RETENTION_YEARS)) || Number(env.TRIP_RETENTION_YEARS)<1 || Number(env.TRIP_RETENTION_YEARS)>20) errors.push('Set documented TRIP_RETENTION_YEARS (1..20) after legal review');
console.log(errors.length ? errors.join('\n') : 'Configuration syntax checks passed. Database, provider agreements and deployment controls require separate verification.');
process.exitCode=errors.length ? 1 : 0;
