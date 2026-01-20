/**
 * Photo Style Constants
 *
 * Single source of truth for photo style IDs, labels, and prompting guidelines.
 *
 * @module @workspace/ai/constants/photo-style
 */

/**
 * Supported photo style IDs (canonical list)
 */
export const PHOTO_STYLE_IDS = ['artistic', 'lifestyle', 'miami-cover'] as const

export type PhotoStyleId = (typeof PHOTO_STYLE_IDS)[number]

/**
 * Data model for photo styles used across admin + ai pipelines/prompts.
 */
export type PhotoStyleDefinition = {
    id: PhotoStyleId
    name: string
    description: string
    /**
     * Prompting guidelines (without diversity requirements).
     * Diversity constraints should be applied via `getPhotoGuidelinesWithDiversity()`
     * at call sites that need it (e.g. automated pipelines).
     */
    promptGuidelines: string
    /**
     * Short label for UI/display inside generated prompts.
     */
    label: string
}

/**
 * Canonical list of photo style definitions.
 */
export const PHOTO_STYLES: readonly PhotoStyleDefinition[] = [
    {
        id: 'artistic',
        name: 'Artistic/Sensual',
        description:
            'Refined, classy imagery showcasing body with artistic elegance',
        label: 'Artistic/Sensual',
        promptGuidelines:
            'High-end artistic photography, tasteful sensuality, refined and classy aesthetic, elegant composition showing skin and body contours, soft dramatic lighting, luxurious atmosphere, celebration of feminine beauty, sophisticated boudoir-inspired style, premium fashion photography aesthetic, body confidence imagery, warm skin tones, artistic shadows and highlights',
    },
    {
        id: 'lifestyle',
        name: 'Lifestyle/Casual',
        description:
            'Natural everyday scenarios, casual settings, real-life moments',
        label: 'Lifestyle/Casual',
        promptGuidelines:
            'Authentic lifestyle photography, natural candid moments, everyday scenarios, warm inviting atmosphere, relatable and approachable, casual elegance, real-life settings, comfortable and natural poses',
    },
    {
        id: 'miami-cover',
        name: 'Miami Publication Cover',
        description:
            'Sexy (non-explicit) editorial cover vibe with Miami glamour',
        label: 'Miami Publication Cover (Sexy Editorial)',
        promptGuidelines:
            'Sexy (non-explicit) Miami publication cover-style editorial photography, high-fashion styling, tasteful skin showing (swimwear/lingerie-inspired), confident pose and body confidence, glamorous hair and makeup, glossy magazine lighting, South Beach / Art Deco vibe, vibrant Miami color accents, premium luxury aesthetic, cinematic highlights and shadows, cover-ready composition with negative space for masthead/headlines, NO explicit nudity (no nipples/genitals), adult-only',
    },
] as const

/**
 * Convenience map for fast lookups.
 */
const PHOTO_STYLE_BY_ID: Record<PhotoStyleId, PhotoStyleDefinition> =
    Object.fromEntries(PHOTO_STYLES.map((s) => [s.id, s])) as Record<
        PhotoStyleId,
        PhotoStyleDefinition
    >

export function getPhotoStyleById(id: PhotoStyleId): PhotoStyleDefinition {
    return PHOTO_STYLE_BY_ID[id]
}

export function getPhotoStyleLabel(id: PhotoStyleId): string {
    return PHOTO_STYLE_BY_ID[id].label
}
