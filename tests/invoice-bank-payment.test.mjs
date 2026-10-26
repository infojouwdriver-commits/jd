import test from 'node:test';import assert from 'node:assert/strict';
import {validIban,bankPaymentPayload,invoiceBankPayload} from '../src/lib/invoice-bank-payment.ts';
const bank={version:1,iban:'BE68539007547034',holder:'Synthetic Issuer',reference:'JDI-2026-00000001'};
const document={document_number:bank.reference,kind:'invoice',currency:'EUR',state:'issued',is_test:false,gross_cents:12100,bank_payment:bank};
test('EPC QR contains the exact invoice communication, recipient, cents and optional BIC position',()=>{
 assert.equal(validIban(bank.iban),true);assert.equal(validIban('BE68539007547035'),false);
 const lines=bankPaymentPayload(bank,12100).split('\n');assert.deepEqual(lines,['BCD','002','1','SCT','','Synthetic Issuer',bank.iban,'EUR121.00','','',bank.reference]);
 assert.equal(invoiceBankPayload(document,{collection:'bank',balance_cents:2100}).split('\n')[7],'EUR21.00');
 assert.equal(bankPaymentPayload({...bank,iban:'be68 5390 0754 7034'},1).split('\n')[6],bank.iban);
 for(const value of [{...bank,holder:'Bad\nOther account'},{...bank,reference:'Bad\r\nNew data'},{...bank,holder:''},{...bank,holder:'x'.repeat(71)},{...bank,reference:'x'.repeat(141)},{...bank,iban:'invalid'}])assert.equal(bankPaymentPayload(value,100),null);
 for(const value of [0,-1,1.1,NaN,Infinity,10000000000])assert.equal(bankPaymentPayload(bank,value),null);
});
test('bank QR is absent for unknown balances, Stripe collection, paid, void, preparatory, demo and credit documents',()=>{
 assert.equal(invoiceBankPayload(document),null);
 for(const payment of [{collection:'stripe',balance_cents:12100},{collection:'bank',balance_cents:0},{collection:'bank',balance_cents:-100},{collection:'bank',balance_cents:12101}])assert.equal(invoiceBankPayload(document,payment),null);
 for(const override of [{state:'prepared'},{state:'void'},{is_test:true},{kind:'credit'},{currency:'USD'},{bank_payment:null},{document_number:'JDI-OTHER'}])assert.equal(invoiceBankPayload({...document,...override},{collection:'bank',balance_cents:12100}),null);
});
