import {createCipheriv, createDecipheriv, randomBytes} from 'node:crypto';
const prefix = 'enc:v1:';
function key(): Buffer {
  const hex = process.env.DATA_ENCRYPTION_KEY || '';
  if (!/^[a-f0-9]{64}$/i.test(hex)) throw new Error('DATA_ENCRYPTION_KEY must contain 32 random bytes as hex');
  return Buffer.from(hex,'hex');
}
export function encryptSecret(value: string, context: string): string {
  if (value.startsWith(prefix)) throw new Error('Ciphertext cannot be supplied as a secret');
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), nonce);
  cipher.setAAD(Buffer.from(context));
  const encrypted = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return prefix + [nonce,cipher.getAuthTag(),encrypted].map(b => b.toString('base64url')).join('.');
}
export function decryptSecret(value: string, context: string): string {
  if (!value.startsWith(prefix)) {
    if (process.env.NODE_ENV === 'production') throw new Error('Legacy secret must be migrated before use');
    return value;
  }
  const [nonce,tag,encrypted,...extra] = value.slice(prefix.length).split('.').map(s => Buffer.from(s,'base64url'));
  if (extra.length || nonce?.length !== 12 || tag?.length !== 16 || !encrypted) throw new Error('Invalid encrypted secret');
  const cipher = createDecipheriv('aes-256-gcm',key(),nonce);
  cipher.setAAD(Buffer.from(context)); cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(encrypted),cipher.final()]).toString('utf8');
}
export function transformSecrets(table: string, data: Record<string, unknown>, encrypt: boolean): Record<string, unknown> {
  const fields = table === 'companies' ? ['chiron_test_client_secret','chiron_prod_client_secret'] : table === 'chiron_settings' ? ['client_secret'] : [];
  const result = {...data};
  for (const field of fields) if (typeof result[field] === 'string' && result[field]) result[field] = encrypt ? encryptSecret(result[field] as string, `${table}.${field}`) : decryptSecret(result[field] as string, `${table}.${field}`);
  return result;
}
