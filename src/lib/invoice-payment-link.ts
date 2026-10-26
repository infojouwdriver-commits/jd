import {createHmac,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
const claims=z.object({v:z.literal(1),source:z.enum(['manual','subscription']),id:z.number().int().positive(),company:z.number().int().positive(),expires:z.number().int().positive()}).strict();
export type InvoiceLink=z.infer<typeof claims>;
const mac=(body:string,secret:string)=>{if(secret.length<32)throw Error('Payment link configuration unavailable');return createHmac('sha256',secret).update('jd-invoice-payment-v1:'+body).digest();};
export function signInvoiceLink(value:InvoiceLink,secret:string){const body=Buffer.from(JSON.stringify(claims.parse(value))).toString('base64url');return body+'.'+mac(body,secret).toString('base64url');}
export function readInvoiceLink(token:string,secret:string,now=Date.now()){
 if(token.length>1024||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token))throw Error('Invalid payment link');
 const [body,sig]=token.split('.'),actual=Buffer.from(sig,'base64url'),expected=mac(body,secret);
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error('Invalid payment link');
 const value=claims.parse(JSON.parse(Buffer.from(body,'base64url').toString()));if(value.expires<=now)throw Error('Payment link expired');return value;
}
export function invoicePaymentUrl(source:InvoiceLink['source'],d:{id:number;company_id:number},origin:string,secret:string){
 return origin+'/pay/invoice#'+signInvoiceLink({v:1,source,id:Number(d.id),company:Number(d.company_id),expires:Date.now()+180*86400000},secret);
}
