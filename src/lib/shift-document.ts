// Lossless, stable encoding of the existing shift identity. No new sequence or
// guessed relationship to an invoice; grouping makes the reference easier to copy.
export function shiftReference(id: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Invalid shift');
  const value = BigInt('0x' + id.replaceAll('-', '')).toString(36).toUpperCase().padStart(25, '0');
  return 'DS-' + value.match(/.{1,5}/g)!.join('-');
}
export function shiftDocumentUrl(id: string): string {
  shiftReference(id);
  return `https://app.jouww.com/driver/shifts?id=${id}`;
}
