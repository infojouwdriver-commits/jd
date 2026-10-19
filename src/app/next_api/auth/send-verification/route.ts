import {requestMiddleware,validateRequestBody,sendVerificationEmail} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {generateVerificationCode,hashVerificationCode} from '@/lib/server-utils';
import {authCrudOperations} from '@/lib/auth';
import {mailConfiguration} from '@/lib/mail-policy';
import {consumeRateLimit} from '@/lib/rate-limit';
import {z} from 'zod';
const schema=z.object({email:z.string().trim().toLowerCase().email().max(254),type:z.enum(['register','reset-password','company-registration']),request_id:z.string().uuid().optional()}).strict().refine(v=>v.type!=='company-registration'||!!v.request_id);
export const POST=requestMiddleware(async request=>{
 const parsed=schema.safeParse(await validateRequestBody(request));
 if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Check the email and request details'});
 const v=parsed.data;
 const limited=await consumeRateLimit('email-code-send:'+v.email,3);if(limited)return limited;
 if(!mailConfiguration(process.env).ready)return createErrorResponse({status:503,errorMessage:'Email confirmation temporarily unavailable'});
 try{
  const {usersCrud,userPasscodeCrud}=await authCrudOperations();
  const users=await usersCrud.findMany({email:v.email});const user=users?.[0];
  // The same response prevents account enumeration, including inactive/Google-only accounts.
  if(v.type==='reset-password'?(!user||user.is_active===false||user.status==='disabled'||user.auth_provider==='google'):!!user)return createSuccessResponse({data:true});
  const code=generateVerificationCode(),purpose=v.type==='company-registration'?'company-registration:'+v.request_id:v.type;
  const row=await userPasscodeCrud.create({pass_object:v.email,security_purpose:purpose,passcode:await hashVerificationCode(code),valid_until:new Date(Date.now()+180000).toISOString(),revoked:false,retry_count:0});
  let sent=false;try{sent=await sendVerificationEmail(v.email,code,v.type);}catch{/* No provider details or code in logs. */}
  if(!sent){await userPasscodeCrud.update(row.id,{revoked:true});if(v.type!=='reset-password')return createErrorResponse({status:503,errorMessage:'Email confirmation temporarily unavailable'});}
  return createSuccessResponse({data:true});
 }catch{return createErrorResponse({status:503,errorMessage:'Email confirmation temporarily unavailable'});}
},false);
