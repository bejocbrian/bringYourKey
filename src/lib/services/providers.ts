import { Provider } from '@/lib/types';

export const PROVIDERS: Record<Provider, {
  name: string;
  description: string;
  docsUrl: string;
  maxDuration: number;
  supportedRatios: Array<'16:9' | '9:16' | '1:1'>;
  supportedDurations?: number[];
}> = {
  'google-veo': {
    name: 'Google Veo 3.1 Fast',
    description: "Google's Veo fast video generation model",
    docsUrl: 'https://cloud.google.com/vertex-ai/docs/generative-ai/video/overview',
    maxDuration: 8,
    supportedRatios: ['16:9', '9:16', '1:1'],
    supportedDurations: [4, 6, 8],
  },
  'meta-moviegen': {
    name: 'Meta Movie Gen',
    description: "Meta's AI video generation model",
    docsUrl: 'https://ai.meta.com/',
    maxDuration: 16,
    supportedRatios: ['16:9', '9:16'],
  },
  'runway-gen3': {
    name: 'Runway Gen-3',
    description: "Runway's latest video generation model",
    docsUrl: 'https://runwayml.com/',
    maxDuration: 10,
    supportedRatios: ['16:9', '9:16', '1:1'],
  },
};
