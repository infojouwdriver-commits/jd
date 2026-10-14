// Runs only inside the accepted app container. No token, key or database row is logged.
import {createHmac,createDecipheriv} from 'node:crypto';

export async function probeProduction({env=process.env,companyId,fetchImpl=fetch,now=Date.now}={}) {
  if(!/^[1-9]\d{0,8}$/.test(String(companyId)) || env.POSTGREST_URL!=='http://postgrest:3000' || env.POSTGREST_SCHEMA!=='public' || env.SCHEMA_ADMIN_USER!=='jouw_service' || !env.JWT_SECRET || !/^[a-f0-9]{64}$/i.test(env.DATA_ENCRYPTION_KEY||''))throw Error('CHIRON_PROBE_CONFIGURATION');
  const encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url'),seconds=Math.floor(now()/1000);
  const signed=encode({alg:'HS256'})+'.'+encode({sub:'0',role:env.SCHEMA_ADMIN_USER,iss:'jouw-driver',aud:'jouw-driver',iat:seconds,exp:seconds+60});
  const jwt=signed+'.'+createHmac('sha256',env.JWT_SECRET).update(signed).digest('base64url');
  const read=async path=>{
    const r=await fetchImpl(env.POSTGREST_URL+path,{headers:{Authorization:'Bearer '+jwt,'Accept-Profile':'public'},redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw Error('CHIRON_PROBE_DATABASE');return r.json();
  };
  const rows=await read('/companies?id=eq.'+companyId+'&select=id,chiron_mode,chiron_prod_client_id,chiron_prod_client_secret,chiron_prod_auth_url');
  if(!Array.isArray(rows)||rows.length!==1||String(rows[0].id)!==String(companyId)||rows[0].chiron_mode!=='PRODUCTION')throw Error('CHIRON_PROBE_COMPANY_MODE');
  const company=rows[0],tests=await read('/test_trips?company_id=eq.'+companyId+'&select=sync_status,message_type,timestamp&order=id.desc&limit=10');
  if(!Array.isArray(tests)||tests.length!==10||tests.some(t=>t.sync_status!=='success'||!Number.isFinite(Date.parse(t.timestamp))||now()-Date.parse(t.timestamp)>7*86400000||Date.parse(t.timestamp)>now()+60000)||tests.filter(t=>t.message_type==='vertrek').length!==5||tests.filter(t=>t.message_type==='aankomst').length!==5)throw Error('CHIRON_TEST_ACCEPTANCE_REQUIRED');
  const authUrl=company.chiron_prod_auth_url||'https://mow.api.vlaanderen.be/oauth/token';
  if(authUrl!=='https://mow.api.vlaanderen.be/oauth/token')throw Error('CHIRON_PROBE_DESTINATION');
  if(typeof company.chiron_prod_client_id!=='string'||!company.chiron_prod_client_id||company.chiron_prod_client_id.length>512)throw Error('CHIRON_PROBE_CREDENTIALS');
  const stored=company.chiron_prod_client_secret;
  if(typeof stored!=='string'||!stored.startsWith('enc:v1:'))throw Error('CHIRON_PROBE_CREDENTIALS');
  const parts=stored.slice(7).split('.').map(v=>Buffer.from(v,'base64url'));
  if(parts.length!==3||parts[0].length!==12||parts[1].length!==16||!parts[2].length)throw Error('CHIRON_PROBE_CREDENTIALS');
  let secret;
  try {const cipher=createDecipheriv('aes-256-gcm',Buffer.from(env.DATA_ENCRYPTION_KEY,'hex'),parts[0]);cipher.setAAD(Buffer.from('companies.chiron_prod_client_secret'));cipher.setAuthTag(parts[1]);secret=Buffer.concat([cipher.update(parts[2]),cipher.final()]).toString('utf8');}
  catch {throw Error('CHIRON_PROBE_CREDENTIALS');}
  if(!secret||secret.length>4096)throw Error('CHIRON_PROBE_CREDENTIALS');
  let response;
  try {response=await fetchImpl(authUrl,{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded',Authorization:'Basic '+Buffer.from(company.chiron_prod_client_id+':'+secret).toString('base64')},body:new URLSearchParams({grant_type:'client_credentials'})});}
  catch {throw Error('CHIRON_PRODUCTION_AUTH_UNAVAILABLE');}
  if(!response.ok)throw Error('CHIRON_PRODUCTION_AUTH_REJECTED');
  let body;try {body=await response.json();}catch {throw Error('CHIRON_PRODUCTION_AUTH_RESPONSE');}
  if(typeof body.access_token!=='string'||!body.access_token||body.access_token.length>8192)throw Error('CHIRON_PRODUCTION_AUTH_RESPONSE');
  return {companyId:Number(companyId),testAcceptance:'verified',productionOAuth:'accepted',productionRideAcceptance:'not_yet_verified',checkedAt:new Date(now()).toISOString()};
}

if(process.env.CHIRON_PROBE_COMPANY_ID) {
  try {console.log(JSON.stringify(await probeProduction({companyId:process.env.CHIRON_PROBE_COMPANY_ID})));}
  catch(error) {console.error(/^CHIRON_[A-Z_]+$/.test(error.message)?error.message:'CHIRON_PRODUCTION_PROBE_FAILED');process.exitCode=1;}
}
