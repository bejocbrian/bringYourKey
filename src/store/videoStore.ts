import { create } from 'zustand';

export interface GenerationStatus {
    id: string;
    status: 'pending' | 'dreaming' | 'rendering' | 'polishing' | 'complete' | 'failed';
    progress: number;
    resultUrl?: string;
    error?: string;
    createdAt: string;
}

export interface VideoClip {
    id: string;
    url: string;
    thumbnail?: string;
    duration: number;
    prompt: string;
    createdAt: string;
}

export type GenerationMode = 't2v' | 'i2v' | 'ingredients';

interface VideoState {
    // Generation
    currentMode: GenerationMode;
    activeGeneration: GenerationStatus | null;
    isGenerating: boolean;

    // Text-to-Video
    textPrompt: string;
    audioPrompt: string | null;
    aspectRatio: '16:9' | '9:16';

    // Image-to-Video
    uploadedImage: File | null;
    imagePreviewUrl: string | null;
    motionIntensity: number;

    // Actions
    setMode: (mode: GenerationMode) => void;
    setTextPrompt: (prompt: string) => void;
    setAudioPrompt: (prompt: string | null) => void;
    setAspectRatio: (ratio: '16:9' | '9:16') => void;
    setUploadedImage: (file: File | null, previewUrl: string | null) => void;
    setMotionIntensity: (intensity: number) => void;
    startGeneration: (id: string) => void;
    updateGeneration: (status: Partial<GenerationStatus>) => void;
    completeGeneration: (url: string) => void;
    failGeneration: (error: string) => void;
    resetGeneration: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
    // Initial state
    currentMode: 't2v',
    activeGeneration: null,
    isGenerating: false,
    textPrompt: '',
    audioPrompt: null,
    aspectRatio: '16:9',
    uploadedImage: null,
    imagePreviewUrl: null,
    motionIntensity: 5,

    // Actions
    setMode: (mode) => set({ currentMode: mode }),
    setTextPrompt: (prompt) => set({ textPrompt: prompt }),
    setAudioPrompt: (prompt) => set({ audioPrompt: prompt }),
    setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
    setUploadedImage: (file, previewUrl) =>
        set({ uploadedImage: file, imagePreviewUrl: previewUrl }),
    setMotionIntensity: (intensity) => set({ motionIntensity: intensity }),

    startGeneration: (id) => set({
        isGenerating: true,
        activeGeneration: {
            id,
            status: 'pending',
            progress: 0,
            createdAt: new Date().toISOString(),
        },
    }),

    updateGeneration: (status) => set((state) => ({
        activeGeneration: state.activeGeneration
            ? { ...state.activeGeneration, ...status }
            : null,
    })),

    completeGeneration: (url) => set((state) => ({
        isGenerating: false,
        activeGeneration: state.activeGeneration
            ? { ...state.activeGeneration, status: 'complete', resultUrl: url, progress: 100 }
            : null,
    })),

    failGeneration: (error) => set((state) => ({
        isGenerating: false,
        activeGeneration: state.activeGeneration
            ? { ...state.activeGeneration, status: 'failed', error }
            : null,
    })),

    resetGeneration: () => set({
        activeGeneration: null,
        isGenerating: false,
    }),
}));
