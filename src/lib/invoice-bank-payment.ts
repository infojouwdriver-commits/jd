/** EPC069-12 v3.1, payload version 002, UTF-8. No external QR service. */
export interface BankInstructions {version:1;iban:string;holder:string;reference:string}
export interface InvoicePaymentState {balance_cents:number;collection:'bank'|'stripe'}
export function validIban(value:string){
 const iban=value.replace(/\s/g,'').toUpperCase();
 if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)||iban.startsWith('BE')&&iban.length!==16)return false;
 const digits=(iban.slice(4)+iban.slice(0,4)).replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55));
 let remainder=0;for(const digit of digits)remainder=(remainder*10+Number(digit))%97;return remainder===1;
}
export function bankPaymentPayload(instructions:BankInstructions,cents:number){
 const iban=instructions.iban.replace(/\s/g,'').toUpperCase(),holder=instructions.holder.trim(),reference=instructions.reference;
 if(instructions.version!==1||!validIban(iban)||!holder||[...holder].length>70||!reference||[...reference].length>140||/[\r\n\u0000-\u001f\u007f]/.test(holder+reference)||!Number.isSafeInteger(cents)||cents<1||cents>9999999999)return null;
 // EPC's structured-reference field accepts ISO11649 RF references only.
 // The exact invoice number belongs in the unstructured remittance field.
 const amount=Math.floor(cents/100)+'.'+String(cents%100).padStart(2,'0');
 const payload=['BCD','002','1','SCT','',holder,iban,'EUR'+amount,'','',reference].join('\n');
 return Buffer.byteLength(payload,'utf8')<=331?payload:null;
}
export function invoiceBankPayload(d:{document_number:string;kind:string;currency:string;state:string;is_test:boolean;gross_cents:number;bank_payment?:BankInstructions|null},payment?:InvoicePaymentState){
 if(!payment||payment.collection!=='bank'||!Number.isSafeInteger(payment.balance_cents)||payment.balance_cents>Number(d.gross_cents)||d.state!=='issued'||d.is_test||d.kind!=='invoice'||d.currency!=='EUR'||!d.bank_payment||d.bank_payment.reference!==d.document_number)return null;
 return bankPaymentPayload(d.bank_payment,payment.balance_cents);
}
