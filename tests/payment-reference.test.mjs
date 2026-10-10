import test from 'node:test';
import assert from 'node:assert/strict';
import {structuredPaymentReference} from '../src/lib/payment-reference.ts';
test('Belgian references use remainder rather than complement modulo 97',()=>{
 assert.equal(structuredPaymentReference('1234567890'),'+++123/4567/89002+++');
 assert.equal(structuredPaymentReference('INV-97'),'+++000/0000/09797+++');
 assert.throws(()=>structuredPaymentReference('INV'));
 assert.throws(()=>structuredPaymentReference('1234567890123'));
});
