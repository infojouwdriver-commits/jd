import {contractPeriod,todayInBrussels} from '@/lib/contract-terms';
import {generateContractHTML} from '@/lib/contract-template';
import {createHmac} from 'node:crypto';
import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {generateAdminUserToken,getAuthRoles} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {companyRegistrationSchema} from '@/lib/company-registration';
import {transformSecrets} from '@/lib/secret-vault';
import {hashString} from '@/lib/server-utils';
import {consumeRateLimit} from '@/lib/rate-limit';
export const POST=requestMiddleware(async request=>{
 const parsed=companyRegistrationSchema.safeParse(await validateRequestBody(request));
 if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Check the registration fields'});
 const v=parsed.data;const limited=await consumeRateLimit('company-registration:'+v.company_email,3);if(limited)return limited;
 try{
  const key=process.env.DATA_ENCRYPTION_KEY||'';if(!/^[a-f0-9]{64}$/i.test(key))throw Error('Encryption unavailable');
  const fingerprint=createHmac('sha256',key).update(JSON.stringify(v)).digest('hex');
  const company=transformSecrets('companies',{name:v.company_name,email:v.company_email,phone:v.company_phone,address:v.company_address,vat_number:v.vat_number,kbo_number:v.kbo_number,chiron_test_client_id:v.chiron_test_client_id,chiron_test_client_secret:v.chiron_test_client_secret,chiron_prod_client_id:v.chiron_prod_client_id,chiron_prod_client_secret:v.chiron_prod_client_secret},true);
  const payload={subscription_offer:v.subscription_offer,subscription_acknowledged:v.subscription_acknowledged,company,vehicle:{brand:v.vehicle_brand,model:v.vehicle_model,plate_number:v.plate_number,vin:v.vin,chiron_vehicle_id:v.chiron_vehicle_id},driver:{full_name:v.driver_name,phone:v.driver_phone,driver_license:v.driver_license,bestuurderspas_number:v.bestuurderspas,preferred_language:v.language},manager_hash:await hashString(v.company_password),driver_hash:await hashString(v.driver_password),user_role:getAuthRoles().userRole};
  const result=await createPostgrestClient(await generateAdminUserToken()).rpc('security_submit_company_subscription',{p_request:v.request_id,p_fingerprint:fingerprint,p_data:payload});
  if(result.error)return createErrorResponse({status:result.error.code==='23505'?409:503,errorMessage:result.error.code==='23505'?'Registration already exists; contact administration':'Registration temporarily unavailable'});
  return createSuccessResponse(result.data,201);
 }catch{return createErrorResponse({status:503,errorMessage:'Registration temporarily unavailable'});}
},false);
export const GET=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 const q=request.nextUrl.searchParams,offset=Number(q.get('offset')||0),status=q.get('status')||'pending';
 if(!Number.isSafeInteger(offset)||offset<0||offset>100000||!['pending','approved','rejected','all'].includes(status))return createErrorResponse({status:400,errorMessage:'Invalid filters'});
 try{let query=createPostgrestClient(await generateAdminUserToken()).from('company_registrations').select('request_id,company_id,driver_id,vehicle_id,subscription_offer,status,submitted_at,reviewed_at,review_notes,company_name,company_email,company_phone,vat_number,kbo_number,company_address,driver_name,driver_phone,driver_license,bestuurderspas,plate_number,vehicle_brand,vehicle_model,vin,language,test_configured,production_configured',{count:'exact'}).order('submitted_at',{ascending:false}).order('request_id',{ascending:false});if(status!=='all')query=query.eq('status',status);const r=await query.range(offset,offset+24);if(r.error)throw Error();return createSuccessResponse({requests:r.data,total:r.count,next_offset:offset+(r.data?.length||0)<(r.count||0)?offset+(r.data?.length||0):null});}catch{return createErrorResponse({status:503,errorMessage:'Registrations unavailable'});}
},true);
const review=z.object({request_id:z.string().uuid(),action:z.enum(['approve','reject']),notes:z.string().trim().max(1000)}).strict();
export const PUT=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 const p=review.safeParse(await validateRequestBody(request));if(!p.success||p.data.action==='reject'&&!p.data.notes)return createErrorResponse({status:400,errorMessage:'Review details required'});
 try{const client=createPostgrestClient(await generateAdminUserToken());
 const request=await client.from('company_registrations').select('company_name,vat_number,kbo_number,language').eq('request_id',p.data.request_id).maybeSingle();if(request.error)throw request.error;
 if(!request.data)return createErrorResponse({status:404,errorMessage:'Request missing'});
 const period=contractPeriod(todayInBrussels(),12);
 const html=generateContractHTML({contractNumber:'JD-'+p.data.request_id,companyName:request.data.company_name,companyVAT:request.data.vat_number,companyKBO:request.data.kbo_number,...period,monthlyFee:50,annualFee:600,language:request.data.language==='nl'?'nl':'fr',grossBilling:{vatBps:2100,autoRenew:false}});
 const r=await client.rpc('security_review_company_subscription',{p_request:p.data.request_id,p_action:p.data.action,p_notes:p.data.notes,p_reviewer:Number(context.payload.sub),p_html:html,p_start:period.startDate,p_end:period.endDate});if(r.error)return createErrorResponse({status:r.error.code==='P0002'?404:r.error.code==='40001'?409:503,errorMessage:'Review could not be completed; refresh the request'});return createSuccessResponse(r.data);}catch{return createErrorResponse({status:503,errorMessage:'Review unavailable'});}
},true);
