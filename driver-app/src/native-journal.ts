import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import {AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync} from 'expo-crypto';
import {createSqlTripStore, type Database} from './trip-store';
const keys = new Map<string, Promise<AESEncryptionKey>>();
function ownerKey(owner: string, create = false) {
  const existing = keys.get(owner); if (existing) return existing;
  const work = (async () => {
    const name = `jd-trip-key-${owner}`;
    const saved = await SecureStore.getItemAsync(name);
    if (saved) return AESEncryptionKey.import(saved, 'hex');
    if (!create) throw Error('مفتاح سجل الرحلة غير متاح. لا تحذف بيانات التطبيق.');
    const key = await AESEncryptionKey.generate();
    await SecureStore.setItemAsync(name, await key.encoded('hex'), {keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY});
    return key;
  })();
  keys.set(owner, work); work.catch(() => keys.delete(owner)); return work;
}
let journal: ReturnType<typeof createSqlTripStore> | null = null;
export function nativeJournal() {
  return journal ?? (journal = SQLite.openDatabaseAsync('driver-trips.db').then(db => createSqlTripStore(db as unknown as Database, {
    async encrypt(owner, identity, plaintext) {
      const sealed = await aesEncryptAsync(new TextEncoder().encode(plaintext), await ownerKey(owner, true), {additionalData: new TextEncoder().encode(identity)});
      return sealed.combined('base64');
    },
    async decrypt(owner, identity, ciphertext) {
      const bytes = await aesDecryptAsync(AESSealedData.fromCombined(ciphertext), await ownerKey(owner), {additionalData: new TextEncoder().encode(identity)});
      return new TextDecoder('utf-8', {fatal: true}).decode(bytes);
    },
  })).catch(error => {journal = null; throw error;}));
}
