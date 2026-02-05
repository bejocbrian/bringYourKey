import { ProviderConfig } from '@/lib/types';

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  'google-veo': {
    id: 'google-veo',
    name: 'Google Veo 2',
    description: 'High-quality video generation by Google DeepMind',
    icon: 'Video',
    baseUrl: 'https://aiplatform.googleapis.com/v1/projects',
    requiresAuth: true,
    maxDuration: 8,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
  },
  'meta-movie-gen': {
    id: 'meta-movie-gen',
    name: 'Meta Movie Gen',
    description: 'Advanced video generation from Meta',
    icon: 'Film',
    baseUrl: 'https://api.meta.com/v1/moviegen',
    requiresAuth: true,
    maxDuration: 16,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
  },
  'runway': {
    id: 'runway',
    name: 'Runway Gen-3',
    description: 'Professional video generation by Runway',
    icon: 'Play',
    baseUrl: 'https://api.runwayml.com/v1',
    requiresAuth: true,
    maxDuration: 18,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
  },
};

export async function generateVideo(
  provider: string,
  prompt: string,
  apiKey: string,
  settings: VideoGenerationSettings
): Promise<{ videoUrl: string; generationId: string }> {
  switch (provider) {
    case 'google-veo':
      return generateGoogleVeoVideo(prompt, apiKey, settings);
    case 'meta-movie-gen':
      return generateMetaMovieGenVideo(prompt, apiKey, settings);
    case 'runway':
      return generateRunwayVideo(prompt, apiKey, settings);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function generateGoogleVeoVideo(
  prompt: string,
  apiKey: string,
  settings: VideoGenerationSettings
): Promise<{ videoUrl: string; generationId: string }> {
  const projectId = apiKey.split(':')[0] || 'demo-project';
  
  const response = await fetch(
    `${PROVIDER_CONFIGS['google-veo'].baseUrl}/${projectId}/locations/us-central1/publishers/google/models/veo-2.0-generate-001:predictLongRunning`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt,
            promptNegative: '',
            duration: settings.duration || 4,
            aspectRatio: settings.aspectRatio || '16:9',
            seed: Math.floor(Math.random() * 1000000),
          },
        ],
        parameters: {
          sampleCount: 1,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate video with Google Veo');
  }

  const data = await response.json();
  
  return {
    videoUrl: data.name,
    generationId: data.name,
  };
}

async function generateMetaMovieGenVideo(
  prompt: string,
  apiKey: string,
  settings: VideoGenerationSettings
): Promise<{ videoUrl: string; generationId: string }> {
  const response = await fetch(`${PROVIDER_CONFIGS['meta-movie-gen'].baseUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      duration: settings.duration || 4,
      aspect_ratio: settings.aspectRatio || '16:9',
      quality: settings.quality || 'standard',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate video with Meta Movie Gen');
  }

  const data = await response.json();
  
  return {
    videoUrl: data.video_url,
    generationId: data.generation_id,
  };
}

async function generateRunwayVideo(
  prompt: string,
  apiKey: string,
  settings: any
): Promise<{ videoUrl: string; generationId: string }> {
  const response = await fetch(`${PROVIDER_CONFIGS['runway'].baseUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Runway-Version': '2024-09-26',
    },
    body: JSON.stringify({
      promptText: prompt,
      model: 'gen3a_turbo',
      duration: settings.duration || 5,
      ratio: settings.aspectRatio === '9:16' ? '9:16' : settings.aspectRatio === '1:1' ? '1:1' : '16:9',
      watermark: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to generate video with Runway');
  }

  const data = await response.json();
  
  return {
    videoUrl: data.output?.[0] || '',
    generationId: data.id,
  };
}

export async function checkGenerationStatus(
  provider: string,
  generationId: string,
  apiKey: string
): Promise<{ status: 'pending' | 'processing' | 'completed' | 'failed'; videoUrl?: string; error?: string }> {
  const config = PROVIDER_CONFIGS[provider];

  switch (provider) {
    case 'google-veo':
      return checkGoogleVeoStatus(generationId, apiKey);
    case 'meta-movie-gen':
      return checkMetaMovieGenStatus(generationId, apiKey);
    case 'runway':
      return checkRunwayStatus(generationId, apiKey);
    default:
      return { status: 'failed', error: 'Unsupported provider' };
  }
}

async function checkGoogleVeoStatus(
  generationId: string,
  apiKey: string
): Promise<{ status: 'pending' | 'processing' | 'completed' | 'failed'; videoUrl?: string; error?: string }> {
  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/${generationId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    return { status: 'failed', error: 'Failed to check generation status' };
  }

  const data = await response.json();
  
  if (data.done) {
    const predictions = data.response?.predictions || [];
    if (predictions.length > 0) {
      return { status: 'completed', videoUrl: predictions[0].videoUri };
    }
    return { status: 'failed', error: 'No video generated' };
  }
  
  return { status: 'processing' };
}

async function checkMetaMovieGenStatus(
  generationId: string,
  apiKey: string
): Promise<{ status: 'pending' | 'processing' | 'completed' | 'failed'; videoUrl?: string; error?: string }> {
  const response = await fetch(
    `${PROVIDER_CONFIGS['meta-movie-gen'].baseUrl}/status/${generationId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    return { status: 'failed', error: 'Failed to check generation status' };
  }

  const data = await response.json();
  
  if (data.status === 'completed') {
    return { status: 'completed', videoUrl: data.video_url };
  } else if (data.status === 'failed') {
    return { status: 'failed', error: data.error || 'Generation failed' };
  } else if (data.status === 'processing') {
    return { status: 'processing', videoUrl: data.preview_url };
  }
  
  return { status: 'pending' };
}

async function checkRunwayStatus(
  generationId: string,
  apiKey: string
): Promise<{ status: 'pending' | 'processing' | 'completed' | 'failed'; videoUrl?: string; error?: string }> {
  const response = await fetch(
    `${PROVIDER_CONFIGS['runway'].baseUrl}/tasks/${generationId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    return { status: 'failed', error: 'Failed to check generation status' };
  }

  const data = await response.json();
  
  if (data.status === 'SUCCEEDED') {
    return { status: 'completed', videoUrl: data.output?.[0] };
  } else if (data.status === 'FAILED') {
    return { status: 'failed', error: data.failureReason || 'Generation failed' };
  } else if (data.status === 'RUNNING') {
    return { status: 'processing', videoUrl: data.progress?.output };
  }
  
  return { status: 'pending' };
}
