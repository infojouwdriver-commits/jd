import test from 'node:test';
import assert from 'node:assert/strict';
import { isFleetLocationVisible, isPublishableFleetPoint, shouldPublishFleetPoint } from '../src/lib/fleet-tracking.ts';
import { registerFleetSharingStopper, stopFleetSharingRuntime } from '../src/lib/fleet-sharing-runtime.ts';

const now = Date.parse('2026-10-13T18:00:00Z');
const point = { lat: 50.8503, lon: 4.3517, accuracy: 12, timestamp: now };

test('fleet publisher accepts a recent accurate Belgian point', () => {
  assert.equal(isPublishableFleetPoint(point, now), true);
});

test('fleet publisher rejects stale, future, inaccurate and invalid points', () => {
  assert.equal(isPublishableFleetPoint({ ...point, timestamp: now - 60_001 }, now), false);
  assert.equal(isPublishableFleetPoint({ ...point, timestamp: now + 5_001 }, now), false);
  assert.equal(isPublishableFleetPoint({ ...point, accuracy: 201 }, now), false);
  assert.equal(isPublishableFleetPoint({ ...point, lat: 91 }, now), false);
});

test('fleet updates are throttled unless enough time or movement elapsed', () => {
  assert.equal(shouldPublishFleetPoint(null, point, now), true);
  assert.equal(shouldPublishFleetPoint(point, { ...point, timestamp: now + 10_000 }, now + 10_000), false);
  assert.equal(shouldPublishFleetPoint(point, { ...point, timestamp: now + 15_000 }, now + 15_000), true);
  assert.equal(shouldPublishFleetPoint(point, { ...point, lat: 50.8507, timestamp: now + 5_000 }, now + 5_000), true);
});

test('coordinates are visible only for an active sharing shift', () => {
  const row = { shift_active: true, sharing_enabled: true, latitude: 50.85, longitude: 4.35, last_update: '2026-10-13T18:00:00Z' };
  assert.equal(isFleetLocationVisible(row), true);
  assert.equal(isFleetLocationVisible({ ...row, sharing_enabled: false }), false);
  assert.equal(isFleetLocationVisible({ ...row, latitude: null }), false);
});

test('logout can await the active fleet publisher before clearing server state', async () => {
  const events = [];
  const unregister = registerFleetSharingStopper(async () => { await Promise.resolve(); events.push('publisher-stopped'); });
  await stopFleetSharingRuntime();
  events.push('off-shift');
  unregister();
  assert.deepEqual(events, ['publisher-stopped', 'off-shift']);
});
