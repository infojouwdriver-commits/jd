import {createHmac,timingSafeEqual} from 'node:crypto';
export function decodeTotpSecret(secret:string):Buffer {
 if(!/^[A-Z2-7]{32,128}$/.test(secret))throw new Error('Invalid MFA configuration');
 let bits=0,acc=0;const result:number[]=[];for(const c of secret){acc=(acc<<5)|'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c);bits+=5;if(bits>=8){bits-=8;result.push((acc>>bits)&255)}}return Buffer.from(result);
}
export function totpAt(secret:string,step:number):string {const message=Buffer.alloc(8);message.writeBigUInt64BE(BigInt(step));const hash=createHmac('sha1',decodeTotpSecret(secret)).update(message).digest();const offset=hash[hash.length-1]&15;return String((hash.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0');}
export function matchingTotpStep(secret:string,code:string,now=Date.now()):number|null {if(!/^\d{6}$/.test(code))return null;const current=Math.floor(now/30000);for(const step of [current,current-1,current+1]){if(step>=0&&timingSafeEqual(Buffer.from(totpAt(secret,step)),Buffer.from(code)))return step;}return null;}
