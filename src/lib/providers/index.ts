import { GenerationRequest, Provider } from '@/lib/types';

export interface ProviderGenerationInput {
  provider: Provider;
  prompt: string;
  settings: GenerationRequest['settings'];
  accessToken: string;
}

export interface ProviderGenerationResult {
  resultUrl: string;
}

interface ProviderGenerationResponse {
  status: 'running' | 'completed' | 'failed';
  error?: string;
  result?: {
    gcsUri?: string;
    base64?: string;
    mimeType?: string;
  };
}

const GOOGLE_GENERATE_ENDPOINT = '/api/generate/google';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 80;

const sleep = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

const createBlobUrl = (base64: string, mimeType: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
};

const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object') return fallback;
  if ('error' in payload && typeof (payload as { error?: string }).error === 'string') {
    return (payload as { error: string }).error;
  }
  if ('message' in payload && typeof (payload as { message?: string }).message === 'string') {
    return (payload as { message: string }).message;
  }
  return fallback;
};

const pollGoogleOperation = async (operation: string, accessToken: string) => {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${GOOGLE_GENERATE_ENDPOINT}?operation=${encodeURIComponent(operation)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let payload: ProviderGenerationResponse | null = null;
    try {
      payload = (await response.json()) as ProviderGenerationResponse;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = extractErrorMessage(payload, 'Failed to poll video generation.');
      throw new Error(message);
    }

    if (payload?.status === 'completed' && payload.result) {
      return payload.result;
    }

    if (payload?.status === 'failed') {
      throw new Error(payload.error || 'Video generation failed.');
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error('Video generation timed out.');
};

const generateWithGoogle = async ({ prompt, settings, accessToken }: ProviderGenerationInput): Promise<ProviderGenerationResult> => {
  const response = await fetch(GOOGLE_GENERATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt, settings }),
  });

  let payload: { operation?: string } | null = null;
  try {
    payload = (await response.json()) as { operation?: string };
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.operation) {
    const message = extractErrorMessage(payload, 'Failed to start video generation.');
    throw new Error(message);
  }

  const result = await pollGoogleOperation(payload.operation, accessToken);
  if (result.gcsUri) {
    return { resultUrl: result.gcsUri };
  }

  if (result.base64) {
    const mimeType = result.mimeType || 'video/mp4';
    const url = createBlobUrl(result.base64, mimeType);
    return { resultUrl: url };
  }

  throw new Error('Video generation completed without output.');
};

export const generateVideo = async (input: ProviderGenerationInput): Promise<ProviderGenerationResult> => {
  switch (input.provider) {
    case 'google-veo':
      return generateWithGoogle(input);
    default:
      throw new Error('Selected provider is not yet supported.');
  }
};
