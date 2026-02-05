import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AdminUser, 
  FeatureFlag, 
  ProviderConfig, 
  AppSettings, 
  AnalyticsData, 
  Provider,
  User
} from '@/lib/types';
import { PROVIDERS } from '@/lib/services/providers';

interface AdminState {
  // Auth
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Feature flags
  features: FeatureFlag[];
  toggleFeature: (id: string) => void;
  isFeatureEnabled: (id: string) => boolean;
  
  // Provider configs
  providerConfigs: Record<Provider, ProviderConfig>;
  updateProviderConfig: (provider: Provider, config: Partial<ProviderConfig>) => void;
  toggleProvider: (provider: Provider) => void;
  
  // App settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Analytics (mock for MVP)
  analytics: AnalyticsData;
  refreshAnalytics: () => void;

  // Users and provider access
  users: User[];
  currentUserId: string;
  setCurrentUser: (userId: string) => void;
  toggleUserProviderAccess: (userId: string, provider: Provider) => void;
  getUserAllowedProviders: (userId: string) => Provider[];
  isProviderAllowedForUser: (userId: string, provider: Provider) => boolean;
}

const createProviderFeatures = (): FeatureFlag[] => {
  const now = new Date().toISOString();
  return Object.entries(PROVIDERS).map(([id, provider]) => ({
    id: `provider-${id}`,
    name: provider.name,
    description: `Enable ${provider.name} API for video generation`,
    enabled: true,
    category: 'provider' as const,
    createdAt: now,
    updatedAt: now,
  }));
};

const defaultFeatures: FeatureFlag[] = [
  {
    id: 'video-generation',
    name: 'Video Generation',
    description: 'Enable core video generation features',
    enabled: true,
    category: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gallery',
    name: 'Video Gallery',
    description: 'Enable the public/private gallery of generated videos',
    enabled: true,
    category: 'core',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-generation',
    name: 'Batch Generation',
    description: 'Allow users to generate multiple videos at once',
    enabled: false,
    category: 'experimental',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ...createProviderFeatures()
];

const defaultProviderConfigs: Record<Provider, ProviderConfig> = {
  'google-veo': {
    id: 'google-veo',
    enabled: true,
    isDefault: true,
    rateLimit: { requestsPerMinute: 10, requestsPerHour: 100 },
    costEstimate: { perGeneration: 0.1, currency: 'USD' },
    settings: { maxDuration: 60, minDuration: 1, supportedRatios: ['16:9', '9:16', '1:1'] }
  },
  'meta-moviegen': {
    id: 'meta-moviegen',
    enabled: true,
    isDefault: false,
    rateLimit: { requestsPerMinute: 5, requestsPerHour: 50 },
    costEstimate: { perGeneration: 0.15, currency: 'USD' },
    settings: { maxDuration: 30, minDuration: 1, supportedRatios: ['16:9', '9:16'] }
  },
  'runway-gen3': {
    id: 'runway-gen3',
    enabled: true,
    isDefault: false,
    rateLimit: { requestsPerMinute: 15, requestsPerHour: 200 },
    costEstimate: { perGeneration: 0.2, currency: 'USD' },
    settings: { maxDuration: 10, minDuration: 1, supportedRatios: ['16:9'] }
  }
};

const defaultSettings: AppSettings = {
  appName: 'Bring Your Key',
  theme: {
    primaryColor: '#6366f1',
    darkMode: true,
  },
  defaults: {
    provider: 'google-veo',
    duration: 5,
    aspectRatio: '16:9',
  },
  storage: {
    maxGenerationsPerUser: 100,
    autoDeleteAfterDays: 30,
  }
};

const emptyAnalytics: AnalyticsData = {
  generations: [],
  providerUsage: [],
  topPrompts: {
    words: [],
    count: 0
  }
};

const emptyUsers: User[] = [];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminUser: null,
      features: defaultFeatures,
      providerConfigs: defaultProviderConfigs,
      settings: defaultSettings,
      analytics: emptyAnalytics,
      users: emptyUsers,
      currentUserId: '',

      login: (username, password) => {
        // Simple password-based auth for MVP
        if (username === 'admin' && password === 'admin123') {
          const user: AdminUser = {
            id: '1',
            username: 'admin',
            role: 'superadmin',
            lastLogin: new Date().toISOString()
          };
          set({ isAuthenticated: true, adminUser: user });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false, adminUser: null }),

      toggleFeature: (id) => set((state) => {
        // If this is a provider feature flag, also sync the provider config
        if (id.startsWith('provider-')) {
          const providerId = id.replace('provider-', '') as Provider;
          const currentEnabled = state.providerConfigs[providerId]?.enabled ?? true;
          return {
            features: state.features.map(f =>
              f.id === id ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f
            ),
            providerConfigs: {
              ...state.providerConfigs,
              [providerId]: {
                ...state.providerConfigs[providerId],
                enabled: !currentEnabled
              }
            }
          };
        }
        return {
          features: state.features.map(f =>
            f.id === id ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f
          )
        };
      }),

      isFeatureEnabled: (id) => {
        const feature = get().features.find(f => f.id === id);
        return feature ? feature.enabled : false;
      },

      updateProviderConfig: (provider, config) => set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [provider]: { ...state.providerConfigs[provider], ...config }
        }
      })),

      toggleProvider: (provider) => set((state) => {
        const newEnabled = !state.providerConfigs[provider].enabled;
        const featureId = `provider-${provider}`;
        return {
          providerConfigs: {
            ...state.providerConfigs,
            [provider]: {
              ...state.providerConfigs[provider],
              enabled: newEnabled
            }
          },
          features: state.features.map(f =>
            f.id === featureId ? { ...f, enabled: newEnabled, updatedAt: new Date().toISOString() } : f
          )
        };
      }),

      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),

      refreshAnalytics: () => {
        set({ analytics: emptyAnalytics });
      },

      setCurrentUser: (userId) => {
        set({ currentUserId: userId });
      },

      toggleUserProviderAccess: (userId, provider) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (user.id !== userId) return user;
            const isAllowed = user.allowedProviders.includes(provider);
            return {
              ...user,
              allowedProviders: isAllowed
                ? user.allowedProviders.filter((p) => p !== provider)
                : [...user.allowedProviders, provider]
            };
          })
        }));
      },

      getUserAllowedProviders: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        return user?.allowedProviders ?? [];
      },

      isProviderAllowedForUser: (userId, provider) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return false;
        return user.allowedProviders.includes(provider);
      },
    }),
    {
      name: 'byok-admin-store',
    }
  )
);
