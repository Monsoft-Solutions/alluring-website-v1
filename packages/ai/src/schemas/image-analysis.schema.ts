/**
 * Image Analysis Schema
 *
 * Zod schema for validating AI vision analysis responses for gallery images.
 * Used with AI SDK's generateObject() for type-safe structured output.
 *
 * This schema composes shared types from @workspace/shared/schemas/gallery
 * with AI-specific fields.
 *
 * @module @workspace/ai/schemas/image-analysis
 */
import { z } from 'zod'

import {
    beforeAfterTypeSchema,
    bodyAreaSchema,
    contentTypeSchema,
    imageQualitySchema,
    patientDescriptionSchema,
    galleryProcedureSlugSchema,
} from '@workspace/shared/schemas/gallery'

/**
 * Zod schema for gallery image analysis result
 *
 * This schema is used with AI SDK's generateObject() to ensure
 * type-safe structured output from GPT-4o vision analysis.
 *
 * Note: This is an AI-specific schema that composes shared schemas.
 * It includes AI-specific fields like procedureConfidence that are
 * not part of the persisted GalleryMediaAIAnalysis.
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

    contentType: contentTypeSchema.describe(
        'The type of content: before_after (B&A comparison or stage), tips (educational), promotion (offers/discounts), informative (general info), results (procedure results without B&A context), other'
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
