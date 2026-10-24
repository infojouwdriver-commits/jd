import {z} from 'zod';
import {requestMiddleware,validateRequestBody,getRequestIp} from './api-utils';
import {createSuccessResponse,createErrorResponse} from './create-response';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {readContractEmailLink} from './contract-email-link';
import {contractSigningCopy,contractSigningLanguage} from './contract-signing-copy';
import {contractInvitation} from './contract-invitation';
import {sendTransactionalMail} from './mail-service';
import {mailConfiguration} from './mail-policy';
import {consumeRateLimit} from './rate-limit';
const review=z.object({signature_token:z.string().max(2048)}).strict();
const signature=review.extend({signer_name:z.string().trim().min(2).max(160),signer_position:z.string().trim().min(2).max(120),consent:z.literal(true)});
export function emailContractHandler(action:'review'|'sign'){
 return requestMiddleware(async request=>{
  const parsed=(action==='review'?review:signature).safeParse(await validateRequestBody(request));
  if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Review required signature fields'});
  let invite;try{invite=readContractEmailLink(parsed.data.signature_token,process.env.JWT_SECRET||'');}catch{return createErrorResponse({status:410,errorMessage:'Invitation unavailable. Request a new link.'});}
  const limited=await consumeRateLimit('contract-email:'+invite.request,30);if(limited)return limited;
  const v=action==='sign'?signature.parse(parsed.data):null;
  try{
   const client=createPostgrestClient(await generateAdminUserToken());
   // The transaction checks active owner/email, expiry, revision, digest and replay together.
   const reviewed=await client.rpc('security_email_contract',{p_action:'review',p_company:invite.company,p_contract:invite.contract,p_actor:invite.owner,p_request:invite.request,p_email:invite.email,p_expected:invite.revision,p_digest:invite.digest,p_expires:new Date(invite.expires).toISOString(),p_name:null,p_position:null,p_ip:null,p_agent:null,p_consent:null});
   if(reviewed.error)throw reviewed.error;
   let data=reviewed.data;
   if(v){
    const language=contractSigningLanguage(data.contract.contract_language);
    const result=await client.rpc('security_email_contract',{p_action:'sign',p_company:invite.company,p_contract:invite.contract,p_actor:invite.owner,p_request:invite.request,p_email:invite.email,p_expected:invite.revision,p_digest:invite.digest,p_expires:new Date(invite.expires).toISOString(),p_name:v.signer_name,p_position:v.signer_position,p_ip:getRequestIp(request),p_agent:(request.headers.get('user-agent')||'').slice(0,1000),p_consent:contractSigningCopy[language].consent});
    if(result.error)throw result.error;
    data=result.data;
    // Persisted signature is independent of mail transport; retry uses the same mail events.
    let accepted=false;
    try{
     const content=contractInvitation(data.contract,data.company,process.env.APP_ORIGIN||'',parsed.data.signature_token);
     const esc=(s:unknown)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
     const heading=contractSigningCopy[language].saved;
     const text=`${heading}\n${data.evidence.signer_name}\n${data.evidence.signer_email}\n${data.evidence.signed_at}\nSHA-256: ${data.digest}\n${content.text}`;
     const html=content.html.replace('<main style=',`<p>${esc(heading)}</p><p>${esc(data.evidence.signer_name)} · ${esc(data.evidence.signer_email)} · ${esc(data.evidence.signed_at)}</p><p>SHA-256: ${esc(data.digest)}</p><main style=`);
     const config=mailConfiguration(process.env),sender=config.sender.match(/<([^>]+)>/)?.[1]||config.sender;
     const recipients=[...new Set([invite.email,sender].filter(Boolean))];
     accepted=true;
     for(const to of recipients){const sent=await sendTransactionalMail({to,subject:'JOUW DRIVER — '+data.contract.contract_number.replace(/[\r\n]/g,' ')+' — '+heading,text,html,purpose:'contract_confirmation',event:`contract-confirmation:${invite.request}:${to}`});accepted=accepted&&sent.accepted;}
    }catch{accepted=false;}
    data={...data,confirmation_accepted:accepted};
   }
   return createSuccessResponse(data);
  }catch(error){const code=(error as {code?:string})?.code;return createErrorResponse({status:['40001','23514','42501','P0002','22023'].includes(code||'')?409:503,errorMessage:'Contract unavailable or changed. Request a new invitation.'});}
 },false);
}
