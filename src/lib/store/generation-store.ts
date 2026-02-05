import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GenerationRequest, Provider } from '@/lib/types';

interface GenerationState {
  generations: GenerationRequest[];
  activeGenerations: string[];
  addGeneration: (request: GenerationRequest) => void;
  updateGeneration: (id: string, updates: Partial<GenerationRequest>) => void;
  removeGeneration: (id: string) => void;
  getGenerationsByProvider: (provider: Provider) => GenerationRequest[];
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      generations: [],
      activeGenerations: [],

      addGeneration: (request) => {
        set((state) => ({
          generations: [request, ...state.generations],
          activeGenerations: request.status === 'generating'
            ? [...state.activeGenerations, request.id]
            : state.activeGenerations,
        }));
      },

      updateGeneration: (id, updates) => {
        set((state) => {
          const nextGenerations = state.generations.map((generation) =>
            generation.id === id ? { ...generation, ...updates } : generation
          );
          const shouldBeActive = updates.status === 'generating';
          const shouldRemoveActive = updates.status && updates.status !== 'generating';
          return {
            generations: nextGenerations,
            activeGenerations: shouldBeActive
              ? Array.from(new Set([...state.activeGenerations, id]))
              : shouldRemoveActive
              ? state.activeGenerations.filter((activeId) => activeId !== id)
              : state.activeGenerations,
          };
        });
      },

      removeGeneration: (id) => {
        set((state) => ({
          generations: state.generations.filter((generation) => generation.id !== id),
          activeGenerations: state.activeGenerations.filter((activeId) => activeId !== id),
        }));
      },

      getGenerationsByProvider: (provider) => {
        return get().generations.filter((generation) => generation.provider === provider);
      },
    }),
    {
      name: 'byok-generations',
    }
  )
);
