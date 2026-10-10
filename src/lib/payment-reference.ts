/** Belgian OGM check digits: remainder modulo 97, with zero represented by 97.
 * Source: Febelfin XML Credit Transfer Initiation v3.0, section 2.126.
 */
export function structuredPaymentReference(invoiceNumber: string): string {
  const digits = invoiceNumber.replace(/\D/g, '');
  if (!digits || digits.length > 10) throw new Error('Payment reference requires one to ten invoice digits');
  const base = digits.padStart(10, '0');
  const check = (Number(base) % 97 || 97).toString().padStart(2, '0');
  const reference = base + check;
  return `+++${reference.slice(0, 3)}/${reference.slice(3, 7)}/${reference.slice(7)}+++`;
}
