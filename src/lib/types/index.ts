export type Provider = 'google-veo' | 'meta-moviegen' | 'runway-gen3';

export interface ApiKey {
  provider: Provider;
  key: string;
  name: string;
  createdAt: string;
}

export interface GenerationRequest {
  id: string;
  provider: Provider;
  prompt: string;
  settings: {
    duration: number;
    aspectRatio: '16:9' | '9:16' | '1:1';
  };
  status: 'pending' | 'generating' | 'completed' | 'failed';
  resultUrl?: string;
  createdAt: string;
  error?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'superadmin' | 'admin';
  lastLogin: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'experimental' | 'provider';
  createdAt: string;
  updatedAt: string;
}

export interface ProviderConfig {
  id: Provider;
  enabled: boolean;
  isDefault: boolean;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  costEstimate: {
    perGeneration: number;
    currency: string;
  };
  settings: {
    maxDuration: number;
    minDuration: number;
    supportedRatios: string[];
  };
}

export interface AppSettings {
  appName: string;
  logoUrl?: string;
  theme: {
    primaryColor: string;
    darkMode: boolean;
  };
  defaults: {
    provider: Provider;
    duration: number;
    aspectRatio: string;
  };
  storage: {
    maxGenerationsPerUser: number;
    autoDeleteAfterDays: number;
  };
}

export interface AnalyticsData {
  generations: {
    date: string;
    count: number;
    provider: Provider;
    status: 'success' | 'failed';
  }[];
  providerUsage: {
    provider: Provider;
    count: number;
    percentage: number;
  }[];
  topPrompts: {
    words: string[];
    count: number;
  };
}
