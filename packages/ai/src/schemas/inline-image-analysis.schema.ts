/**
 * Inline Image Analysis Schema
 *
 * Zod schemas for AI-powered inline image analysis and generation.
 * Used with AI SDK's generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/schemas/inline-image-analysis
 */
import { z } from 'zod'

/**
 * Image type enum for inline images
 */
export const inlineImageTypeSchema = z.enum([
    'infographic',
    'marketing',
    'illustration',
    'photo',
])

export type InlineImageTypeValue = z.infer<typeof inlineImageTypeSchema>

/**
 * Schema for a single image opportunity identified in the content
 */
export const imageOpportunitySchema = z.object({
    id: z
        .string()
        .describe(
            'Unique identifier for this opportunity (e.g., "img-1", "img-2")'
        ),

    contextText: z
        .string()
        .describe(
            '2-3 sentences of surrounding context explaining what the image should depict'
        ),

    insertAfterText: z
        .string()
        .describe(
            'A unique phrase (5-15 words) that appears in the content to locate the insertion point. Must be exact text from the content.'
        ),

    recommendedImageType: inlineImageTypeSchema.describe(
        'The recommended type of image for this location based on content context'
    ),

    rationale: z
        .string()
        .describe(
            'Brief explanation of why this location would benefit from an image'
        ),

    suggestedSubject: z
        .string()
        .describe(
            'Main subject or concept the image should focus on (e.g., "recovery timeline", "patient consultation")'
        ),

    priority: z
        .number()
        .min(1)
        .max(10)
        .describe(
            'Priority ranking 1-10, with 1 being highest priority. Higher priority locations should have images first.'
        ),
})

export type ImageOpportunity = z.infer<typeof imageOpportunitySchema>

/**
 * Schema for content assessment metrics
 */
export const contentAssessmentSchema = z.object({
    existingImageCount: z
        .number()
        .describe('Number of existing images detected in the content'),

    contentLength: z.number().describe('Approximate word count of the content'),

    recommendedImageCount: z
        .number()
        .describe(
            'Recommended number of images based on content length and existing images (max 5)'
        ),

    primaryTheme: z
        .string()
        .describe(
            'The main theme or topic of the content (e.g., "BBL recovery", "facelift procedure")'
        ),
})

export type ContentAssessment = z.infer<typeof contentAssessmentSchema>

/**
 * Schema for complete inline image analysis result
 */
export const inlineImageAnalysisSchema = z.object({
    contentAssessment: contentAssessmentSchema.describe(
        'Overall assessment of the content for image placement'
    ),

    opportunities: z
        .array(imageOpportunitySchema)
        .describe(
            'Array of identified image opportunities, sorted by priority (lowest number = highest priority)'
        ),

    notes: z
        .string()
        .describe(
            'Additional notes about image placement recommendations or content considerations'
        ),
})

export type InlineImageAnalysis = z.infer<typeof inlineImageAnalysisSchema>

/**
 * Status of a generated inline image
 */
export const generatedImageStatusSchema = z.enum([
    'pending',
    'generating',
    'uploading',
    'success',
    'error',
])

export type GeneratedImageStatus = z.infer<typeof generatedImageStatusSchema>

/**
 * Schema for a generated inline image result
 */
export const generatedInlineImageSchema = z.object({
    opportunityId: z
        .string()
        .describe('Reference to the original opportunity ID'),

    imageUrl: z
        .string()
        .optional()
        .describe('Vercel Blob URL of the uploaded image (if successful)'),

    altText: z.string().optional().describe('Generated alt text for the image'),

    prompt: z
        .string()
        .optional()
        .describe('The prompt used to generate this image'),

    imageType: inlineImageTypeSchema.describe(
        'The type of image that was generated'
    ),

    insertAfterText: z
        .string()
        .describe('The marker text for locating insertion position'),

    status: generatedImageStatusSchema.describe(
        'Current status of the image generation'
    ),

    error: z.string().optional().describe('Error message if generation failed'),
})

export type GeneratedInlineImage = z.infer<typeof generatedInlineImageSchema>

/**
 * Schema for pipeline metrics
 */
export const pipelineMetricsSchema = z.object({
    totalTimeMs: z.number().describe('Total pipeline execution time'),
    analysisTimeMs: z.number().describe('Time spent on content analysis'),
    promptGenerationTimeMs: z
        .number()
        .describe('Time spent generating prompts'),
    imageGenerationTimeMs: z
        .number()
        .describe('Time spent generating and uploading images'),
    imagesGenerated: z
        .number()
        .describe('Number of images successfully generated'),
    imagesFailed: z
        .number()
        .describe('Number of images that failed to generate'),
})

export type PipelineMetrics = z.infer<typeof pipelineMetricsSchema>

/**
 * Schema for the complete auto inline image pipeline result
 */
export const autoInlineImagePipelineResultSchema = z.object({
    success: z
        .boolean()
        .describe('Whether the pipeline completed successfully'),

    analysis: inlineImageAnalysisSchema
        .optional()
        .describe('Content analysis results (if analysis phase succeeded)'),

    generatedImages: z
        .array(generatedInlineImageSchema)
        .describe('Array of generated images with their statuses'),

    metrics: pipelineMetricsSchema.describe('Pipeline execution metrics'),

    error: z
        .string()
        .optional()
        .describe('Error message if the pipeline failed'),
})

export type AutoInlineImagePipelineResult = z.infer<
    typeof autoInlineImagePipelineResultSchema
>
