import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { IDBFactory } from 'fake-indexeddb';
import { createTripJournal } from '../src/lib/trip-journal.ts';
const key = '9e6c21d5-a3b2-4567-8234-112233445566';
const key2 = 'aabbccdd-a3b2-4567-8234-112233445566';
const payload = (id = key) => ({ completion_request_key: id, start_address: 'Private test address', price: 12.34 });

test('encrypted trip survives reopened database and remains isolated by driver', async () => {
  const factory = new IDBFactory(); const journal = createTripJournal(factory, webcrypto);
  await journal.save('12', 'active', key, { startAddress: 'Private test address', completionRequestKey: key });
  assert.deepEqual(await journal.list('13', 'active'), []);
  await journal.close();
  const reopened = createTripJournal(factory, webcrypto);
  assert.equal((await reopened.list('12', 'active'))[0].startAddress, 'Private test address');
  const db = await new Promise((resolve, reject) => { const r = factory.open('jouw-driver-trip-journal'); r.onsuccess = () => resolve(r.result); r.onerror = reject; });
  const stored = await new Promise(resolve => { const r = db.transaction('records').objectStore('records').getAll(); r.onsuccess = () => resolve(r.result); });
  assert.equal(JSON.stringify(stored).includes('Private test address'), false);
  const storedKey = await new Promise(resolve => { const r = db.transaction('keys').objectStore('keys').get('12'); r.onsuccess = () => resolve(r.result); });
  assert.equal(storedKey.extractable, false);
  db.close(); await reopened.close();
});

test('ending stores pending trip and removes active draft atomically', async () => {
  const journal = createTripJournal(new IDBFactory(), webcrypto);
  await journal.save('12', 'active', key, { completionRequestKey: key });
  await journal.complete('12', payload());
  assert.deepEqual(await journal.list('12', 'active'), []);
  assert.deepEqual(await journal.list('12', 'completed'), [payload()]);
  await journal.close();
});

test('failed acknowledgement retains queue; concurrent sync sends a trip once', async () => {
  const journal = createTripJournal(new IDBFactory(), webcrypto);
  await journal.complete('12', payload());
  assert.deepEqual(await journal.sync('12', async () => { throw new Error('Network disconnected'); }), { sent: 0, remaining: 1 });
  let sends = 0; const send = async () => { sends++; await new Promise(resolve => setTimeout(resolve, 10)); };
  await Promise.all([journal.sync('12', send), journal.sync('12', send)]);
  assert.equal(sends, 1); assert.deepEqual(await journal.list('12', 'completed'), []);
  await journal.close();
});

test('stale tab cannot overwrite or delete another active draft', async () => {
  const factory = new IDBFactory(); const a = createTripJournal(factory, webcrypto); const b = createTripJournal(factory, webcrypto);
  await a.save('12', 'active', key, { distance: 1 });
  await b.list('12', 'active');
  await a.save('12', 'active', key, { distance: 2 });
  await assert.rejects(b.save('12', 'active', key, { distance: 0 }), /another tab/);
  await assert.rejects(b.complete('12', payload()), /another tab/);
  await assert.rejects(a.save('12', 'active', key2, { distance: 0 }), /another tab/);
  assert.equal((await a.list('12', 'active'))[0].distance, 2);
  await a.close(); await b.close();
});

test('invalid owner, malformed key and oversized payload never enter storage', async () => {
  const journal = createTripJournal(new IDBFactory(), webcrypto);
  await assert.rejects(journal.save('0', 'active', key, {}));
  await assert.rejects(journal.save('12', 'active', 'bad', {}));
  await assert.rejects(journal.save('12', 'active', key, { a: 'x'.repeat(250_001) }));
  assert.deepEqual(await journal.list('12', 'active'), []); await journal.close();
});

test('a stale tab cannot recreate a trip completed in another tab', async () => {
  const factory = new IDBFactory(); const a = createTripJournal(factory, webcrypto); const b = createTripJournal(factory, webcrypto);
  await a.save('12', 'active', key, { distance: 1 });
  await b.list('12', 'active'); await b.complete('12', payload());
  await assert.rejects(a.save('12', 'active', key, { distance: 2 }), /another tab/);
  assert.deepEqual(await b.list('12', 'active'), []);
  await a.close(); await b.close();
});
