import {createHmac, timingSafeEqual} from 'node:crypto';

// Capability links contain no session credentials. Keep this signing key stable:
// changing it intentionally invalidates all previously issued customer links.
function signature(id: string): string {
  const key = process.env.DOCUMENT_LINK_SECRET || process.env.DATA_ENCRYPTION_KEY;
  if (!key || !/^[a-f0-9]{64}$/i.test(key)) throw new Error('Document signing key unavailable');
  return createHmac('sha256', Buffer.from(key, 'hex')).update(`jouw-driver:receipt:v1:${id}`).digest('base64url');
}
export function receiptCapability(invoiceId: number): string {
  if (!Number.isSafeInteger(invoiceId) || invoiceId < 1) throw new Error('Invalid invoice');
  const id = String(invoiceId);
  return `${id}.${signature(id)}`;
}
export function verifyReceiptCapability(value: string): number | null {
  const match = /^([1-9][0-9]{0,15})\.([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match || !Number.isSafeInteger(Number(match[1]))) return null;
  const expected = Buffer.from(signature(match[1]));
  return timingSafeEqual(expected, Buffer.from(match[2])) ? Number(match[1]) : null;
}
export const documentOrigin = 'https://app.jouww.com';
export function receiptDocumentUrl(invoiceId: number): string {
  return `${documentOrigin}/documents/receipts/${receiptCapability(invoiceId)}`;
}
