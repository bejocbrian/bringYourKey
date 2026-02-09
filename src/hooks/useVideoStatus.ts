import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface GenerationStatus {
    id: string;
    status: 'pending' | 'dreaming' | 'rendering' | 'polishing' | 'complete' | 'failed';
    progress: number;
    result_url?: string;
    thumbnail_url?: string;
    error?: string;
}

export function useVideoStatus(jobId: string | null) {
    const [status, setStatus] = useState<GenerationStatus | null>(null);
    const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!jobId) return;

        console.log(`Subscribing to generation: ${jobId}`);

        // Initial fetch
        const fetchStatus = async () => {
            const { data } = await supabase
                .from('generations')
                .select('*')
                .eq('id', jobId)
                .single();

            if (data) {
                setStatus(data as GenerationStatus);
            }
        };

        fetchStatus();

        // Realtime subscription
        const channel = supabase
            .channel(`generation-${jobId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'generations',
                    filter: `id=eq.${jobId}`,
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    const newStatus = payload.new as GenerationStatus;
                    setStatus(newStatus);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [jobId]);

    // Progressive Loading Estimate
    useEffect(() => {
        if (status?.status === 'rendering' || status?.status === 'dreaming' || status?.status === 'polishing') {
            const progress = status.progress || 0;
            const remaining = Math.max(0, 60 - (progress / 100) * 60);
            setEstimatedTimeRemaining(Math.floor(remaining));
        } else {
            setEstimatedTimeRemaining(null);
        }
    }, [status]);

    return { status, estimatedTimeRemaining };
}
