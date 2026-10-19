import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {verifyHashString} from './server-utils';
/** Attempts are claimed in storage before comparing the hash; no raw OTP is stored. */
export async function verifyEmailCode(email:string,purpose:string,code:string) {
 const client=createPostgrestClient(await generateAdminUserToken());
 const result=await client.rpc('security_attempt_email_code',{p_object:email,p_purpose:purpose});
 if(result.error)throw Error('Email confirmation unavailable');
 const row=result.data as {id:number;passcode:string}|null;
 if(!row?.passcode||!await verifyHashString(code,row.passcode))return null;
 return row;
}
