import type {NativeTrip, TripStore} from './trip-engine';
export interface Database {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: (string | number)[]): Promise<{changes: number}>;
  getFirstAsync<T>(sql: string, ...params: (string | number)[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: (string | number)[]): Promise<T[]>;
  withExclusiveTransactionAsync(task: (transaction: Database) => Promise<void>): Promise<void>;
}
export interface JournalCipher {
  encrypt(owner: string, identity: string, plaintext: string): Promise<string>;
  decrypt(owner: string, identity: string, ciphertext: string): Promise<string>;
}
interface Row {owner: string; id: string; kind: string; revision: number; ciphertext: string}
const identity = (row: Omit<Row, 'ciphertext'>) => `${row.owner}:${row.kind}:${row.id}:${row.revision}`;
export async function createSqlTripStore(database: Database, cipher: JournalCipher): Promise<TripStore> {
  await database.execAsync("PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS trips(owner TEXT NOT NULL,id TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('active','completed')),revision INTEGER NOT NULL,ciphertext TEXT NOT NULL,PRIMARY KEY(owner,id,kind)); CREATE UNIQUE INDEX IF NOT EXISTS active_trip ON trips(owner) WHERE kind='active';");
  async function seal(owner: string, id: string, kind: string, revision: number, value: unknown) {
    if (!/^[1-9]\d*$/.test(owner) || !/^[a-f0-9-]{36}$/i.test(id)) throw Error('Invalid journal identity');
    const plaintext = JSON.stringify(value);
    if (new TextEncoder().encode(plaintext).length > 250000) throw Error('Trip journal record too large');
    return cipher.encrypt(owner, identity({owner, id, kind, revision}), plaintext);
  }
  async function open<T>(row: Row): Promise<T> {
    return JSON.parse(await cipher.decrypt(row.owner, identity(row), row.ciphertext)) as T;
  }
  return {
    async active(owner) {
      const row = await database.getFirstAsync<Row>("SELECT * FROM trips WHERE owner=? AND kind='active'", owner);
      if (!row) return null;
      const trip = await open<NativeTrip>(row);
      if (trip.owner !== owner || trip.key !== row.id || trip.revision !== row.revision) throw Error('Trip journal identity mismatch');
      return trip;
    },
    async create(trip) {
      const ciphertext = await seal(trip.owner, trip.key, 'active', trip.revision, trip);
      await database.runAsync("INSERT INTO trips(owner,id,kind,revision,ciphertext) VALUES(?,?,'active',?,?)", trip.owner, trip.key, trip.revision, ciphertext);
    },
    async update(trip) {
      const ciphertext = await seal(trip.owner, trip.key, 'active', trip.revision, trip);
      const result = await database.runAsync("UPDATE trips SET revision=?,ciphertext=? WHERE owner=? AND id=? AND kind='active' AND revision=?", trip.revision, ciphertext, trip.owner, trip.key, trip.revision - 1);
      if (result.changes !== 1) throw Error('Trip changed concurrently; reload before continuing');
    },
    async complete(trip, payload) {
      if (payload.completion_request_key !== trip.key) throw Error('Trip completion key changed');
      const ciphertext = await seal(trip.owner, trip.key, 'completed', 0, payload);
      await database.withExclusiveTransactionAsync(async transaction => {
        const result = await transaction.runAsync("DELETE FROM trips WHERE owner=? AND id=? AND kind='active' AND revision=?", trip.owner, trip.key, trip.revision);
        if (result.changes !== 1) throw Error('Active trip changed before completion');
        await transaction.runAsync("INSERT INTO trips(owner,id,kind,revision,ciphertext) VALUES(?,?,'completed',0,?)", trip.owner, trip.key, ciphertext);
      });
    },
    async pending(owner) {
      const rows = await database.getAllAsync<Row>("SELECT * FROM trips WHERE owner=? AND kind='completed' ORDER BY rowid", owner);
      return Promise.all(rows.map(async row => {
        const payload = await open<Record<string, unknown>>(row);
        if (payload.completion_request_key !== row.id) throw Error('Queued trip identity mismatch');
        return {key: row.id, payload};
      }));
    },
    async acknowledge(owner, key) {
      await database.runAsync("DELETE FROM trips WHERE owner=? AND id=? AND kind='completed'", owner, key);
    },
  };
}
