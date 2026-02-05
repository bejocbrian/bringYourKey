import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiKey, Provider } from '@/lib/types';
import { decryptKey, encryptKey, generateKey } from '@/lib/services/encryption';

interface ApiKeysState {
  apiKeys: Record<Provider, ApiKey | null>;
  encryptionKey: string;
  addKey: (provider: Provider, key: string, name: string) => void;
  removeKey: (provider: Provider) => void;
  getDecryptedKey: (provider: Provider) => string | null;
  hasKey: (provider: Provider) => boolean;
}

const emptyKeys: Record<Provider, ApiKey | null> = {
  'google-veo': null,
  'meta-moviegen': null,
  'runway-gen3': null,
};

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      apiKeys: emptyKeys,
      encryptionKey: generateKey(),

      addKey: (provider, key, name) => {
        const encryptionKey = get().encryptionKey || generateKey();
        const encryptedKey = encryptKey(key, encryptionKey);
        const newKey: ApiKey = {
          provider,
          key: encryptedKey,
          name: name || provider,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          encryptionKey,
          apiKeys: {
            ...state.apiKeys,
            [provider]: newKey,
          },
        }));
      },

      removeKey: (provider) => {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: null,
          },
        }));
      },

      getDecryptedKey: (provider) => {
        const entry = get().apiKeys[provider];
        if (!entry) return null;
        const decrypted = decryptKey(entry.key, get().encryptionKey);
        return decrypted || null;
      },

      hasKey: (provider) => {
        const entry = get().apiKeys[provider];
        return Boolean(entry?.key);
      },
    }),
    {
      name: 'byok-api-keys',
    }
  )
);
