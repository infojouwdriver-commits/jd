import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
const claims=z.object({v:z.literal(1),contract:z.number().int().positive(),company:z.number().int().positive(),owner:z.number().int().positive(),email:z.string().email().max(254),request:z.string().uuid(),revision:z.string().datetime({offset:true}),digest:z.string().regex(/^[a-f0-9]{64}$/),expires:z.number().int().positive()}).strict();
export type ContractEmailLink=z.infer<typeof claims>;
export const contractDigest=(html:string)=>createHash('sha256').update(html,'utf8').digest('hex');
function mac(value:string,secret:string){if(secret.length<32)throw Error('Signing configuration unavailable');return createHmac('sha256',secret).update('jd-contract-email-v1:'+value).digest();}
export function issueContractEmailLink(value:ContractEmailLink,secret:string){const body=Buffer.from(JSON.stringify(claims.parse(value))).toString('base64url');return body+'.'+mac(body,secret).toString('base64url');}
export function readContractEmailLink(value:string,secret:string,now=Date.now()):ContractEmailLink{
 if(value.length>2048||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(value))throw Error('Invalid invitation');
 const [body,signature]=value.split('.'),actual=Buffer.from(signature,'base64url'),expected=mac(body,secret);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error('Invalid invitation');
 const data=claims.parse(JSON.parse(Buffer.from(body,'base64url').toString('utf8')));
 if(data.expires<=now||data.expires>now+73*3600000)throw Error('Invitation expired');
 return data;
}
