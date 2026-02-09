import { create } from 'zustand';
import type { FeatureFlag, ProviderConfig, UserProfile, Provider } from '../types/admin';

interface GenerationData {
    date: string;
    count: number;
    [key: string]: string | number;
}

interface ProviderUsage {
    provider: string;
    count: number;
    [key: string]: string | number;
}

interface Analytics {
    generations: GenerationData[];
    providerUsage: ProviderUsage[];
    topPrompts: {
        words: string[];
        count: number;
    };
}

interface AdminState {
    analytics: Analytics;
    users: UserProfile[];
    features: FeatureFlag[];
    providerConfigs: ProviderConfig[];
    isLoadingFeatures: boolean;
    isLoadingProviders: boolean;
    isLoadingUsers: boolean;
    totalUsers: number;

    // Actions
    toggleFeature: (id: string, enabled: boolean) => void;
    toggleProvider: (id: string) => void;
    updateProviderConfig: (id: string, updates: Partial<ProviderConfig>) => void;
    updateUserProviders: (userId: string, providers: Provider[]) => Promise<void>;
    loadUsers: (page?: number, search?: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
    analytics: {
        generations: [],
        providerUsage: [],
        topPrompts: {
            words: [],
            count: 0,
        },
    },
    users: [],
    features: [],
    providerConfigs: [],
    isLoadingFeatures: false,
    isLoadingProviders: false,
    isLoadingUsers: false,
    totalUsers: 0,

    toggleFeature: (id, enabled) =>
        set((state) => ({
            features: state.features.map((f) => (f.id === id ? { ...f, enabled, updated_at: new Date().toISOString() } : f)),
        })),

    toggleProvider: (id) =>
        set((state) => ({
            providerConfigs: state.providerConfigs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled, updated_at: new Date().toISOString() } : p)),
        })),

    updateProviderConfig: (id, updates) =>
        set((state) => ({
            providerConfigs: state.providerConfigs.map((p) =>
                p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
            ),
        })),

    updateUserProviders: async (userId, providers) => {
        set((state) => ({
            users: state.users.map((u) => (u.id === userId ? { ...u, allowed_providers: providers, updated_at: new Date().toISOString() } : u)),
        }));
    },

    loadUsers: async (_page = 1, _search = '') => {
        set({ isLoadingUsers: true });
        // Simulating API call - should be replaced with real Supabase fetch
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ isLoadingUsers: false });
    },
}));
