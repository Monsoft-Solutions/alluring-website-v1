/**
 * Gallery Media AI Analysis Schema
 * Single source of truth for AI analysis types used in gallery_media.ai_analysis JSONB column.
 * @module @workspace/shared/schemas/gallery
 */
import { z } from 'zod'

// Const arrays for validation
export const BEFORE_AFTER_TYPES = ['before', 'after', 'side_by_side'] as const
export const BODY_AREAS = [
    'face',
    'breast',
    'body',
    'combined',
    'other',
] as const
export const IMAGE_QUALITY_LEVELS = ['high', 'medium', 'low'] as const
export const PATIENT_GENDERS = ['male', 'female', 'unknown'] as const
export const CONTENT_TYPES = [
    'before_after',
    'tips',
    'promotion',
    'informative',
    'results',
    'other',
] as const

// Zod schemas
export const beforeAfterTypeSchema = z.enum(BEFORE_AFTER_TYPES)
export const bodyAreaSchema = z.enum(BODY_AREAS)
export const imageQualitySchema = z.enum(IMAGE_QUALITY_LEVELS)
export const patientGenderSchema = z.enum(PATIENT_GENDERS)
export const contentTypeSchema = z.enum(CONTENT_TYPES)

export const patientDescriptionSchema = z.object({
    gender: patientGenderSchema,
    estimatedAgeRange: z.string().optional(),
    bodyType: z.string().optional(),
    skinTone: z.string().optional(),
    additionalDetails: z.string().optional(),
})

export const galleryMediaAIAnalysisSchema = z.object({
    analyzedAt: z.string(),
    modelId: z.string(),
    description: z.string(),
    isBeforeAfter: z.boolean(),
    beforeAfterType: beforeAfterTypeSchema.optional(),
    contentType: contentTypeSchema,
    detectedProcedure: z.string().optional(),
    procedureConfidence: z.number().min(0).max(1).optional(),
    bodyArea: bodyAreaSchema,
    imageQuality: imageQualitySchema,
    suggestedTags: z.array(z.string()).optional(),
    clinicalDetails: z.string().optional(),
    patientDescription: patientDescriptionSchema.optional(),
    imageText: z.string().optional(),
})

// Types inferred from schemas
export type BeforeAfterType = z.infer<typeof beforeAfterTypeSchema>
export type BodyArea = z.infer<typeof bodyAreaSchema>
export type ImageQuality = z.infer<typeof imageQualitySchema>
export type PatientGender = z.infer<typeof patientGenderSchema>
export type ContentType = z.infer<typeof contentTypeSchema>
export type PatientDescription = z.infer<typeof patientDescriptionSchema>
export type GalleryMediaAIAnalysis = z.infer<
    typeof galleryMediaAIAnalysisSchema
>
