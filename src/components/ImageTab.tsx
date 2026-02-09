import { useCallback } from 'react';
import { Upload, Sparkles, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useVideoStore } from '../store/videoStore';
import { useSequencerStore } from '../store/sequencerStore';
import { generateImageToVideo, getGenerationStatus } from '../services/api';
import { cn } from '../lib/utils';

export function ImageTab() {
    const {
        uploadedImage,
        imagePreviewUrl,
        setUploadedImage,
        motionIntensity,
        setMotionIntensity,
        aspectRatio,
        setAspectRatio,
        isGenerating,
        startGeneration,
        updateGeneration,
        completeGeneration,
        failGeneration,
    } = useVideoStore();

    const { addClip } = useSequencerStore();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const previewUrl = URL.createObjectURL(file);
            setUploadedImage(file, previewUrl);
        }
    }, [setUploadedImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        },
        maxFiles: 1,
    });

    const handleRemoveImage = () => {
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setUploadedImage(null, null);
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;

        try {
            const generationId = `gen-${Date.now()}`;
            startGeneration(generationId);

            const response = await generateImageToVideo({
                image: uploadedImage,
                motionIntensity,
                aspectRatio,
            });

            pollStatus(response.jobId);
        } catch (error) {
            failGeneration(error instanceof Error ? error.message : 'Generation failed');
        }
    };

    const pollStatus = async (jobId: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const status = await getGenerationStatus(jobId);

                updateGeneration({
                    status: status.status,
                    progress: status.progress,
                });

                if (status.status === 'complete' && status.resultUrl) {
                    clearInterval(pollInterval);
                    completeGeneration(status.resultUrl);

                    addClip({
                        id: jobId,
                        url: status.resultUrl,
                        thumbnail: imagePreviewUrl || undefined,
                        duration: 4,
                        prompt: `Image-to-Video (Motion: ${motionIntensity})`,
                        createdAt: new Date().toISOString(),
                    });
                }

                if (status.status === 'failed') {
                    clearInterval(pollInterval);
                    failGeneration(status.error || 'Generation failed');
                }
            } catch (error) {
                clearInterval(pollInterval);
                failGeneration('Failed to check status');
            }
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Image to Video</h3>
                <p className="text-sm text-white/60">Upload an image and add motion to it</p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Upload Image</label>

                {imagePreviewUrl ? (
                    <div className="relative group">
                        <div className="glass-panel p-2 overflow-hidden">
                            <img
                                src={imagePreviewUrl}
                                alt="Preview"
                                className="w-full h-48 object-contain rounded"
                            />
                        </div>
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-4 right-4 glass-panel p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={cn(
                            'glass-panel border-2 border-dashed py-12 cursor-pointer transition-all',
                            isDragActive
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto glass-panel rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
                                </p>
                                <p className="text-xs text-white/40 mt-1">
                                    PNG, JPG, WEBP up to 10MB
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Motion Intensity Slider */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Motion Intensity</label>
                    <span className="text-sm text-purple-400 font-semibold">{motionIntensity}</span>
                </div>
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={motionIntensity}
                        onChange={(e) => setMotionIntensity(Number(e.target.value))}
                        className="w-full h-2 glass-panel rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${motionIntensity * 10}%, rgba(255,255,255,0.1) ${motionIntensity * 10}%, rgba(255,255,255,0.1) 100%)`,
                        }}
                    />
                </div>
                <div className="flex justify-between text-xs text-white/40">
                    <span>Subtle</span>
                    <span>Dynamic</span>
                </div>
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

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={!uploadedImage || isGenerating}
                className={cn(
                    'w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isGenerating
                        ? 'bg-purple-500/50 cursor-wait'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-glow hover:shadow-xl'
                )}
            >
                {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                    </>
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
