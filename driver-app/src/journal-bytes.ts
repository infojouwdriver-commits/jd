// SQLite keeps the existing base64 format; native AES fromCombined requires bytes.
// Decode without depending on browser globals or changing the stored record/key.
export function journalBytes(value: string): Uint8Array {
  if (!value || value.length > 350000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw Error('Invalid encrypted journal encoding');
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const bytes = new Uint8Array(value.length / 4 * 3 - padding);
  let offset = 0;
  for (let i = 0; i < value.length; i += 4) {
    const a = alphabet.indexOf(value[i]), b = alphabet.indexOf(value[i + 1]);
    const c = value[i + 2] === '=' ? 0 : alphabet.indexOf(value[i + 2]);
    const d = value[i + 3] === '=' ? 0 : alphabet.indexOf(value[i + 3]);
    if (i === value.length - 4 && ((padding === 2 && (b & 15)) || (padding === 1 && (c & 3)))) throw Error('Invalid encrypted journal encoding');
    const bits = (a << 18) | (b << 12) | (c << 6) | d;
    bytes[offset++] = bits >> 16;
    if (offset < bytes.length) bytes[offset++] = bits >> 8;
    if (offset < bytes.length) bytes[offset++] = bits;
  }
  return bytes;
}
