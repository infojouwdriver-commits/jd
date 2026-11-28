import test from 'node:test';
import assert from 'node:assert/strict';
import {historyProof,receiptProof} from '../src/trip-proof.ts';

test('trip proof never presents a test, pending or ambiguous receipt as production confirmation',()=>{
  assert.equal(receiptProof({id:1,chiron:'test'}),'test');
  assert.equal(receiptProof({id:1,chiron:'unconfirmed',chironDelivery:'pending'}),'pending');
  assert.equal(receiptProof({id:1,chiron:'unconfirmed',chironDelivery:'review'}),'review');
  assert.equal(receiptProof({id:1,chiron:'unconfirmed'}),'unconfirmed');
  assert.equal(historyProof('START_ACCEPTED','production'),'unconfirmed');
  assert.equal(historyProof('COMPLETED',null),'unconfirmed');
  assert.equal(historyProof('COMPLETED','test'),'test');
  assert.equal(historyProof('COMPLETED','production'),'production');
});
