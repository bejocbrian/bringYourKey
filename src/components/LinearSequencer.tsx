import { Download, Trash2, GripVertical, Film, Play, X, Plus } from 'lucide-react';
import { useSequencerStore } from '../store/sequencerStore';
import { exportVideo } from '../services/api';
import { cn } from '../lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useRecentGenerations } from '../hooks/useRecentGenerations';

export function LinearSequencer() {
    const {
        clips,
        selectedClipId,
        selectClip,
        removeClip,
        addClip,
        reorderClips,
        isExporting,
        exportProgress,
        startExport,
        updateExportProgress,
        completeExport,
    } = useSequencerStore();

    const { recentClips } = useRecentGenerations();

    // Preview State
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const previewVideoRef = useRef<HTMLVideoElement>(null);

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Preview Logic
    useEffect(() => {
        if (isPreviewing && previewVideoRef.current && clips.length > 0) {
            previewVideoRef.current.src = clips[currentPreviewIndex].url;
            previewVideoRef.current.play().catch(console.error);
        }
    }, [isPreviewing, currentPreviewIndex, clips]);

    const handlePreviewEnded = () => {
        if (currentPreviewIndex < clips.length - 1) {
            setCurrentPreviewIndex((prev) => prev + 1);
        } else {
            setIsPreviewing(false);
            setCurrentPreviewIndex(0);
        }
    };

    const handleAddFromHistory = (clip: typeof recentClips[0]) => {
        // Create unique instance
        addClip({
            ...clip,
            id: `${clip.id}-${Date.now()}` // Unique ID for sequencer instance
        });
    };

    const handleExport = async () => {
        if (clips.length === 0) return;

        try {
            startExport();
            // Simulate export
            for (let i = 0; i <= 100; i += 10) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                updateExportProgress(i);
            }

            const response = await exportVideo({
                clipIds: clips.map((c) => c.id),
                format: 'mp4',
                quality: 'high',
            });

            const a = document.createElement('a');
            a.href = response.exportUrl;
            a.download = `byok-video-${Date.now()}.mp4`;
            a.click();

            completeExport();
        } catch (error) {
            console.error('Export failed:', error);
            completeExport();
        }
    };


    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (index: number) => {
        if (draggedIndex === null) return;
        reorderClips(draggedIndex, index);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };


    return (
        <div className="glass-panel mx-6 mb-6 p-4 flex flex-col gap-6">

            {/* Story Thread (Timeline) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold">Story Thread</h3>
                        <span className="text-xs text-white/40">
                            {clips.length} clip{clips.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {clips.length > 0 && (
                            <button
                                onClick={() => setIsPreviewing(true)}
                                className="glass-button flex items-center gap-2 text-sm px-3 py-1.5"
                            >
                                <Play className="w-4 h-4" />
                                Preview Full Story
                            </button>
                        )}

                        {isExporting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                        style={{ width: `${exportProgress}%` }}
                                    />
                                </div>
                                <span className="text-sm text-white/60">{exportProgress}%</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleExport}
                                disabled={clips.length === 0}
                                className="glass-button flex items-center gap-2 text-sm px-3 py-1.5 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        )}
                    </div>
                </div>

                {clips.length === 0 ? (
                    <div className="h-32 glass-panel border-dashed border-white/10 flex items-center justify-center">
                        <p className="text-sm text-white/40">Drag clips here from history below</p>
                    </div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 min-h-[140px]">
                        {clips.map((clip, index) => (
                            <div
                                key={clip.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={() => handleDrop(index)}
                                onClick={() => selectClip(clip.id)}
                                className={cn(
                                    'group relative flex-shrink-0 w-48 glass-panel cursor-pointer transition-all',
                                    selectedClipId === clip.id
                                        ? 'ring-2 ring-purple-500 shadow-glow'
                                        : 'hover:bg-white/10',
                                    dragOverIndex === index && 'border-l-2 border-purple-500 pl-1'
                                )}
                            >
                                <div className="absolute top-2 left-2 p-1 glass-panel rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <GripVertical className="w-3 h-3" />
                                </div>

                                <div className="aspect-video bg-black rounded-t overflow-hidden">
                                    {clip.thumbnail ? (
                                        <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={clip.url} className="w-full h-full object-cover" />
                                    )}
                                </div>

                                <div className="p-2">
                                    <p className="text-xs text-white/80 line-clamp-1 mb-1">{clip.prompt}</p>
                                    <div className="flex items-center justify-between text-[10px] text-white/50">
                                        <span>{clip.duration}s</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeClip(clip.id);
                                            }}
                                            className="p-1 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 w-5 h-5 glass-panel rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History Strip */}
            <div>
                <h4 className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">Recent History</h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {recentClips.map((clip) => (
                        <div
                            key={clip.id}
                            className="relative flex-shrink-0 w-32 glass-panel hover:bg-white/10 transition-all cursor-pointer group"
                            onClick={() => handleAddFromHistory(clip)}
                        >
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-lg">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <div className="aspect-video bg-black rounded-t overflow-hidden">
                                {clip.thumbnail ? (
                                    <img src={clip.thumbnail} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <video src={clip.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                            <div className="p-2">
                                <p className="text-[10px] text-white/60 line-clamp-1">{clip.prompt}</p>
                            </div>
                        </div>
                    ))}
                    {recentClips.length === 0 && (
                        <div className="text-xs text-white/30 italic py-4">No recent history found.</div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setIsPreviewing(false)}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <video
                            ref={previewVideoRef}
                            className="w-full h-full"
                            controls
                            autoPlay
                            onEnded={handlePreviewEnded}
                        />

                        <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/50 rounded-full text-xs font-mono">
                            Clip {currentPreviewIndex + 1} / {clips.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
