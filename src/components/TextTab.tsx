import { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Clock } from 'lucide-react';
import { useVideoStore } from '../store/videoStore';
import { useSequencerStore } from '../store/sequencerStore';
import { generateTextToVideo } from '../services/api';
import { parsePromptTags } from '../utils/tagParser';
import { cn } from '../lib/utils';
import { useVideoStatus } from '../hooks/useVideoStatus';

export function TextTab() {
    const {
        textPrompt,
        setTextPrompt,
        audioPrompt,
        setAudioPrompt,
        aspectRatio,
        setAspectRatio,
        isGenerating,
        startGeneration,
        updateGeneration,
        completeGeneration,
        failGeneration,
        activeGeneration
    } = useVideoStore();

    const { addClip } = useSequencerStore();
    const [useAudio, setUseAudio] = useState(false);

    // Realtime Status Hook
    const { status: realtimeStatus, estimatedTimeRemaining } = useVideoStatus(activeGeneration?.id || null);

    const maxLength = 500;

    // Sync Realtime status with Store
    useEffect(() => {
        if (realtimeStatus) {
            updateGeneration({
                status: realtimeStatus.status,
                progress: realtimeStatus.progress,
            });

            if (realtimeStatus.status === 'complete' && realtimeStatus.result_url) {
                completeGeneration(realtimeStatus.result_url);

                // Add to sequencer
                addClip({
                    id: realtimeStatus.id,
                    url: realtimeStatus.result_url,
                    duration: 4, // Default, should really come from API/metadata
                    prompt: textPrompt, // Or from DB if we fetch it
                    createdAt: new Date().toISOString(),
                });
            }

            if (realtimeStatus.status === 'failed') {
                failGeneration(realtimeStatus.error || 'Generation failed');
            }
        }
    }, [realtimeStatus, updateGeneration, completeGeneration, failGeneration, addClip, textPrompt]);

    const handleGenerate = async () => {
        if (!textPrompt.trim()) return;

        try {
            // Need a job ID first to subscribe. 
            // In our new backend flow, the backend returns the ID immediately.
            // But to subscribe immediately, we need the ID.
            // The backend returns { jobId, status: "pending" }

            // Parse tags and get reference images
            const parsed = parsePromptTags(textPrompt);

            // Call API
            const response = await generateTextToVideo({
                prompt: textPrompt,
                aspectRatio,
                audioPrompt: useAudio ? audioPrompt : null,
                referenceImages: parsed.referenceImages,
            });

            const generationId = response.jobId;
            startGeneration(generationId);

        } catch (error) {
            failGeneration(error instanceof Error ? error.message : 'Generation failed');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Text to Video</h3>
                <p className="text-sm text-white/60">Describe your video and let AI create it</p>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Prompt</label>
                    <span className="text-xs text-white/40">
                        {textPrompt.length}/{maxLength}
                    </span>
                </div>
                <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value.slice(0, maxLength))}
                    placeholder="A cinematic shot of @Hero walking through a neon-lit city..."
                    className="w-full h-32 px-4 py-3 glass-panel resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <p className="text-xs text-white/40">
                    Use @ tags to reference ingredients (e.g., @Hero, @CityStreet)
                </p>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['16:9', '9:16'] as const).map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={cn(
                                'py-2 px-4 rounded-lg text-sm font-medium transition-all',
                                aspectRatio === ratio
                                    ? 'bg-purple-500 text-white shadow-glow'
                                    : 'glass-panel hover:bg-glass-hover'
                            )}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>

            {/* Audio Toggle */}
            <div className="glass-panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {useAudio ? (
                            <Volume2 className="w-4 h-4 text-purple-400" />
                        ) : (
                            <VolumeX className="w-4 h-4 text-white/40" />
                        )}
                        <span className="text-sm font-medium">Custom Audio Prompt</span>
                    </div>
                    <button
                        onClick={() => setUseAudio(!useAudio)}
                        className={cn(
                            'relative w-11 h-6 rounded-full transition-colors',
                            useAudio ? 'bg-purple-500' : 'bg-white/20'
                        )}
                    >
                        <div
                            className={cn(
                                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                                useAudio && 'translate-x-5'
                            )}
                        />
                    </button>
                </div>

                {useAudio && (
                    <input
                        type="text"
                        value={audioPrompt || ''}
                        onChange={(e) => setAudioPrompt(e.target.value)}
                        placeholder="Upbeat electronic music with city ambience..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                )}
            </div>

            {/* Progress Bar (when generating) */}
            {isGenerating && activeGeneration && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-purple-300">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            <span className="capitalize">{activeGeneration.status}...</span>
                        </div>
                        {estimatedTimeRemaining !== null && (
                            <div className="flex items-center gap-1 text-white/40">
                                <Clock className="w-3 h-3" />
                                <span>~{estimatedTimeRemaining}s left</span>
                            </div>
                        )}
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                            style={{ width: `${activeGeneration.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={!textPrompt.trim() || isGenerating}
                className={cn(
                    'w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isGenerating
                        ? 'bg-purple-500/50 cursor-wait'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-glow hover:shadow-xl'
                )}
            >
                {isGenerating ? (
                    'Generating...'
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Generate Video
                    </>
                )}
            </button>
        </div>
    );
}
