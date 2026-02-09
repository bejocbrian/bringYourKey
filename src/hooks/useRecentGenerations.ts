import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { VideoClip } from '../store/videoStore';

export function useRecentGenerations() {
    const [recentClips, setRecentClips] = useState<VideoClip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const { data, error } = await supabase
                    .from('generations')
                    .select('*')
                    .eq('status', 'complete')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;

                if (data) {
                    const clips: VideoClip[] = data.map((gen) => ({
                        id: gen.id,
                        url: gen.result_url || '',
                        thumbnail: gen.thumbnail_url, // Assuming schema has this
                        prompt: gen.prompt,
                        duration: 4, // Default
                        createdAt: gen.created_at,
                    })).filter(c => c.url); // Ensure URL exists

                    setRecentClips(clips);
                }
            } catch (error) {
                console.error('Error fetching recent generations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecent();

        // Subscribe to new completions
        const channel = supabase
            .channel('recent_generations')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'generations',
                    filter: 'status=eq.complete',
                },
                (_) => {
                    // Refresh list or optimistic update
                    fetchRecent();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { recentClips, isLoading };
}
