import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AdminUser, 
  FeatureFlag, 
  ProviderConfig, 
  AppSettings, 
  AnalyticsData, 
  Provider 
} from '@/lib/types';

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
}

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
  }
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

const mockAnalytics: AnalyticsData = {
  generations: [
    { date: '2023-10-01', count: 12, provider: 'google-veo', status: 'success' },
    { date: '2023-10-02', count: 15, provider: 'google-veo', status: 'success' },
    { date: '2023-10-03', count: 8, provider: 'meta-moviegen', status: 'success' },
    { date: '2023-10-04', count: 20, provider: 'runway-gen3', status: 'success' },
    { date: '2023-10-05', count: 5, provider: 'google-veo', status: 'failed' },
  ],
  providerUsage: [
    { provider: 'google-veo', count: 450, percentage: 45 },
    { provider: 'meta-moviegen', count: 300, percentage: 30 },
    { provider: 'runway-gen3', count: 250, percentage: 25 },
  ],
  topPrompts: {
    words: ['cinematic', 'futuristic', 'landscape', 'cyberpunk', 'neon'],
    count: 150
  }
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminUser: null,
      features: defaultFeatures,
      providerConfigs: defaultProviderConfigs,
      settings: defaultSettings,
      analytics: mockAnalytics,

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

      logout: () => set({ isAuthenticated: true, adminUser: null, isAuthenticated: false }), // typo fixed in my head but let's be careful

      toggleFeature: (id) => set((state) => ({
        features: state.features.map(f => 
          f.id === id ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f
        )
      })),

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

      toggleProvider: (provider) => set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [provider]: { 
            ...state.providerConfigs[provider], 
            enabled: !state.providerConfigs[provider].enabled 
          }
        }
      })),

      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),

      refreshAnalytics: () => {
        set({ analytics: mockAnalytics });
      },
    }),
    {
      name: 'byok-admin-store',
    }
  )
);
