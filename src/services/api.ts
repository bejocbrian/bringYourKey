import axios from 'axios';

// Configure base URL for your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface T2VRequest {
    prompt: string;
    aspectRatio: '16:9' | '9:16';
    audioPrompt?: string | null;
    referenceImages?: string[];
}

export interface I2VRequest {
    image: File;
    motionIntensity: number;
    aspectRatio: '16:9' | '9:16';
}

export interface GenerationResponse {
    jobId: string;
    status: string;
}

export interface StatusResponse {
    jobId: string;
    status: 'pending' | 'dreaming' | 'rendering' | 'polishing' | 'complete' | 'failed';
    progress: number;
    resultUrl?: string;
    error?: string;
}

export interface ExportRequest {
    clipIds: string[];
    format?: 'mp4' | 'webm';
    quality?: 'high' | 'medium' | 'low';
}

// Text-to-Video Generation
export async function generateTextToVideo(request: T2VRequest): Promise<GenerationResponse> {
    const response = await api.post('/generate/t2v', request);
    return response.data;
}

// Image-to-Video Generation
export async function generateImageToVideo(request: I2VRequest): Promise<GenerationResponse> {
    const formData = new FormData();
    formData.append('image', request.image);
    formData.append('motionIntensity', request.motionIntensity.toString());
    formData.append('aspectRatio', request.aspectRatio);

    const response = await api.post('/generate/i2v', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// Poll Generation Status
export async function getGenerationStatus(jobId: string): Promise<StatusResponse> {
    const response = await api.get(`/generation/${jobId}/status`);
    return response.data;
}

// Export/Stitch Video
export async function exportVideo(request: ExportRequest): Promise<{ exportUrl: string }> {
    const response = await api.post('/export', request);
    return response.data;
}

// Ingredient Management
export async function uploadIngredientImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/ingredients/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export default api;
