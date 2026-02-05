import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiKey, VideoProvider, UsageStats } from '@/lib/types';
import { hasApiKey, getApiKey as getEncryptedApiKey, removeApiKey as removeEncryptedApiKey } from '@/lib/services/encryption';

interface ApiKeysState {
  apiKeys: ApiKey[];
  usageStats: UsageStats[];
  addApiKey: (provider: VideoProvider, key: string, name?: string) => void;
  removeApiKey: (provider: VideoProvider) => void;
  getApiKey: (provider: VideoProvider) => string | null;
  hasApiKey: (provider: VideoProvider) => boolean;
  updateUsage: (provider: VideoProvider, success: boolean, duration: number) => void;
  resetApiKeys: () => void;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      apiKeys: [],
      usageStats: [],

      addApiKey: (provider: VideoProvider, key: string, name?: string) => {
        const { removeApiKey, updateUsage } = get();
        
        removeApiKey(provider);
        
        const newApiKey: ApiKey = {
          id: `${provider}-${Date.now()}`,
          provider,
          key,
          name,
          createdAt: new Date(),
        };

        set((state) => ({
          apiKeys: [...state.apiKeys.filter(k => k.provider !== provider), newApiKey],
        }));

        localStorage.setItem(`byok-api-key-${provider}`, key);
        localStorage.setItem(`byok-api-key-name-${provider}`, name || '');
      },

      removeApiKey: (provider: VideoProvider) => {
        removeEncryptedApiKey(provider);
        localStorage.removeItem(`byok-api-key-${provider}`);
        localStorage.removeItem(`byok-api-key-name-${provider}`);
        
        set((state) => ({
          apiKeys: state.apiKeys.filter(k => k.provider !== provider),
        }));
      },

      getApiKey: (provider: VideoProvider) => {
        return localStorage.getItem(`byok-api-key-${provider}`);
      },

      hasApiKey: (provider: VideoProvider) => {
        return hasApiKey(provider);
      },

      updateUsage: (provider: VideoProvider, success: boolean, duration: number) => {
        set((state) => {
          const existingStats = state.usageStats.find(s => s.provider === provider);
          
          if (existingStats) {
            return {
              usageStats: state.usageStats.map(s =>
                s.provider === provider
                  ? {
                      ...s,
                      totalGenerations: s.totalGenerations + 1,
                      successfulGenerations: s.successfulGenerations + (success ? 1 : 0),
                      failedGenerations: s.failedGenerations + (success ? 0 : 1),
                      totalDuration: s.totalDuration + duration,
                      lastUsed: new Date(),
                    }
                  : s
              ),
            };
          }
          
          const newStats: UsageStats = {
            provider,
            totalGenerations: 1,
            successfulGenerations: success ? 1 : 0,
            failedGenerations: success ? 0 : 1,
            totalDuration: duration,
            lastUsed: new Date(),
          };
          
          return {
            usageStats: [...state.usageStats, newStats],
          };
        });
      },

      resetApiKeys: () => {
        set({
          apiKeys: [],
          usageStats: [],
        });
      },
    }),
    {
      name: 'api-keys-storage',
    }
  )
);
