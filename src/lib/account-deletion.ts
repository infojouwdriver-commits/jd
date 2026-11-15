import { createHash } from 'node:crypto';
import { z } from 'zod';

export const deletionReceipt = z.string().uuid().refine(value => value[14] === '4');
export const deletionStatusFields = 'requested_at,due_at,completed_at';

export function deletionReceiptDigest(receipt: string) {
  return createHash('sha256').update(receipt.toLowerCase()).digest('hex');
}
