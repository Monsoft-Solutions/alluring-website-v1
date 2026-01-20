/**
 * Inline Image Type Constants
 *
 * Single source of truth for inline image type IDs, labels, and prompting guidelines.
 * Used across admin app and AI pipelines.
 *
 * @module @workspace/ai/constants/inline-image-type
 */

import type { InlineImageTypeValue } from '../schemas/inline-image-analysis.schema'

/**
 * Supported inline image type IDs (canonical list)
 */
export const INLINE_IMAGE_TYPE_IDS = [
    'infographic',
    'marketing',
    'illustration',
    'photo',
] as const

export type InlineImageTypeId = (typeof INLINE_IMAGE_TYPE_IDS)[number]

/**
 * Aspect ratio options for inline images
 */
export type InlineImageAspectRatio = '16:9' | '3:2' | '1:1'

/**
 * Data model for inline image types used across admin + ai pipelines/prompts.
 */
export type InlineImageTypeDefinition = {
    id: InlineImageTypeId
    name: string
    /**
     * Icon name for UI display (Lucide icon name)
     */
    icon: string
    description: string
    /**
     * Prompting guidelines for AI image generation
     */
    promptGuidelines: string
    /**
     * Default aspect ratio for this image type
     */
    aspectRatio: InlineImageAspectRatio
}

/**
 * Canonical list of inline image type definitions.
 */
export const INLINE_IMAGE_TYPES: readonly InlineImageTypeDefinition[] = [
    {
        id: 'infographic',
        name: 'Infographic',
        icon: 'BarChart',
        description: 'Data visualizations, step diagrams, comparison charts',
        promptGuidelines:
            'Clean infographic design, minimal text, clear visual hierarchy, professional data visualization, modern flat design, easy to read, well-organized information',
        aspectRatio: '16:9',
    },
    {
        id: 'marketing',
        name: 'Marketing',
        icon: 'Megaphone',
        description:
            'Promotional images, before/after concepts, lifestyle shots',
        promptGuidelines:
            'Aspirational lifestyle photography, emotional appeal, brand-aligned luxury aesthetic, high-end professional photography, warm and inviting atmosphere, premium feel',
        aspectRatio: '3:2',
    },
    {
        id: 'illustration',
        name: 'Illustration',
        icon: 'Palette',
        description: 'Educational diagrams, procedure illustrations, concepts',
        promptGuidelines:
            'Detailed professional medical illustration, clean educational diagram, anatomical accuracy, clear labeling areas, professional medical textbook style, precise and informative',
        aspectRatio: '1:1',
    },
    {
        id: 'photo',
        name: 'Photorealistic',
        icon: 'Camera',
        description:
            'Professional photos, stock-style images, clinic photography',
        promptGuidelines:
            'High-quality professional photography, natural lighting, photorealistic, sharp focus, professional clinic environment, medical grade quality, clean and modern',
        aspectRatio: '3:2',
    },
] as const

/**
 * Convenience map for fast lookups.
 */
const INLINE_IMAGE_TYPE_BY_ID: Record<
    InlineImageTypeId,
    InlineImageTypeDefinition
> = Object.fromEntries(INLINE_IMAGE_TYPES.map((t) => [t.id, t])) as Record<
    InlineImageTypeId,
    InlineImageTypeDefinition
>

/**
 * Get inline image type definition by ID
 */
export function getInlineImageTypeById(
    id: InlineImageTypeId
): InlineImageTypeDefinition {
    return INLINE_IMAGE_TYPE_BY_ID[id]
}

/**
 * Get prompt guidelines for a specific inline image type
 */
export function getInlineImageTypeGuidelines(id: InlineImageTypeId): string {
    return INLINE_IMAGE_TYPE_BY_ID[id].promptGuidelines
}

/**
 * Build a Record mapping image type IDs to their prompt guidelines.
 * Used by pipelines that need quick lookup of guidelines by type.
 */
export function buildImageTypeGuidelinesRecord(): Record<
    InlineImageTypeValue,
    string
> {
    return Object.fromEntries(
        INLINE_IMAGE_TYPES.map((t) => [t.id, t.promptGuidelines])
    ) as Record<InlineImageTypeValue, string>
}
