import {randomBytes,createCipheriv,createDecipheriv,publicEncrypt,privateDecrypt,constants} from 'node:crypto';
const aad=Buffer.from('jouw-driver/native-push/v1');
export function sealPushCredential(plaintext,publicKey){
 const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);
 const data=Buffer.concat([cipher.update(plaintext),cipher.final()]);
 return {version:1,encrypted_key:publicEncrypt({key:publicKey,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},key).toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')};
}
export function openPushCredential(envelope,privateKey){
 if(envelope.version!==1||Object.keys(envelope).sort().join(',')!=='data,encrypted_key,iv,tag,version')throw Error('Invalid sealed credential');
 const key=privateDecrypt({key:privateKey,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(envelope.encrypted_key,'base64'));
 const iv=Buffer.from(envelope.iv,'base64'),tag=Buffer.from(envelope.tag,'base64');if(key.length!==32||iv.length!==12||tag.length!==16)throw Error('Invalid sealed credential');
 const cipher=createDecipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);cipher.setAuthTag(tag);
 return Buffer.concat([cipher.update(Buffer.from(envelope.data,'base64')),cipher.final()]);
}
