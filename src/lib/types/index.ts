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
