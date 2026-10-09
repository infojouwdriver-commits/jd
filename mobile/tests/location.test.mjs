import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeLocationWatch, normalizeNativeLocation, isFreshAccurateLocation, stopAllMobileLocationWatches } from '../../src/lib/mobile-location.ts';
const point = { latitude: 50.8, longitude: 4.3, accuracy: 10, time: 123456, speed: 0 };
test('native fixes preserve original time and reject simulated/malformed fixes', () => {
  assert.equal(normalizeNativeLocation(point).timestamp, 123456);
  assert.equal(normalizeNativeLocation({ ...point, simulated: true }), null);
  assert.equal(normalizeNativeLocation({ ...point, latitude: 91 }), null);
  assert.equal(normalizeNativeLocation({ ...point, accuracy: NaN }), null);
});
test('stop before asynchronous registration completes removes eventual watcher without emitting', async () => {
  let resolveId; let callback; const removed = []; const emitted = [];
  const plugin = {
    addWatcher: async (_, cb) => { callback = cb; return await new Promise(resolve => { resolveId = resolve; }); },
    removeWatcher: async ({ id }) => { removed.push(id); },
  };
  const watch = createNativeLocationWatch(plugin, p => emitted.push(p), () => {});
  await Promise.resolve();
  const stop = watch.stop();
  callback(point);
  resolveId('late-id');
  await stop;
  await watch.stop();
  assert.deepEqual(removed, ['late-id']);
  assert.equal(emitted.length, 0);
});
test('foreground requests have no background message and global logout removes watches', async () => {
  let options; let callback; const removed = [];
  const plugin = { addWatcher: async (opts, cb) => { options = opts; callback = cb; return 'foreground'; }, removeWatcher: async ({ id }) => removed.push(id) };
  const emitted = [];
  const watch = createNativeLocationWatch(plugin, p => emitted.push(p), () => {});
  await watch.ready;
  callback(point);
  assert.equal(options.backgroundMessage, undefined);
  assert.equal(emitted[0].timestamp, point.time);
  await stopAllMobileLocationWatches();
  callback(point);
  assert.deepEqual(removed, ['foreground']);
  assert.equal(emitted.length, 1);
});
test('permission preparation failure prevents starting native tracking', async () => {
  let starts = 0;
  const watch = createNativeLocationWatch({ addWatcher: async () => { starts++; return 'bad'; }, removeWatcher: async () => {} }, () => {}, () => {}, { background: true }, async () => { throw new Error('permission denied'); });
  await assert.rejects(watch.ready, /permission denied/);
  await watch.stop();
  assert.equal(starts, 0);
});

test('new trip fixes must be recent, precise, valid and not far in the future', () => {
  const now = 100000;
  const fresh = { lat: 50.8, lon: 4.3, timestamp: now, accuracy: 15 };
  assert.equal(isFreshAccurateLocation(fresh, now), true);
  for (const invalid of [{ ...fresh, timestamp: now - 30001 }, { ...fresh, timestamp: now + 5001 },
    { ...fresh, accuracy: 51 }, { ...fresh, accuracy: undefined }, { ...fresh, accuracy: NaN },
    { ...fresh, lat: 91 }, null]) assert.equal(isFreshAccurateLocation(invalid, now), false);
});
