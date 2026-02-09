import { create } from 'zustand';
import type { VideoClip } from './videoStore';

interface SequencerState {
    clips: VideoClip[];
    selectedClipId: string | null;
    isExporting: boolean;
    exportProgress: number;

    // Actions
    addClip: (clip: VideoClip) => void;
    removeClip: (id: string) => void;
    reorderClips: (fromIndex: number, toIndex: number) => void;
    selectClip: (id: string | null) => void;
    clearSequencer: () => void;
    startExport: () => void;
    updateExportProgress: (progress: number) => void;
    completeExport: () => void;
}

export const useSequencerStore = create<SequencerState>((set) => ({
    clips: [],
    selectedClipId: null,
    isExporting: false,
    exportProgress: 0,

    addClip: (clip) => set((state) => ({
        clips: [...state.clips, clip],
    })),

    removeClip: (id) => set((state) => ({
        clips: state.clips.filter((clip) => clip.id !== id),
        selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),

    reorderClips: (fromIndex, toIndex) => set((state) => {
        const newClips = [...state.clips];
        const [removed] = newClips.splice(fromIndex, 1);
        newClips.splice(toIndex, 0, removed);
        return { clips: newClips };
    }),

    selectClip: (id) => set({ selectedClipId: id }),

    clearSequencer: () => set({ clips: [], selectedClipId: null }),

    startExport: () => set({ isExporting: true, exportProgress: 0 }),

    updateExportProgress: (progress) => set({ exportProgress: progress }),

    completeExport: () => set({ isExporting: false, exportProgress: 0 }),
}));
