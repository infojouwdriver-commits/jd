import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {sendTransactionalMail} from '@/lib/mail-service';
import {mailConfiguration} from '@/lib/mail-policy';
import {contractDigest,issueContractEmailLink} from '@/lib/contract-email-link';
import {contractInvitation} from '@/lib/contract-invitation';
const command=z.object({contract_id:z.number().int().positive(),request_id:z.string().uuid()}).strict();
export const POST=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Admin access required'});
 try{
  const value=command.parse(await validateRequestBody(request));
  const client=createPostgrestClient(await generateAdminUserToken());
  const result=await client.from('company_contracts').select('id,company_id,contract_number,contract_language,monthly_fee,annual_fee,contract_status,signed_at,updated_at,contract_html_template').eq('id',value.contract_id).maybeSingle();
  if(result.error)throw result.error;
  const contract=result.data;
  if(!contract)return createErrorResponse({status:404,errorMessage:'العقد غير موجود'});
  if(contract.signed_at||contract.contract_status!=='pending_signature')return createErrorResponse({status:409,errorMessage:'الدعوة متاحة فقط لعقد بانتظار توقيع صاحب الشركة'});
  const companyResult=await client.from('companies').select('id,name,email,subscription_status,archived_at').eq('id',contract.company_id).maybeSingle();
  if(companyResult.error)throw companyResult.error;
  let company=companyResult.data;
  if(company&&!company.archived_at&&(company.subscription_status===null||company.subscription_status==='pending_contract')){
   const approved=await client.rpc('security_confirm_admin_company',{p_company:company.id,p_actor:Number(context.payload.sub)});
   if(approved.error) return createErrorResponse({status:409,errorMessage:'الشركة تحتاج مراجعة تسجيلها من الإدارة قبل التوقيع'});
   company={...company,subscription_status:'active'};
  }
  if(!company||company.archived_at||company.subscription_status!=='active')return createErrorResponse({status:409,errorMessage:'موافقة الإدارة على الشركة مطلوبة قبل دعوتها للتوقيع'});
  // Resolve the actual active owner identities; never send a signing invitation to an arbitrary billing contact.
  const memberships=await client.from('company_users').select('user_id').eq('company_id',company.id).eq('is_active',true).in('role',['owner','portal_owner']).limit(100);
  if(memberships.error)throw memberships.error;
  if(!memberships.data?.length)return createErrorResponse({status:409,errorMessage:'أنشئ حساب صاحب الشركة واربطه بالشركة قبل إرسال دعوة التوقيع'});
  const owners=await client.from('users').select('id,email').in('id',memberships.data.map(m=>m.user_id)).eq('is_active',true).limit(100);
  if(owners.error)throw owners.error;
  const owner=owners.data?.find(u=>u.email?.trim().toLowerCase()===company.email?.trim().toLowerCase())||(owners.data?.length===1?owners.data[0]:null);
  if(!owner?.email)return createErrorResponse({status:409,errorMessage:'يجب تحديد بريد حساب صاحب الشركة لتجنب إرسال الدعوة إلى شخص آخر'});
  if(!mailConfiguration(process.env).ready)return createErrorResponse({status:409,errorMessage:'البريد غير مفعّل بعد. يلزم إعداد مزود مجاني ومرسل معتمد؛ يستطيع صاحب الشركة التوقيع الآن من بوابة الشركة.'});
  const link=issueContractEmailLink({v:1,contract:contract.id,company:company.id,owner:owner.id,email:owner.email.trim().toLowerCase(),request:value.request_id,revision:contract.updated_at,digest:contractDigest(contract.contract_html_template||''),expires:Date.now()+72*3600000},process.env.JWT_SECRET||'');
  const content=contractInvitation(contract,company,process.env.APP_ORIGIN||'',link);
  const sent=await sendTransactionalMail({...content,to:owner.email,purpose:'contract_invitation',event:`contract-invitation:${contract.id}:${owner.id}:${value.request_id}`});
  if(!sent.accepted)return createErrorResponse({status:sent.status==='quota_exceeded'?429:409,errorMessage:sent.status==='quota_exceeded'?'وصل البريد إلى الحد المجاني؛ حاول لاحقًا.':sent.status==='uncertain'||sent.status==='sending'?'لم يتأكد قبول الرسالة. أعد المحاولة بنفس الطلب لتجنب التكرار.':'لم يقبل مزود البريد الدعوة. راجع إعداد المرسل وحالة التسليم.'});
  return createSuccessResponse({accepted:true,status:sent.status,delivery_id:sent.delivery_id});
 }catch(error){if(error instanceof Response)return error;if(error instanceof z.ZodError)return createErrorResponse({status:400,errorMessage:'معرف العقد ومرجع طلب الإرسال مطلوبان'});return createErrorResponse({status:503,errorMessage:'Mail unavailable'});}
},true);
