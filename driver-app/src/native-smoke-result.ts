import * as SQLite from 'expo-sqlite';

// Only the unsigned CI simulator build enables this synthetic result channel.
// Production builds never open this database or write diagnostic account data.
export async function recordNativeCryptoResult(status: 'passed' | 'failed'): Promise<void> {
  const probeId = process.env.EXPO_PUBLIC_NATIVE_SMOKE_ID;
  if (!probeId || !/^\d+-\d+$/.test(probeId)) return;
  if (status !== 'passed' && status !== 'failed') throw Error('Invalid smoke status');
  const db = await SQLite.openDatabaseAsync('native-crypto-smoke.db');
  try {
    await db.execAsync("CREATE TABLE IF NOT EXISTS native_crypto_smoke(probe_id TEXT PRIMARY KEY,version INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('passed','failed')))");
    await db.runAsync('INSERT OR REPLACE INTO native_crypto_smoke(probe_id,version,status) VALUES(?,1,?)', probeId, status);
  } finally {await db.closeAsync();}
}
