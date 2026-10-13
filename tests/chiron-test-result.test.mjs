import test from 'node:test';
import assert from 'node:assert/strict';
import { isAcceptedTestMessage, acceptanceReportMessages } from '../src/lib/chiron-test-result.ts';

test('current success booleans match message colors and historical string reports remain readable', () => {
  assert.equal(isAcceptedTestMessage({success:true,httpStatus:200}),true);
  assert.equal(isAcceptedTestMessage({success:false,status:'success'}),false);
  assert.equal(isAcceptedTestMessage({status:'success'}),true);
  assert.equal(isAcceptedTestMessage({success:'true'}),false);
});

test('report preserves two distinct accepted events for each ride rather than marking the other event failed', () => {
  const rows=acceptanceReportMessages([{ritnummer:'TEST-fixture',success:true,messageType:'vertrek',httpStatus:200},{ritnummer:'TEST-fixture',success:true,messageType:'aankomst',httpStatus:202}]);
  assert.deepEqual(rows.map(r=>r.status),['success','success']);
  assert.deepEqual(rows.map(r=>r.messageType),['vertrek','aankomst']);
  assert.deepEqual(rows.map(r=>r.httpStatus),[200,202]);
});
