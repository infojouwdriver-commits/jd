import test from 'node:test';
import assert from 'node:assert/strict';
import {completedBatchReceipt} from '../src/completed-batch-receipt.ts';
test('partial queue delivery cannot offer an older passenger receipt after the newest ride',()=>{
 const older={id:7,chiron:'production'},latest={id:8,chiron:'unconfirmed'};
 assert.equal(completedBatchReceipt({remaining:1,receipts:[older]}),null);
 assert.equal(completedBatchReceipt({remaining:2,receipts:[]}),null);
 assert.equal(completedBatchReceipt({remaining:0,receipts:[older,latest]}),latest);
 assert.equal(completedBatchReceipt({remaining:0,receipts:[]}),null);
});
