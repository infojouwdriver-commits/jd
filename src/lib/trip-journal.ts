// Browser/WebView storage only. No access or refresh tokens are persisted here.
// A non-exportable origin-local key protects stored bytes, not an unlocked or compromised device.
type Kind = 'active' | 'completed';
interface StoredRecord { id: string; owner: string; kind: Kind; revision: number; iv: Uint8Array; ciphertext: ArrayBuffer; }
const DB_NAME = 'jouw-driver-trip-journal';
const MAX_BYTES = 250_000;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Local trip storage failed'));
  });
}
function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(new Error('Local trip transaction failed'));
  });
}

export function createTripJournal(factory: IDBFactory, cryptoProvider: Crypto) {
  const revisions = new Map<string, number>();
  let database: Promise<IDBDatabase> | undefined;
  function open() {
    database ??= new Promise<IDBDatabase>((resolve, reject) => {
      const req = factory.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('keys');
        const records = req.result.createObjectStore('records', { keyPath: 'id' });
        records.createIndex('owner', 'owner');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new Error('Local trip database unavailable'));
      req.onblocked = () => reject(new Error('Close another driver tab to open local trip storage'));
    });
    return database;
  }
  function validateOwner(owner: string) { if (!/^[1-9]\d{0,18}$/.test(owner)) throw new Error('Authenticated driver required'); }
  function validateKey(key: string) { if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(key)) throw new Error('Invalid trip completion key'); }
  async function ownerKey(owner: string) {
    const db = await open();
    const read = db.transaction('keys', 'readonly');
    const found = await requestResult<CryptoKey | undefined>(read.objectStore('keys').get(owner));
    if (found) return found;
    const candidate = await cryptoProvider.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const tx = db.transaction('keys', 'readwrite');
    const done = transactionDone(tx);
    const store = tx.objectStore('keys');
    const existing = await requestResult<CryptoKey | undefined>(store.get(owner));
    if (!existing) store.put(candidate, owner);
    await done;
    return existing ?? candidate;
  }
  const idFor = (owner: string, kind: Kind, key: string) => `${owner}:${kind}:${key}`;
  async function encryptRecord(owner: string, kind: Kind, key: string, payload: unknown) {
    validateOwner(owner); validateKey(key);
    const id = idFor(owner, kind, key);
    const revision = kind === 'active' ? (revisions.get(id) ?? 0) + 1 : 0;
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    if (bytes.length > MAX_BYTES) throw new Error('Trip exceeds local storage limit');
    const iv = cryptoProvider.getRandomValues(new Uint8Array(12));
    const ciphertext = await cryptoProvider.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(`${id}:${revision}`) }, await ownerKey(owner), bytes);
    return { id, owner, kind, revision, iv, ciphertext } satisfies StoredRecord;
  }
  async function save(owner: string, kind: Kind, key: string, payload: unknown) {
    const record = await encryptRecord(owner, kind, key, payload);
    const db = await open();
    const tx = db.transaction('records', 'readwrite');
    const done = transactionDone(tx);
    if (kind === 'active') {
      const existing = await requestResult<StoredRecord[]>(tx.objectStore('records').index('owner').getAll(owner));
      const active = existing.find(r => r.kind === 'active');
      if ((!active && record.revision > 1) || (active && (active.id !== record.id || active.revision !== record.revision - 1))) {
        tx.abort(); await done.catch(() => {});
        throw new Error('This trip changed in another tab. Use one driver tab per trip.');
      }
    }
    tx.objectStore('records').put(record);
    await done;
    if (kind === 'active') revisions.set(record.id, record.revision);
  }
  async function complete(owner: string, payload: Record<string, unknown>) {
    const key = String(payload.completion_request_key);
    const record = await encryptRecord(owner, 'completed', key, payload);
    const db = await open();
    const tx = db.transaction('records', 'readwrite');
    const done = transactionDone(tx);
    const store = tx.objectStore('records');
    const activeId = idFor(owner, 'active', key);
    const active = await requestResult<StoredRecord | undefined>(store.get(activeId));
    if (active && active.revision !== revisions.get(activeId)) {
      tx.abort(); await done.catch(() => {});
      throw new Error('This trip changed in another tab. Reload before ending it.');
    }
    store.put(record);
    store.delete(activeId);
    await done;
    revisions.delete(activeId);
  }
  async function list<T>(owner: string, kind: Kind): Promise<T[]> {
    validateOwner(owner);
    const db = await open();
    const tx = db.transaction('records', 'readonly');
    const records = await requestResult<StoredRecord[]>(tx.objectStore('records').index('owner').getAll(owner));
    const matching = records.filter(r => r.kind === kind);
    if (!matching.length) return [];
    const key = await ownerKey(owner);
    return Promise.all(matching.map(async record => {
      const bytes = await cryptoProvider.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(record.iv), additionalData: new TextEncoder().encode(`${record.id}:${record.revision}`) }, key, record.ciphertext);
      if (kind === 'active') revisions.set(record.id, record.revision);
      return JSON.parse(new TextDecoder().decode(bytes)) as T;
    }));
  }
  async function remove(owner: string, kind: Kind, key: string) {
    validateOwner(owner); validateKey(key);
    const db = await open();
    const tx = db.transaction('records', 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore('records').delete(idFor(owner, kind, key));
    await done;
  }
  const syncing = new Map<string, Promise<{ sent: number; remaining: number }>>();
  function sync(owner: string, send: (payload: Record<string, unknown>) => Promise<unknown>) {
    validateOwner(owner);
    const existing = syncing.get(owner); if (existing) return existing;
    const work = (async () => {
      const queued = await list<Record<string, unknown>>(owner, 'completed');
      let sent = 0;
      for (const payload of queued) {
        // Stop on network, validation or authentication failure. Keep every unacknowledged trip.
        try { await send(payload); }
        catch { break; }
        await remove(owner, 'completed', String(payload.completion_request_key));
        sent++;
      }
      return { sent, remaining: (await list(owner, 'completed')).length };
    })().finally(() => syncing.delete(owner));
    syncing.set(owner, work); return work;
  }
  return { save, complete, list, remove, sync, close: async () => { (await open()).close(); database = undefined; } };
}

let browserJournal: ReturnType<typeof createTripJournal> | undefined;
export function tripJournal() {
  if (typeof window === 'undefined' || !window.indexedDB || !window.crypto?.subtle) throw new Error('Secure local trip storage is unavailable');
  browserJournal ??= createTripJournal(window.indexedDB, window.crypto);
  return browserJournal;
}
