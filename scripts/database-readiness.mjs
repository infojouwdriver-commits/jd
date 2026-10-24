import {createHmac} from 'node:crypto';
const env=process.env;const required=['POSTGREST_URL','POSTGREST_SCHEMA','SCHEMA_ADMIN_USER','JWT_SECRET'];for(const key of required)if(!env[key])throw new Error(`Missing ${key}`);
const base=new URL(env.POSTGREST_URL);if(base.protocol!=='https:'&&!(env.POSTGREST_INTERNAL_NETWORK==='true'&&base.origin==='http://postgrest:3000'))throw new Error('Private database transport required');
const now=Math.floor(Date.now()/1000);const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const input=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:'0',role:env.SCHEMA_ADMIN_USER,iat:now,exp:now+60,aud:'jouw-driver'});const token=input+'.'+createHmac('sha256',env.JWT_SECRET).update(input).digest('base64url');
const headers={Authorization:'Bearer '+token,'Accept-Profile':env.POSTGREST_SCHEMA,'Postgrest-API-Key':env.POSTGREST_API_KEY||''};
const checks=[['contract_signatures','id,email_link_evidence'],['app_experience_settings','id,version,poster_data'],['driver_shift_activity','id,shift_id,kind,trip_id'],['driver_shifts','id,user_id,vehicle_id,odometer,passenger_km,ended_at,document_profile,document_summary'],['driver_shift_events','request_id,shift_id,version'],['users','id,security_revoked_before'],['refresh_tokens','id,mfa_verified'],['trips','id,completion_request_key,is_test,shift_id'],['companies','id,archived_at,is_test'],['subscription_documents','id,document_number,state,contract_id,contract_number,installment_number'],['company_contracts','id,billing_model,monthly_gross_cents,vat_bps'],['company_registrations','request_id,subscription_offer'],['subscription_billing_profiles','company_id,contract_id,installment_index'],['company_change_requests','id,status'],['subscription_billing_settings','id,default_vat_bps'],['subscription_payments','request_id,payment_method'],['company_staff_events','id'],['subscription_scheduler_state','id'],['security_rate_limits','bucket_key'],['security_mfa_claims','user_id,step']];
for(const [table,columns] of checks){const url=new URL(env.POSTGREST_URL.replace(/\/$/,'')+'/'+table);url.searchParams.set('select',columns);url.searchParams.set('limit','0');const r=await fetch(url,{headers,redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error(`Database release check failed for ${table} (${r.status}); verify grants, migrations and PostgREST schema cache`);}
{
 const url=new URL(env.POSTGREST_URL.replace(/\/$/,'')+'/rpc/security_company_platform_ready');
 const r=await fetch(url,{method:'POST',headers:{...headers,'Content-Profile':env.POSTGREST_SCHEMA,'Content-Type':'application/json'},body:'{}',redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!r.ok||await r.json()!==true)throw Error('Company lifecycle and subscription migration is required; startup refused');
}
if(env.DEPLOYMENT_MODE==='production'&&env.SCHEMA_SOURCE==='independent'){
 const url=new URL(env.POSTGREST_URL.replace(/\/$/,'')+'/rpc/independent_schema_ready');
 const r=await fetch(url,{method:'POST',headers:{...headers,'Content-Profile':env.POSTGREST_SCHEMA,'Content-Type':'application/json'},body:'{}',redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!r.ok||await r.json()!==true)throw Error('Independent schema constraints are missing or unvalidated; production startup refused');
}
console.log('Database release columns and service access verified. Provider integration and restore acceptance remain separate checks.');
