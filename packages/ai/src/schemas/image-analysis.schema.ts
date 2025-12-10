/**
 * Image Analysis Schema
 *
 * Zod schema for validating AI vision analysis responses for gallery images.
 * Used with AI SDK's generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/schemas/image-analysis
 */
import { z } from 'zod'

import {
    beforeAfterTypeSchema,
    bodyAreaSchema,
    imageQualitySchema,
    patientDescriptionSchema,
} from '@workspace/shared/schemas/gallery'

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

    patientDescription: patientDescriptionSchema
        .optional()
        .describe(
            'Observable patient characteristics including gender, estimated age range, body type, and skin tone'
        ),

    imageText: z
        .string()
        .optional()
        .describe(
            'Any visible text in the image such as labels, dates, watermarks, annotations, or "before"/"after" markers'
        ),
})

/**
 * TypeScript type inferred from the schema
 */
export type ImageAnalysis = z.infer<typeof imageAnalysisSchema>

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
