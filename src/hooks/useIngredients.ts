import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useIngredientStore } from '../store/ingredientStore';

export function useIngredients() {
    const { setIngredients } = useIngredientStore();

    useEffect(() => {
        const fetchIngredients = async () => {
            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching ingredients:', error);
                return;
            }

            if (data) {
                // Map Supabase data to store format if needed
                // Assuming schema matches store interface roughly
                setIngredients(data.map(item => ({
                    id: item.id,
                    tag: item.tag,
                    name: item.name,
                    type: item.type,
                    referenceImages: item.reference_images || [],
                    createdAt: item.created_at
                })));
            }
        };

        fetchIngredients();

        // Subscribe to changes
        const channel = supabase
            .channel('ingredients_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ingredients' },
                () => {
                    fetchIngredients();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [setIngredients]);
}
