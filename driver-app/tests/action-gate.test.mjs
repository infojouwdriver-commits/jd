import test from 'node:test';
import assert from 'node:assert/strict';
import {createActionGate} from '../src/action-gate.ts';
test('vehicle/start operation blocks simultaneous logout until completion, including failure',async()=>{
 const gate=createActionGate();let writes=0,finish;
 const pending=new Promise(resolve=>{finish=resolve;});
 const select=async()=>{if(!gate.acquire())return;try{writes++;await pending;throw Error('connection lost');}finally{gate.release();}};
 const operation=select();assert.equal(gate.acquire(),false);assert.equal(writes,1);finish();await assert.rejects(operation);assert.equal(gate.acquire(),true);gate.release();
});
