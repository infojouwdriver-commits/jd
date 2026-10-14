import {AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync} from 'expo-crypto';
import {journalBytes} from './journal-bytes';

let checked: Promise<void> | null = null;
// Exercise the real native bridge with an ephemeral key and synthetic data only.
// No SecureStore, SQLite, GPS, account data, network or customer journal writes.
export function assertNativeCryptoReady(): Promise<void> {
  return checked ?? (checked = (async () => {
    try {
      const key = await AESEncryptionKey.generate();
      const imported = await AESEncryptionKey.import(await key.encoded('hex'), 'hex');
      const plaintext = new TextEncoder().encode('JOUW DRIVER · فحص الحفظ');
      const additionalData = new TextEncoder().encode('jd-native-crypto-preflight-v1');
      const sealed = await aesEncryptAsync(plaintext, imported, {additionalData});
      const restored = AESSealedData.fromCombined(journalBytes(await sealed.combined('base64')));
      const decoded = await aesDecryptAsync(restored, imported, {additionalData});
      if (decoded.length !== plaintext.length || decoded.some((byte, index) => byte !== plaintext[index])) throw Error('Roundtrip mismatch');
      let rejected = false;
      try {await aesDecryptAsync(restored, imported, {additionalData: new TextEncoder().encode('different identity')});}
      catch {rejected = true;}
      if (!rejected) throw Error('Authentication missing');
    } catch {
      throw Error('تعذّر فحص حماية حفظ الرحلة. لا تحذف بيانات التطبيق.');
    }
  })().catch(error => {checked = null; throw error;}));
}
