import { create } from 'zustand';

export interface Ingredient {
    id: string;
    tag: string; // e.g., "@Hero"
    name: string;
    referenceImages: string[];
    type: 'character' | 'object' | 'style' | 'location';
    createdAt: string;
}

interface IngredientState {
    ingredients: Ingredient[];
    selectedIngredientId: string | null;

    // Actions
    addIngredient: (ingredient: Ingredient) => void;
    setIngredients: (ingredients: Ingredient[]) => void;
    updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
    removeIngredient: (id: string) => void;
    selectIngredient: (id: string | null) => void;
    getIngredientByTag: (tag: string) => Ingredient | undefined;
}

export const useIngredientStore = create<IngredientState>((set, get) => ({
    ingredients: [],
    selectedIngredientId: null,

    setIngredients: (ingredients) => set({ ingredients }),

    addIngredient: (ingredient) => set((state) => ({
        ingredients: [...state.ingredients, ingredient],
    })),

    updateIngredient: (id, updates) => set((state) => ({
        ingredients: state.ingredients.map((ing) =>
            ing.id === id ? { ...ing, ...updates } : ing
        ),
    })),

    removeIngredient: (id) => set((state) => ({
        ingredients: state.ingredients.filter((ing) => ing.id !== id),
        selectedIngredientId: state.selectedIngredientId === id ? null : state.selectedIngredientId,
    })),

    selectIngredient: (id) => set({ selectedIngredientId: id }),

    getIngredientByTag: (tag) => {
        return get().ingredients.find((ing) => ing.tag === tag);
    },
}));
