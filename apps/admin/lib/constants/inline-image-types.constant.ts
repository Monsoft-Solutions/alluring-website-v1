/**
 * Inline Image Types for Blog Post Editor
 *
 * Defines the types of images that can be generated inline within blog posts,
 * along with their specific prompting guidelines for optimal AI generation.
 */

import type { PhotoStyleValue } from '@workspace/ai'

export const INLINE_IMAGE_TYPES = [
    {
        id: 'infographic',
        name: 'Infographic',
        icon: 'BarChart',
        description: 'Data visualizations, step diagrams, comparison charts',
        promptGuidelines:
            'Clean infographic design, minimal text, clear visual hierarchy, professional data visualization, modern flat design, easy to read, well-organized information',
        aspectRatio: '16:9' as const,
    },
    {
        id: 'marketing',
        name: 'Marketing',
        icon: 'Megaphone',
        description:
            'Promotional images, before/after concepts, lifestyle shots',
        promptGuidelines:
            'Aspirational lifestyle photography, emotional appeal, brand-aligned luxury aesthetic, high-end professional photography, warm and inviting atmosphere, premium feel',
        aspectRatio: '3:2' as const,
    },
    {
        id: 'illustration',
        name: 'Illustration',
        icon: 'Palette',
        description: 'Educational diagrams, procedure illustrations, concepts',
        promptGuidelines:
            'Detailed professional medical illustration, clean educational diagram, anatomical accuracy, clear labeling areas, professional medical textbook style, precise and informative',
        aspectRatio: '1:1' as const,
    },
    {
        id: 'photo',
        name: 'Photorealistic',
        icon: 'Camera',
        description:
            'Professional photos, stock-style images, clinic photography',
        promptGuidelines:
            'High-quality professional photography, natural lighting, photorealistic, sharp focus, professional clinic environment, medical grade quality, clean and modern',
        aspectRatio: '3:2' as const,
    },
] as const

export type InlineImageTypeId = (typeof INLINE_IMAGE_TYPES)[number]['id']

export type InlineImageType = (typeof INLINE_IMAGE_TYPES)[number]

/**
 * Get image type configuration by ID
 */
export function getInlineImageType(
    id: InlineImageTypeId
): InlineImageType | undefined {
    return INLINE_IMAGE_TYPES.find((type) => type.id === id)
}

/**
 * Get prompt guidelines for a specific image type
 */
export function getPromptGuidelines(id: InlineImageTypeId): string {
    const imageType = getInlineImageType(id)
    return imageType?.promptGuidelines || ''
}

/**
 * Photo style definitions for photo-type images
 *
 * These sub-types allow for varying the style of photorealistic images
 * based on content context (results showcase, lifestyle, or medical explanations).
 */
export const PHOTO_STYLES = [
    {
        id: 'artistic' as const satisfies PhotoStyleValue,
        name: 'Artistic/Sensual',
        description:
            'Refined, classy imagery showcasing body with artistic elegance',
        promptGuidelines:
            'High-end artistic photography, tasteful sensuality, refined and classy aesthetic, elegant composition showing skin and body contours, soft dramatic lighting, luxurious atmosphere, celebration of feminine beauty, sophisticated boudoir-inspired style, premium fashion photography aesthetic, body confidence imagery, warm skin tones, artistic shadows and highlights',
    },
    {
        id: 'lifestyle' as const satisfies PhotoStyleValue,
        name: 'Lifestyle/Casual',
        description:
            'Natural everyday scenarios, casual settings, real-life moments',
        promptGuidelines:
            'Authentic lifestyle photography, natural candid moments, everyday scenarios, warm inviting atmosphere, relatable and approachable, casual elegance, real-life settings, comfortable and natural poses',
    },
    {
        id: 'medical-overlay' as const satisfies PhotoStyleValue,
        name: 'Medical Overlay',
        description:
            'Photorealistic with illustrated surgical markings and incision lines',
        promptGuidelines:
            'Photorealistic medical photography combined with clean illustrated overlays, surgical planning markings, incision line illustrations, anatomical guide markings, professional medical visualization, clean vector-style surgical annotations on realistic skin, pre-operative planning aesthetic, educational medical imagery with artistic precision',
    },
] as const

export type PhotoStyleId = (typeof PHOTO_STYLES)[number]['id']

export type PhotoStyle = (typeof PHOTO_STYLES)[number]

/**
 * Get photo style configuration by ID
 */
export function getPhotoStyle(id: PhotoStyleId): PhotoStyle | undefined {
    return PHOTO_STYLES.find((style) => style.id === id)
}

/**
 * Get prompt guidelines for a specific photo style
 */
export function getPhotoStyleGuidelines(id: PhotoStyleId): string {
    const photoStyle = getPhotoStyle(id)
    return photoStyle?.promptGuidelines || ''
}
