import { useIngredientStore } from '../store/ingredientStore';

export interface ParsedPrompt {
    originalPrompt: string;
    tags: string[];
    referenceImages: string[];
}

/**
 * Parse @ tags from a text prompt and extract reference images
 * Example: "A @Hero walking through @CityStreet" -> extracts @Hero and @CityStreet
 */
export function parsePromptTags(prompt: string): ParsedPrompt {
    // Match @ tags (e.g., @Hero, @Character1, @Scene_01)
    const tagRegex = /@(\w+)/g;
    const matches = prompt.match(tagRegex) || [];
    const uniqueTags = [...new Set(matches)];

    // Get ingredient store
    const { getIngredientByTag } = useIngredientStore.getState();

    // Collect all reference images from matched tags
    const referenceImages: string[] = [];
    uniqueTags.forEach((tag) => {
        const ingredient = getIngredientByTag(tag);
        if (ingredient) {
            referenceImages.push(...ingredient.referenceImages);
        }
    });

    return {
        originalPrompt: prompt,
        tags: uniqueTags,
        referenceImages,
    };
}

/**
 * Highlight @ tags in text for UI display
 */
export function highlightTags(text: string): string {
    return text.replace(/@(\w+)/g, '<span class="text-purple-400 font-semibold">@$1</span>');
}

/**
 * Validate tag exists in ingredient library
 */
export function validateTag(tag: string): boolean {
    const { getIngredientByTag } = useIngredientStore.getState();
    return !!getIngredientByTag(tag);
}
