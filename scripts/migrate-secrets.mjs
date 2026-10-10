// Reads existing secrets from the configured server only. Prints counts, never values.
import {SignJWT} from 'jose';
import {transformSecrets} from '../src/lib/secret-vault.ts';
const env = process.env;
if (!env.POSTGREST_URL || !env.POSTGREST_SCHEMA || !env.SCHEMA_ADMIN_USER || !env.JWT_SECRET || !env.DATA_ENCRYPTION_KEY) throw new Error('Missing migration environment');
const url = new URL(env.POSTGREST_URL);
if (url.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('HTTPS required');
const token = await new SignJWT({sub:'0',role:env.SCHEMA_ADMIN_USER}).setProtectedHeader({alg:'HS256'}).setAudience('jouw-driver').setIssuedAt().setExpirationTime('5m').sign(new TextEncoder().encode(env.JWT_SECRET));
const headers = {'Authorization':`Bearer ${token}`, 'Postgrest-API-Key':env.POSTGREST_API_KEY || '', 'Accept-Profile':env.POSTGREST_SCHEMA, 'Content-Profile':env.POSTGREST_SCHEMA, 'Content-Type':'application/json'};
const apply = process.argv.includes('--apply');
for (const table of ['companies','chiron_settings']) {
 const fields = table === 'companies' ? ['chiron_test_client_secret','chiron_prod_client_secret'] : ['client_secret'];
 let offset=0, changed=0;
 while (true) {
  const response = await fetch(`${env.POSTGREST_URL}/${table}?select=id,${fields.join(',')}&order=id&limit=100&offset=${offset}`, {headers,redirect:'error',signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error(`Cannot read ${table}: ${response.status}`);
  const rows = await response.json(); if (!rows.length) break;
  for (const row of rows) {
   const legacy = Object.fromEntries(fields.filter(field => typeof row[field] === 'string' && row[field] && !row[field].startsWith('enc:v1:')).map(field => [field,row[field]]));
   if (!Object.keys(legacy).length) continue;
   const encrypted = transformSecrets(table,legacy,true); changed++;
   if (apply) {
    const result = await fetch(`${env.POSTGREST_URL}/${table}?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',headers,body:JSON.stringify(encrypted),redirect:'error',signal:AbortSignal.timeout(15000)});
    if (!result.ok) throw new Error(`Cannot migrate ${table}: ${result.status}`);
   }
  }
  offset += rows.length;
 }
 console.log(`${table}: ${changed} records ${apply ? 'migrated' : 'would be migrated (dry run)'}`);
}
