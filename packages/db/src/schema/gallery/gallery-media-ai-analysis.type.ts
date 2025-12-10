/**
 * Gallery Media AI Analysis Type
 *
 * Type definition for the AI analysis data stored in gallery_media.ai_analysis JSONB column.
 * This is populated by the AI image analysis feature when analyzing gallery images.
 *
 * @module @workspace/db/schema/gallery
 */

/**
 * Before/after image type detected by AI
 */
export type BeforeAfterType = 'before' | 'after' | 'side_by_side'

/**
 * Body area categories for plastic surgery images
 */
export type BodyArea = 'face' | 'breast' | 'body' | 'combined' | 'other'

/**
 * Image quality assessment
 */
export type ImageQuality = 'high' | 'medium' | 'low'

/**
 * Patient gender detected by AI
 */
export type PatientGender = 'male' | 'female' | 'unknown'

/**
 * Patient description data extracted from image analysis
 * Contains observable characteristics useful for categorization
 */
export type PatientDescription = {
    /** Apparent gender of the patient */
    gender: PatientGender

    /** Estimated age range (e.g., "25-35", "35-45") */
    estimatedAgeRange?: string

    /** General body type observation */
    bodyType?: string

    /** General skin tone for clinical context */
    skinTone?: string

    /** Other relevant observable characteristics */
    additionalDetails?: string
}

/**
 * AI Analysis data structure for gallery media
 *
 * This type represents the structured output from AI vision analysis
 * of gallery images. It captures procedure detection, before/after status,
 * and other metadata useful for content generation.
 */
export type GalleryMediaAIAnalysis = {
    /** ISO timestamp when the analysis was performed */
    analyzedAt: string

    /** Model ID used for the analysis (e.g., 'gpt-4.1') */
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

    /** Observable patient characteristics */
    patientDescription?: PatientDescription

    /** Any visible text in the image (OCR) */
    imageText?: string
}
