import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef } from 'react';
import { useVideoStore } from '../store/videoStore';

export function WorkspaceCanvas() {
    const { activeGeneration } = useVideoStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleMuteToggle = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const hasVideo = activeGeneration?.resultUrl;

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative w-full max-w-5xl">
                {/* Glass Frame with Glow */}
                <div className="glass-panel p-1 shadow-glow">
                    {/* 16:9 Aspect Ratio Container */}
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        {hasVideo ? (
                            <>
                                <video
                                    ref={videoRef}
                                    src={activeGeneration.resultUrl}
                                    className="w-full h-full object-contain"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />

                                {/* Video Controls Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handlePlayPause}
                                            className="glass-panel hover:bg-glass-hover p-3 rounded-full transition-all"
                                        >
                                            {isPlaying ? (
                                                <Pause className="w-5 h-5" />
                                            ) : (
                                                <Play className="w-5 h-5 ml-0.5" />
                                            )}
                                        </button>

                                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 w-0" />
                                        </div>

                                        <button
                                            onClick={handleMuteToggle}
                                            className="glass-panel hover:bg-glass-hover p-3 rounded-full transition-all"
                                        >
                                            {isMuted ? (
                                                <VolumeX className="w-5 h-5" />
                                            ) : (
                                                <Volume2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                {/* Safety Guide Grid */}
                                <div className="absolute inset-0 border-2 border-dashed border-white/10">
                                    <div className="absolute inset-[10%] border border-dashed border-white/5" />
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5" />
                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                                </div>

                                {/* Placeholder */}
                                <div className="relative z-10 text-center space-y-4">
                                    <div className="w-20 h-20 mx-auto rounded-full glass-panel flex items-center justify-center">
                                        <Play className="w-10 h-10 text-purple-400 opacity-50 ml-1" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white/70">No Video Preview</h3>
                                        <p className="text-sm text-white/40 mt-2">Generate a video to see it here</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 16:9 Guide Indicator */}
                        <div className="absolute top-4 right-4 glass-panel px-3 py-1.5 text-xs font-medium">
                            16:9 Preview
                        </div>
                    </div>
                </div>

                {/* Generation Status Overlay */}
                {activeGeneration && activeGeneration.status !== 'complete' && activeGeneration.status !== 'failed' && (
                    <div className="absolute inset-0 glass-panel backdrop-blur-xl flex items-center justify-center rounded-lg">
                        <div className="text-center space-y-4">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
                                <div
                                    className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold gradient-text capitalize">
                                    {activeGeneration.status}...
                                </h3>
                                <p className="text-sm text-white/60 mt-2">
                                    Your video is being created
                                </p>
                                {activeGeneration.progress > 0 && (
                                    <div className="mt-4 w-64 mx-auto">
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                                style={{ width: `${activeGeneration.progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 mt-2">{activeGeneration.progress}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
