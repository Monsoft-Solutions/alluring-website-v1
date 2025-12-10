/**
 * Image Analysis Schema
 *
 * Zod schema for validating AI vision analysis responses for gallery images.
 * Used with AI SDK's generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/schemas/image-analysis
 */
import { z } from 'zod'

/**
 * Before/after image type options
 */
export const BEFORE_AFTER_TYPES = ['before', 'after', 'side_by_side'] as const
export type BeforeAfterType = (typeof BEFORE_AFTER_TYPES)[number]

/**
 * Body area categories for plastic surgery images
 */
export const BODY_AREAS = [
    'face',
    'breast',
    'body',
    'combined',
    'other',
] as const
export type BodyArea = (typeof BODY_AREAS)[number]

/**
 * Image quality assessment levels
 */
export const IMAGE_QUALITY_LEVELS = ['high', 'medium', 'low'] as const
export type ImageQuality = (typeof IMAGE_QUALITY_LEVELS)[number]

/**
 * Procedure slugs that can be detected in images
 * These map to the actual page slugs used in the web app
 */
export const GALLERY_PROCEDURE_SLUGS = [
    'brazilian-butt-lift-bbl-miami',
    'breast-augmentation-miami',
    'breast-lift-miami',
    'breast-reduction-miami',
    'tummy-tuck-miami',
    'liposuction-miami',
    'mommy-makeover-miami',
    'facelift-miami',
    'blepharoplasty-miami',
    'rhinoplasty-miami',
] as const
export type GalleryProcedureSlug = (typeof GALLERY_PROCEDURE_SLUGS)[number]

/**
 * Zod schema for before/after type
 */
export const beforeAfterTypeSchema = z.enum(BEFORE_AFTER_TYPES)

/**
 * Zod schema for body area
 */
export const bodyAreaSchema = z.enum(BODY_AREAS)

/**
 * Zod schema for image quality
 */
export const imageQualitySchema = z.enum(IMAGE_QUALITY_LEVELS)

/**
 * Zod schema for procedure slug
 */
export const galleryProcedureSlugSchema = z.enum(GALLERY_PROCEDURE_SLUGS)

/**
 * Zod schema for gallery image analysis result
 *
 * This schema is used with AI SDK's generateObject() to ensure
 * type-safe structured output from GPT-4o vision analysis.
 */
export const imageAnalysisSchema = z.object({
    description: z
        .string()
        .describe(
            'Detailed professional description of the image content, focusing on visible surgical results or patient presentation'
        ),

    isBeforeAfter: z
        .boolean()
        .describe(
            'Whether this image appears to be a before/after comparison or a single stage of a before/after pair'
        ),

    beforeAfterType: beforeAfterTypeSchema
        .optional()
        .describe(
            'If isBeforeAfter is true, the type of before/after image: "before" (pre-op), "after" (post-op), or "side_by_side" (comparison)'
        ),

    detectedProcedure: galleryProcedureSlugSchema
        .optional()
        .describe(
            'The procedure slug if a specific procedure can be identified from visual cues'
        ),

    procedureConfidence: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe(
            'Confidence score (0-1) for the detected procedure. Only set if detectedProcedure is set.'
        ),

    bodyArea: bodyAreaSchema.describe(
        'The primary body area shown in the image: face, breast, body, combined, or other'
    ),

    imageQuality: imageQualitySchema.describe(
        'Assessment of image quality for web display: high (professional), medium (acceptable), low (poor quality)'
    ),

    suggestedTags: z
        .array(z.string())
        .optional()
        .describe(
            'Suggested tags for categorization, such as procedure names, body parts, or descriptive terms'
        ),

    clinicalDetails: z
        .string()
        .optional()
        .describe(
            'Any visible surgical or clinical details described professionally (e.g., incision placement, symmetry, volume enhancement)'
        ),
})

/**
 * TypeScript type inferred from the schema
 */
export type ImageAnalysis = z.infer<typeof imageAnalysisSchema>

/**
 * Full AI analysis result with metadata
 * This type is flexible enough to be stored in and retrieved from the database.
 * Uses string types for enums to support DB storage and retrieval.
 */
export type GalleryMediaAIAnalysis = {
    /** ISO timestamp when the analysis was performed */
    analyzedAt: string
    /** Model ID used for the analysis */
    modelId: string
    /** Detailed description of the image content */
    description: string
    /** Whether this appears to be a before/after comparison image */
    isBeforeAfter: boolean
    /** Type of before/after image if detected */
    beforeAfterType?: BeforeAfterType
    /** Detected procedure slug (matches PROCEDURE_OPTIONS) */
    detectedProcedure?: string
    /** Confidence score for procedure detection (0-1) */
    procedureConfidence?: number
    /** Body area shown in the image */
    bodyArea: BodyArea
    /** Assessment of image quality for web display */
    imageQuality: ImageQuality
    /** Suggested tags for categorization */
    suggestedTags?: string[]
    /** Any visible surgical or clinical details described professionally */
    clinicalDetails?: string
}

/**
 * SEO content generation result schema
 */
export const seoContentSchema = z.object({
    seoTitle: z
        .string()
        .max(60)
        .describe(
            'SEO-optimized title for search engines, max 60 characters, includes relevant keywords'
        ),

    seoDescription: z
        .string()
        .max(160)
        .describe(
            'SEO meta description, max 160 characters, compelling and keyword-rich'
        ),

    slug: z
        .string()
        .describe(
            'URL-friendly slug derived from the content, lowercase with hyphens'
        ),
})

export type SEOContent = z.infer<typeof seoContentSchema>

/**
 * Visitor content generation result schema
 */
export const visitorContentSchema = z.object({
    title: z
        .string()
        .describe(
            'Engaging, descriptive title for gallery visitors that captures attention'
        ),

    description: z
        .string()
        .describe(
            'Story-focused, benefits-oriented description that resonates with potential patients'
        ),

    alt: z
        .string()
        .describe(
            'Accessible alt text describing the image for screen readers, clear and descriptive'
        ),
})

export type VisitorContent = z.infer<typeof visitorContentSchema>
