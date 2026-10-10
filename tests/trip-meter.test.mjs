import test from 'node:test';
import assert from 'node:assert/strict';
import { addMeterPoint, emptyMeter } from '../src/lib/trip-meter.ts';
import { completedTripTimes } from '../src/lib/trip-times.ts';
const p = (lat, timestamp, accuracy = 3) => ({ lat, lon: 4.35, timestamp, accuracy });

test('meter sums travelled segments through a return journey instead of displacement', () => {
  let m = addMeterPoint(emptyMeter(), p(50.8, 1_000));
  m = addMeterPoint(m, p(50.801, 11_000));
  m = addMeterPoint(m, p(50.8, 21_000));
  assert.ok(m.distanceKm > 0.22 && m.distanceKm < 0.23);
});
test('meter rejects bad accuracy, jumps, duplicate timestamps and gaps', () => {
  let m = addMeterPoint(emptyMeter(), p(50.8, 1_000));
  m = addMeterPoint(m, p(51, 2_000));
  assert.equal(m.distanceKm, 0);
  m = addMeterPoint(m, p(51.001, 200_000));
  assert.equal(m.distanceKm, 0);
  m = addMeterPoint(m, p(51.002, 200_000));
  m = addMeterPoint(m, p(51.003, 210_000, 100));
  assert.equal(m.distanceKm, 0);
  assert.equal(m.rejectedPoints, 3);
});
test('stationary noise inside reported accuracy does not bill distance', () => {
  let m = addMeterPoint(emptyMeter(), p(50.8, 1_000, 20));
  for (let i = 1; i <= 100; i++) m = addMeterPoint(m, p(50.8 + (i % 2 ? 0.0001 : -0.0001), 1_000 + i * 1_000, 20));
  assert.equal(m.distanceKm, 0);
});
test('delayed offline sync preserves original UTC event times', () => {
  const body = { start_time: '2026-10-08T10:00:00.000Z', end_time: '2026-10-08T10:30:00.000Z', duration_minutes: 30 };
  const result = completedTripTimes(body, Date.parse('2026-10-10T10:00:00Z'));
  assert.equal(result.startTime.toISOString(), body.start_time);
  assert.equal(result.endTime.toISOString(), body.end_time);
});
test('invalid, future, reversed and inconsistent event times are rejected', () => {
  const valid = { start_time: '2026-10-08T10:00:00.000Z', end_time: '2026-10-08T10:30:00.000Z', duration_minutes: 30 };
  const now = Date.parse('2026-10-10T10:00:00Z');
  for (const body of [{ ...valid, end_time: undefined }, { ...valid, duration_minutes: 100 }, { ...valid, start_time: valid.end_time, end_time: valid.start_time }, { ...valid, end_time: '2026-10-11T10:30:00Z' }]) assert.throws(() => completedTripTimes(body, now));
});
