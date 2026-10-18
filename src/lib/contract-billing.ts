import {z} from 'zod';
import {requestMiddleware,validateRequestBody,getRequestIp} from './api-utils';
import {operationsAccess,operationFailure,pageRange} from './operations-access';
import {createSuccessResponse,createErrorResponse} from './create-response';
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('sign'),contract_id:z.number().int().positive(),request_id:z.string().uuid(),expected:z.string().datetime({offset:true}),signer_name:z.string().trim().min(2).max(160),signer_position:z.string().trim().max(120),consent:z.literal(true)}).strict(),
 z.object({action:z.literal('link'),contract_id:z.number().int().positive()}).strict(),
]);
export const contractBillingGET=requestMiddleware(async(request,context)=>{
 try{
  const {client,companyId,actor,admin}=await operationsAccess(request,context,'billing');
  const {offset,limit}=pageRange(request);
  const contracts=await client.from('company_contracts').select('id,company_id,contract_number,contract_status,contract_start_date,contract_end_date,contract_duration_months,monthly_fee,annual_fee,billing_model,monthly_gross_cents,vat_bps,contract_html_template,signed_at,updated_at',{count:'exact'}).eq('company_id',companyId).order('id',{ascending:false}).range(offset,offset+Math.min(limit,10)-1);
  if(contracts.error)throw contracts.error;
  const membership=admin?{data:[],error:null}:await client.from('company_users').select('role').eq('company_id',companyId).eq('user_id',actor).eq('is_active',true).limit(10);
  if(membership.error)throw membership.error;
  return createSuccessResponse({rows:contracts.data,total:contracts.count,can_sign:!admin&&membership.data.some(m=>['owner','portal_owner'].includes(m.role))});
 }catch(e){return operationFailure(e);}
},true);
export const contractBillingPOST=requestMiddleware(async(request,context)=>{
 try{
  const {client,companyId,actor,admin}=await operationsAccess(request,context,'billing');
  const v=command.parse(await validateRequestBody(request));
  if(v.action==='link'&&!admin||v.action==='sign'&&admin)return createErrorResponse({status:403,errorMessage:'Permission denied'});
  const result=v.action==='sign'?await client.rpc('security_sign_company_contract',{p_company:companyId,p_contract:v.contract_id,p_actor:actor,p_request:v.request_id,p_name:v.signer_name,p_position:v.signer_position,p_ip:getRequestIp(request),p_agent:(request.headers.get('user-agent')||'').slice(0,1000),p_expected:v.expected}):await client.rpc('security_activate_contract_billing',{p_company:companyId,p_contract:v.contract_id,p_actor:actor});
  if(result.error)throw result.error;
  return createSuccessResponse(result.data);
 }catch(e){if(e instanceof z.ZodError)return createErrorResponse({status:400,errorMessage:'Review signature and contract fields'});return operationFailure(e);}
},true);
