export type VideoProvider = 'google-veo' | 'meta-movie-gen' | 'runway';

export interface EncryptedData {
  encryptedKey: string;
  name?: string;
  createdAt: string;
}

export interface VideoGenerationRequest {
  id: string;
  prompt: string;
  provider: VideoProvider;
  settings: VideoGenerationSettings;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  videoUrl?: string;
  errorMessage?: string;
}

export interface VideoGenerationSettings {
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'standard' | 'high';
  style?: string;
}

export interface ProviderConfig {
  id: VideoProvider;
  name: string;
  description: string;
  icon: string;
  baseUrl: string;
  requiresAuth: boolean;
  maxDuration: number;
  supportedAspectRatios: string[];
}

export interface ApiKey {
  id: string;
  provider: VideoProvider;
  key: string;
  name?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface UsageStats {
  provider: VideoProvider;
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalDuration: number;
  lastUsed?: Date;
}
