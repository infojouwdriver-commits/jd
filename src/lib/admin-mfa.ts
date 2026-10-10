import {isPlatformAdmin} from './security-policy';
import {matchingTotpStep} from './totp';
import {createPostgrestClient} from './postgrest';
import {generateAdminUserToken} from './auth';
export async function verifyAdministratorMfa(id:string|number,otp:unknown):Promise<boolean> {
 if(!isPlatformAdmin(String(id),process.env.PLATFORM_ADMIN_IDS))return false;
 const secrets=JSON.parse(process.env.ADMIN_TOTP_SECRETS_JSON||'{}');const secret=secrets[String(id)];
 if(typeof secret!=='string'||typeof otp!=='string')throw new Response(null,{status:401});
 const step=matchingTotpStep(secret,otp);if(step===null)throw new Response(null,{status:401});
 const token=await generateAdminUserToken();const result=await createPostgrestClient(token).rpc('security_claim_mfa',{p_user_id:Number(id),p_step:step});
 if(result.error)throw new Error('MFA verification unavailable');if(result.data!==true)throw new Response(null,{status:401});return true;
}
