import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VideoGenerationRequest } from '@/lib/types';

interface GenerationState {
  generations: VideoGenerationRequest[];
  activeGenerationId: string | null;
  queue: VideoGenerationRequest[];
  
  addGeneration: (generation: VideoGenerationRequest) => void;
  updateGeneration: (id: string, updates: Partial<VideoGenerationRequest>) => void;
  removeGeneration: (id: string) => void;
  setActiveGeneration: (id: string | null) => void;
  addToQueue: (generation: VideoGenerationRequest) => void;
  removeFromQueue: (id: string) => void;
  processNextInQueue: () => void;
  getGenerationsByProvider: (provider: string) => VideoGenerationRequest[];
  getCompletedGenerations: () => VideoGenerationRequest[];
  clearFailedGenerations: () => void;
  resetAll: () => void;
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      generations: [],
      activeGenerationId: null,
      queue: [],

      addGeneration: (generation: VideoGenerationRequest) => {
        set((state) => ({
          generations: [generation, ...state.generations],
        }));
      },

      updateGeneration: (id: string, updates: Partial<VideoGenerationRequest>) => {
        set((state) => ({
          generations: state.generations.map(g =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },

      removeGeneration: (id: string) => {
        set((state) => ({
          generations: state.generations.filter(g => g.id !== id),
          queue: state.queue.filter(g => g.id !== id),
          activeGenerationId: state.activeGenerationId === id ? null : state.activeGenerationId,
        }));
      },

      setActiveGeneration: (id: string | null) => {
        set({ activeGenerationId: id });
      },

      addToQueue: (generation: VideoGenerationRequest) => {
        set((state) => ({
          queue: [...state.queue, generation],
          generations: [generation, ...state.generations],
        }));
      },

      removeFromQueue: (id: string) => {
        set((state) => ({
          queue: state.queue.filter(g => g.id !== id),
        }));
      },

      processNextInQueue: () => {
        const { queue, addToQueue, removeFromQueue } = get();
        if (queue.length > 0) {
          const next = queue[0];
          removeFromQueue(next.id);
        }
      },

      getGenerationsByProvider: (provider: string) => {
        return get().generations.filter(g => g.provider === provider);
      },

      getCompletedGenerations: () => {
        return get().generations.filter(g => g.status === 'completed');
      },

      clearFailedGenerations: () => {
        set((state) => ({
          generations: state.generations.filter(g => g.status !== 'failed'),
        }));
      },

      resetAll: () => {
        set({
          generations: [],
          activeGenerationId: null,
          queue: [],
        });
      },
    }),
    {
      name: 'generation-storage',
    }
  )
);
