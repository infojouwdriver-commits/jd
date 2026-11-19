import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateDriverBalance} from '../src/driver-balance.ts';

test('driver balance applies 45 percent in cents and deducts only collected cash',()=>{
  const payment_stats={cash:{count:2,revenue:48.1},contant:{count:1,revenue:7.07},card:{count:2,revenue:45}};
  assert.deepEqual(estimateDriverBalance({total_revenue:100.17,payment_stats}),{share:45.08,cash:55.17,balance:-10.09});
  assert.deepEqual(estimateDriverBalance({total_revenue:0,payment_stats:{}}),{share:0,cash:0,balance:0});
});
