import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_STORAGE = 'byok-encryption-key';
const KEY_PREFIX = 'byok-encrypted-';

export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(256/8).toString();
}

export function getEncryptionKey(): string {
  if (typeof window === 'undefined') return '';
  
  let key = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!key) {
    key = generateEncryptionKey();
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
  }
  return key;
}

export function encrypt(data: string): string {
  const key = getEncryptionKey();
  return AES.encrypt(data, key).toString();
}

export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const bytes = AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function storeApiKey(provider: string, apiKey: string, name?: string): void {
  if (typeof window === 'undefined') return;
  
  const encryptedKey = encrypt(apiKey);
  const data = {
    encryptedKey,
    name,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(`${KEY_PREFIX}${provider}`, JSON.stringify(data));
}

export function getApiKey(provider: string): { key: string; name?: string; createdAt: string } | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(`${KEY_PREFIX}${provider}`);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    return {
      key: decrypt(data.encryptedKey),
      name: data.name,
      createdAt: data.createdAt,
    };
  } catch {
    return null;
  }
}

export function removeApiKey(provider: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${KEY_PREFIX}${provider}`);
}

export function hasApiKey(provider: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${KEY_PREFIX}${provider}`) !== null;
}

export function clearAllApiKeys(): void {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
