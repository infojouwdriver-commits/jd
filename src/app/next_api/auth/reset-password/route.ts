import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {hashString} from '@/lib/server-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {verifyEmailCode} from '@/lib/email-verification';
import {consumeRateLimit} from '@/lib/rate-limit';
import {z} from 'zod';
const schema=z.object({email:z.string().trim().toLowerCase().email().max(254),passcode:z.string().regex(/^\d{6}$/),password:z.string().min(12).refine(v=>Buffer.byteLength(v,'utf8')<=72)}).strict();
export const POST=requestMiddleware(async request=>{
 const parsed=schema.safeParse(await validateRequestBody(request));
 if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Check the code and password (12 characters, maximum 72 bytes)'});
 const v=parsed.data;const limited=await consumeRateLimit('email-code-check:'+v.email,5);if(limited)return limited;
 try{
  const code=await verifyEmailCode(v.email,'reset-password',v.passcode);
  if(!code)return createErrorResponse({status:401,errorMessage:'Invalid or expired verification code'});
  const r=await createPostgrestClient(await generateAdminUserToken()).rpc('security_reset_email_password',{p_email:v.email,p_code_id:code.id,p_code_hash:code.passcode,p_password:await hashString(v.password)});
  if(r.error)throw r.error;
  if(r.data!==true)return createErrorResponse({status:401,errorMessage:'Invalid or expired verification code'});
  return createSuccessResponse({data:true});
 }catch{return createErrorResponse({status:503,errorMessage:'Password recovery temporarily unavailable'});}
},false);
