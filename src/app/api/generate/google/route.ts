import { NextRequest, NextResponse } from 'next/server';

const PROJECT_ID = 'coral-loop-466210-j0';
const LOCATION = 'asia-south1';
const MODEL_ID = 'veo-3.1-fast-generate-001';

const VERTEX_BASE_URL = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}`;

const getAccessToken = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '').trim();
};

const buildOperationUrl = (operation: string) => {
  const normalized = operation.startsWith('projects/')
    ? operation
    : `projects/${PROJECT_ID}/locations/${LOCATION}/operations/${operation}`;
  return `https://${LOCATION}-aiplatform.googleapis.com/v1/${normalized}`;
};

const parsePredictionResult = (responseBody: Record<string, unknown>) => {
  const predictions = responseBody.predictions as Array<Record<string, unknown>> | undefined;
  const outputs = responseBody.outputs as Array<Record<string, unknown>> | undefined;
  const candidates = predictions && predictions.length > 0 ? predictions : outputs;
  const candidate = candidates?.[0];

  const videoPayload = (candidate?.video as Record<string, unknown> | undefined) ?? candidate;
  if (!videoPayload || typeof videoPayload !== 'object') {
    return null;
  }

  return {
    gcsUri: (videoPayload.gcsUri || videoPayload.storageUri || videoPayload.uri) as string | undefined,
    base64: (videoPayload.bytesBase64Encoded || videoPayload.bytesBase64 || videoPayload.videoBytesBase64) as
      | string
      | undefined,
    mimeType: videoPayload.mimeType as string | undefined,
  };
};

export async function POST(request: NextRequest) {
  const accessToken = getAccessToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token.' }, { status: 401 });
  }

  let body: { prompt?: string; settings?: { duration?: number; aspectRatio?: string } } = {};
  try {
    body = (await request.json()) as { prompt?: string; settings?: { duration?: number; aspectRatio?: string } };
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  if (!body.prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const payload = {
    instances: [{ prompt: body.prompt }],
    parameters: {
      aspectRatio: body.settings?.aspectRatio,
      durationSeconds: body.settings?.duration,
    },
  };

  const response = await fetch(`${VERTEX_BASE_URL}:predictLongRunning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok || !json?.name) {
    const errorMessage = (json?.error as { message?: string } | undefined)?.message || 'Vertex AI request failed.';
    return NextResponse.json({ error: errorMessage }, { status: response.status || 502 });
  }

  return NextResponse.json({ operation: json.name });
}

export async function GET(request: NextRequest) {
  const accessToken = getAccessToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token.' }, { status: 401 });
  }

  const operation = request.nextUrl.searchParams.get('operation');
  if (!operation) {
    return NextResponse.json({ error: 'Operation name is required.' }, { status: 400 });
  }

  const response = await fetch(buildOperationUrl(operation), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok || !json) {
    const errorMessage = (json?.error as { message?: string } | undefined)?.message || 'Failed to fetch operation.';
    return NextResponse.json({ error: errorMessage }, { status: response.status || 502 });
  }

  if (json.error) {
    const errorMessage = (json.error as { message?: string } | undefined)?.message || 'Video generation failed.';
    return NextResponse.json({ status: 'failed', error: errorMessage }, { status: 502 });
  }

  if (!json.done) {
    return NextResponse.json({ status: 'running' });
  }

  const responseBody = json.response as Record<string, unknown> | undefined;
  if (!responseBody) {
    return NextResponse.json({ status: 'failed', error: 'Video generation completed without output.' }, { status: 502 });
  }

  const result = parsePredictionResult(responseBody);
  if (!result) {
    return NextResponse.json({ status: 'failed', error: 'Unable to parse video output.' }, { status: 502 });
  }

  return NextResponse.json({ status: 'completed', result });
}
