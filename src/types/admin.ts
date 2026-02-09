// Admin-specific type definitions

export type Provider = 'google-veo' | 'meta-moviegen' | 'runway-gen3' | 'luma-ai';

export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    category: 'core' | 'experimental' | 'provider';
    created_at: string;
    updated_at: string;
    [key: string]: string | number | boolean;
}

export interface ProviderConfig {
    id: string;
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
    [key: string]: string | number | boolean | string[];
}

export interface UserProfile {
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
