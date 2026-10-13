import test from 'node:test';
import assert from 'node:assert/strict';
import {createCipheriv} from 'node:crypto';
import {probeProduction} from '../chiron-production-probe.mjs';
const now=()=>Date.parse('2026-10-14T00:00:00Z');
const env={POSTGREST_URL:'http://postgrest:3000',POSTGREST_SCHEMA:'public',SCHEMA_ADMIN_USER:'jouw_service',JWT_SECRET:'synthetic-jwt-key',DATA_ENCRYPTION_KEY:'a'.repeat(64)};
function encrypted(){const nonce=Buffer.alloc(12,1),c=createCipheriv('aes-256-gcm',Buffer.from(env.DATA_ENCRYPTION_KEY,'hex'),nonce);c.setAAD(Buffer.from('companies.chiron_prod_client_secret'));const body=Buffer.concat([c.update('synthetic-production-key'),c.final()]);return 'enc:v1:'+[nonce,c.getAuthTag(),body].map(b=>b.toString('base64url')).join('.');}
function fixture({accepted=true,authStatus=200,token='synthetic-token',mode='PRODUCTION',authUrl,stored=encrypted()}={}){
 const calls=[];const fetchImpl=async(url,options)=>{calls.push({url,options});
  if(url.includes('/companies?'))return new Response(JSON.stringify([{id:1,chiron_mode:mode,chiron_prod_client_id:'synthetic-id',chiron_prod_client_secret:stored,chiron_prod_auth_url:authUrl}]));
  if(url.includes('/test_trips?'))return new Response(JSON.stringify(Array.from({length:10},(_,i)=>({sync_status:accepted?'success':'pending',message_type:i%2?'aankomst':'vertrek',timestamp:new Date(now()-60000).toISOString()}))));
  return new Response(JSON.stringify({access_token:token}),{status:authStatus});};
 return {calls,fetchImpl};
}
test('production probe verifies recent accepted TEST events and OAuth without posting a trip or returning credentials',async()=>{
 const f=fixture(),result=await probeProduction({env,companyId:1,fetchImpl:f.fetchImpl,now});
 assert.equal(result.productionOAuth,'accepted');assert.equal(result.productionRideAcceptance,'not_yet_verified');
 assert.equal(f.calls.length,3);assert.equal(f.calls[2].url,'https://mow.api.vlaanderen.be/oauth/token');assert.equal(f.calls[2].options.redirect,'error');assert.equal(f.calls[2].options.method,'POST');
 assert.ok(f.calls.every(c=>!c.url.includes('taxirit')));assert.doesNotMatch(JSON.stringify(result),/synthetic-token|synthetic-production-key|synthetic-id/);
});
test('missing acceptance, wrong mode/destination, plaintext credentials and rejected OAuth fail before activation',async()=>{
 for(const options of [{accepted:false},{mode:'TEST'},{authUrl:'https://attacker.invalid/oauth/token'},{stored:'plaintext-key'},{authStatus:401},{token:''}]){
  const f=fixture(options);await assert.rejects(probeProduction({env,companyId:1,fetchImpl:f.fetchImpl,now}),/^Error: CHIRON_/);
  assert.ok(f.calls.every(c=>!c.url.includes('attacker.invalid')&&!c.url.includes('taxirit')));
 }
});
test('invalid company and external database destinations are rejected without any fetch',async()=>{
 for(const options of [{companyId:'1;bad',env},{companyId:1,env:{...env,POSTGREST_URL:'https://external.invalid'}}]){
  const f=fixture();await assert.rejects(probeProduction({...options,fetchImpl:f.fetchImpl,now}));assert.equal(f.calls.length,0);
 }
});
