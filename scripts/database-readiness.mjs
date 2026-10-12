import {createHmac} from 'node:crypto';
const env=process.env;const required=['POSTGREST_URL','POSTGREST_SCHEMA','SCHEMA_ADMIN_USER','JWT_SECRET'];for(const key of required)if(!env[key])throw new Error(`Missing ${key}`);
const base=new URL(env.POSTGREST_URL);if(base.protocol!=='https:'&&!(env.POSTGREST_INTERNAL_NETWORK==='true'&&base.origin==='http://postgrest:3000'))throw new Error('Private database transport required');
const now=Math.floor(Date.now()/1000);const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const input=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:'0',role:env.SCHEMA_ADMIN_USER,iat:now,exp:now+60,aud:'jouw-driver'});const token=input+'.'+createHmac('sha256',env.JWT_SECRET).update(input).digest('base64url');
const headers={Authorization:'Bearer '+token,'Accept-Profile':env.POSTGREST_SCHEMA,'Postgrest-API-Key':env.POSTGREST_API_KEY||''};
const checks=[['users','id,security_revoked_before'],['refresh_tokens','id,mfa_verified'],['trips','id,completion_request_key'],['security_rate_limits','bucket_key'],['security_mfa_claims','user_id,step']];
for(const [table,columns] of checks){const url=new URL(env.POSTGREST_URL.replace(/\/$/,'')+'/'+table);url.searchParams.set('select',columns);url.searchParams.set('limit','0');const r=await fetch(url,{headers,redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error(`Database release check failed for ${table} (${r.status}); verify grants, migrations and PostgREST schema cache`);}
{
 const url=new URL(env.POSTGREST_URL.replace(/\/$/,'')+'/rpc/security_portal_release_ready');
 const r=await fetch(url,{method:'POST',headers:{...headers,'Content-Profile':env.POSTGREST_SCHEMA,'Content-Type':'application/json'},body:'{}',redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!r.ok||await r.json()!==true)throw Error('Company account and messaging migration is required; startup refused');
}
if(env.DEPLOYMENT_MODE==='production'&&env.SCHEMA_SOURCE==='independent'){
 const url=new URL(env.POSTGREST_URL.replace(/\/$/,'')+'/rpc/independent_schema_ready');
 const r=await fetch(url,{method:'POST',headers:{...headers,'Content-Profile':env.POSTGREST_SCHEMA,'Content-Type':'application/json'},body:'{}',redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!r.ok||await r.json()!==true)throw Error('Independent schema constraints are missing or unvalidated; production startup refused');
}
console.log('Database release columns and service access verified. Provider integration and restore acceptance remain separate checks.');
