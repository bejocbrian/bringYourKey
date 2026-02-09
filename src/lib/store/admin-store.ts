import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FeatureFlag,
  ProviderConfig,
  AppSettings,
  AnalyticsData,
  Provider,
  Profile
} from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Create client once
const supabase = createClient();

interface AdminState {
  // Feature flags
  features: FeatureFlag[];
  isLoadingFeatures: boolean;
  loadFeatures: () => Promise<void>;
  toggleFeature: (id: string, enabled: boolean) => Promise<void>;
  isFeatureEnabled: (key: string) => boolean;

  // Provider configs
  providerConfigs: ProviderConfig[];
  isLoadingProviders: boolean;
  loadProviders: () => Promise<void>;
  updateProviderConfig: (id: string, updates: Partial<ProviderConfig>) => Promise<void>;

  // App settings
  settings: AppSettings | null;
  isLoadingSettings: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (key: string, value: any) => Promise<void>;

  // Users
  users: Profile[];
  totalUsers: number;
  isLoadingUsers: boolean;
  loadUsers: (page?: number, search?: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  updateUserProviders: (userId: string, providers: string[]) => Promise<void>;

  // Analytics
  analytics: AnalyticsData;
  isLoadingAnalytics: boolean;
  loadAnalytics: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;

  // Helper to init all
  init: () => Promise<void>;

  // Subscriptions
  subscriptions: RealtimeChannel[];
  subscribeToAll: () => void;
  unsubscribeAll: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Features
      features: [],
      isLoadingFeatures: false,
      loadFeatures: async () => {
        set({ isLoadingFeatures: true });
        const { data } = await supabase.from('feature_flags').select('*').order('created_at', { ascending: false });
        if (data) set({ features: data as FeatureFlag[] });
        set({ isLoadingFeatures: false });
      },
      toggleFeature: async (id, enabled) => {
        // Optimistic update
        const currentFeatures = get().features;
        set({ features: currentFeatures.map(f => f.id === id ? { ...f, enabled } : f) });

        const { error } = await supabase.from('feature_flags').update({ enabled }).eq('id', id);
        if (error) {
          // Rollback
          set({ features: currentFeatures });
          console.error('Failed to toggle feature:', error);
        }
      },
      isFeatureEnabled: (key: string) => {
        const feature = get().features.find(f => f.name === key || f.id === key);
        return feature ? feature.enabled : false;
      },

      // Providers
      providerConfigs: [],
      isLoadingProviders: false,
      loadProviders: async () => {
        set({ isLoadingProviders: true });
        const { data } = await supabase.from('provider_configs').select('*').order('name');
        if (data) set({ providerConfigs: data as unknown as ProviderConfig[] });
        set({ isLoadingProviders: false });
      },
      updateProviderConfig: async (id, updates) => {
        const currentConfigs = get().providerConfigs;
        set({ providerConfigs: currentConfigs.map(p => p.id === id ? { ...p, ...updates } : p) });

        const { error } = await supabase.from('provider_configs').update(updates).eq('id', id);
        if (error) {
          set({ providerConfigs: currentConfigs });
          console.error('Failed to update provider:', error);
        }
      },

      // Settings
      settings: null,
      isLoadingSettings: false,
      loadSettings: async () => {
        set({ isLoadingSettings: true });
        const { data } = await supabase.from('app_settings').select('*');
        if (data) {
          const settingsObj = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
          set({ settings: settingsObj as AppSettings });
        }
        set({ isLoadingSettings: false });
      },
      updateSettings: async (key, value) => {
        const { error } = await supabase.from('app_settings').upsert({ key, value });
        if (error) console.error('Failed to update settings:', error);
        else get().loadSettings(); // Reload to confirm
      },

      // Users
      users: [],
      totalUsers: 0,
      isLoadingUsers: false,
      loadUsers: async (page = 1, search = '') => {
        set({ isLoadingUsers: true });
        let query = supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false });

        if (search) {
          query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        const limit = 20;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);

        if (data) {
          set({ users: data as Profile[], totalUsers: count || 0 });
        }
        if (error) console.error(error);
        set({ isLoadingUsers: false });
      },
      updateUserRole: async (userId, role) => {
        const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
        if (error) console.error(error);
        else get().loadUsers();
      },
      updateUserProviders: async (userId, providers) => {
        const { error } = await supabase.from('profiles').update({ allowed_providers: providers }).eq('id', userId);
        if (error) console.error(error);
        else get().loadUsers();
      },

      // Analytics
      analytics: {
        generations: [],
        providerUsage: [],
        topPrompts: { words: [], count: 0 },
        overview: { totalUsers: 0, totalGenerations: 0, activeUsers24h: 0 }
      },
      isLoadingAnalytics: false,
      loadAnalytics: async () => {
        set({ isLoadingAnalytics: true })
        try {
          const response = await fetch('/api/admin/analytics')
          if (response.ok) {
            const data = await response.json()
            set({ analytics: data })
          }
        } catch (error) {
          console.error("Failed to load analytics:", error)
        } finally {
          set({ isLoadingAnalytics: false })
        }
      },
      refreshAnalytics: async () => {
        await get().loadAnalytics()
      },

      // Init
      init: async () => {
        await Promise.all([
          get().loadFeatures(),
          get().loadProviders(),
          get().loadSettings(),
          get().loadUsers(),
          get().loadAnalytics()
        ]);
        get().subscribeToAll();
      },

      // Subscriptions
      subscriptions: [],
      subscribeToAll: () => {
        const { subscriptions } = get();
        if (subscriptions.length > 0) return; // Already subscribed

        const featureSub = supabase.channel('features-local')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, () => get().loadFeatures())
          .subscribe();

        const providerSub = supabase.channel('providers-local')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'provider_configs' }, () => get().loadProviders())
          .subscribe();

        const settingsSub = supabase.channel('settings-local')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => get().loadSettings())
          .subscribe();

        set({ subscriptions: [featureSub, providerSub, settingsSub] });
      },
      unsubscribeAll: () => {
        get().subscriptions.forEach(sub => sub.unsubscribe());
        set({ subscriptions: [] });
      }
    }),
    {
      name: 'byok-admin-store-v2',
      partialize: (state) => ({
        features: state.features,
        providerConfigs: state.providerConfigs,
        settings: state.settings
      }),
    }
  )
);
