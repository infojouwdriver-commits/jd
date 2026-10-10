import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeLocationWatch, createNativeTripReplay, normalizeNativeLocation, isFreshAccurateLocation, stopAllMobileLocationWatches } from '../../src/lib/mobile-location.ts';
import { readFile } from 'node:fs/promises';
const point = { latitude: 50.8, longitude: 4.3, accuracy: 10, time: 123456, speed: 0 };
test('native fixes preserve original time and reject simulated/malformed fixes', () => {
  assert.equal(normalizeNativeLocation(point).timestamp, 123456);
  assert.equal(normalizeNativeLocation({ ...point, simulated: true }), null);
  assert.equal(normalizeNativeLocation({ ...point, latitude: 91 }), null);
  assert.equal(normalizeNativeLocation({ ...point, accuracy: NaN }), null);
  assert.equal(normalizeNativeLocation({ ...point, time: 0 }), null);
  assert.equal(normalizeNativeLocation({ ...point, time: -1 }), null);
});

const trip = { owner: '123', key: '9839aaab-1d2c-431d-9101-437ac998bb11' };
test('journal replays all bounded batches before newer live fixes, and deduplicates by original time', async () => {
  let release; let reads = 0; const emitted = [];
  const persisted = Array.from({ length: 1205 }, (_, n) => ({ ...point, time: n + 1 }));
  const plugin = { readTripPoints: async ({ after }) => {
    if (++reads === 1) await new Promise(resolve => { release = resolve; });
    return { points: persisted.filter(p => p.time > after).slice(0, 1000) };
  } };
  const replay = createNativeTripReplay(plugin, trip, p => emitted.push(p.timestamp));
  const first = replay.replay();
  assert.equal(replay.replay(), first);
  replay.accept({ lat: 50.8, lon: 4.3, accuracy: 10, timestamp: 1300 });
  release(); await first;
  assert.equal(reads, 2);
  assert.deepEqual(emitted, [...persisted.map(p => p.time), 1300]);
  replay.accept({ lat: 50.8, lon: 4.3, accuracy: 10, timestamp: 1300 });
  assert.equal(emitted.length, 1206);
  replay.stop(); replay.accept({ lat: 50.8, lon: 4.3, accuracy: 10, timestamp: 1400 });
  assert.equal(emitted.length, 1206);
});
test('journal errors are surfaced; no-progress batches cannot loop forever', async () => {
  assert.throws(() => createNativeTripReplay({}, { ...trip, owner: '../123' }, () => {}), /identity/);
  const replay = createNativeTripReplay({ readTripPoints: async () => ({ points: Array.from({ length: 1000 }, () => ({ ...point, time: -1 })) }) }, trip, () => {});
  await assert.rejects(replay.replay(), /no progress/);
  const failed = createNativeTripReplay({ readTripPoints: async () => { throw new Error('authentication tag invalid'); } }, trip, () => {});
  await assert.rejects(failed.replay(), /authentication tag invalid/);
});
test('taximeter passes owner-scoped trip identity and last durable meter anchor into native replay', async () => {
  const source = await readFile(new URL('../../src/app/driver/taximeter/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /trip: \{ owner: user\.sub, key: nativeTrip\.completionRequestKey/);
  assert.match(source, /after: meterRef\.current\.lastPoint\?\.timestamp \?\? 0/);
  assert.match(source, /await replayWatching\(\)/);
  assert.match(source, /await tripJournal\(\)\.complete\(user\.sub, tripPayload\);\s*await stopWatching\(\)/);
  assert.match(source, /await api\.post\('\/trips\/end', payload\);[\s\S]*?await clearNativeTripPoints\(user\.sub/);
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
