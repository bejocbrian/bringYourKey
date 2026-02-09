export type Provider = 'google-veo' | 'meta-moviegen' | 'runway-gen3';

export interface ApiKey {
  provider: Provider;
  key: string;
  name: string;
  projectId?: string; // Required for Google Vertex AI
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
  created_at: string;
  updated_at: string;
}

export interface ProviderConfig {
  id: string; // provider id
  name: string;
  enabled: boolean;
  is_default: boolean;
  rate_limit_rpm: number;
  rate_limit_rph: number;
  cost_per_generation: number;
  cost_currency: string;
  max_duration: number;
  min_duration: number;
  supported_ratios: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
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
  overview: {
    totalUsers: number;
    totalGenerations: number;
    activeUsers24h: number; // Placeholder for now
  };
}

export type User = Profile;

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended';
  allowed_providers: Provider[];
  generations_count: number;
  last_active: string | null;
  created_at: string;
  updated_at: string;
}
