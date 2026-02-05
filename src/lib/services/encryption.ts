import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

export function encryptKey(key: string, password: string): string {
  return AES.encrypt(key, password).toString();
}

export function decryptKey(encrypted: string, password: string): string {
  try {
    const bytes = AES.decrypt(encrypted, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

export function generateKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}
