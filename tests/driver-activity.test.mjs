import test from 'node:test';import assert from 'node:assert/strict';
import {activityFilters,brusselsDay,summarizeActivity} from '../src/lib/driver-activity.ts';
test('Brussels civil ranges include the complete end day and handle both DST transitions',()=>{
 assert.equal(brusselsDay('2026-03-29'),'2026-03-28T23:00:00.000Z');assert.equal(brusselsDay('2026-03-30'),'2026-03-29T22:00:00.000Z');
 assert.equal(brusselsDay('2026-10-25'),'2026-10-24T22:00:00.000Z');assert.equal(brusselsDay('2026-10-26'),'2026-10-25T23:00:00.000Z');
 const f=activityFilters(new URLSearchParams({from:'2026-10-25',to:'2026-10-25'}));assert.equal(f.end,'2026-10-25T23:00:00.000Z');assert.equal(f.offset,0);
});
test('report filters reject impossible dates, invalid ranges, unbounded scans and query injection',()=>{
 for(const q of [{from:'2026-02-30',to:'2026-03-01'},{from:'2026-10-17',to:'2026-01-01'},{from:'2024-01-01',to:'2026-10-17'},{from:'2026-01-01',to:'2026-01-02',platform:'UBER,driver_id.eq.2'},{from:'2026-01-01',to:'2026-01-02',offset:'-1'}])assert.throws(()=>activityFilters(new URLSearchParams(q)));
});
test('gross revenue sums numeric strings in cents, excludes unfinished trips and groups by Brussels day',()=>{
 const rows=[{status:'completed',price:'0.10',currency:'EUR',start_time:'2026-10-16T22:30:00Z',ride_type:'INTERNAL',payment_method:'cash',distance_km:'1.5',duration_minutes:'4'},{status:'success',price:'0.20',start_time:'2026-10-17T10:00:00Z',external_source:'UBER',payment_method:'card'},{status:'pending',price:900},{status:'failed',price:800}];
 const s=summarizeActivity(rows);assert.equal(s.total_revenue,.3);assert.equal(s.total_trips,2);assert.equal(s.total_distance,1.5);assert.equal(s.daily_stats['2026-10-17'].revenue,.3);assert.equal(s.platform_stats.UBER.count,1);assert.equal(s.payment_stats.cash.revenue,.1);assert.equal(s.average_trip_value,.15);
 for(const price of [null,'bad',-1,Infinity])assert.throws(()=>summarizeActivity([{status:'completed',price,start_time:'2026-10-17T12:00:00Z'}]));
});
