/**
 * Video Analysis Schema
 *
 * Zod schema for AI video analysis of testimonial videos.
 * Extracts transcript, key quote, patient name, procedure, and marketing description.
 *
 * @module @workspace/ai/schemas/video-analysis
 */
import { z } from 'zod'

/**
 * Schema for video analysis results
 */
export const videoAnalysisSchema = z.object({
    /**
     * Full transcript of the video content
     */
    transcript: z.string().describe('Complete transcription of the video'),

    /**
     * AI-identified most impactful quote from the testimonial
     */
    keyQuote: z
        .string()
        .describe(
            'The most impactful, emotionally resonant quote (1-3 sentences)'
        ),

    /**
     * Patient name extracted from video if mentioned
     */
    patientName: z
        .string()
        .nullable()
        .describe("Patient's first name if mentioned, null otherwise"),

    /**
     * Procedure detected from video content
     */
    procedure: z
        .string()
        .nullable()
        .describe(
            'Detected procedure (e.g., "BBL", "Breast Augmentation"), null if unclear'
        ),

    /**
     * AI-generated long-form marketing description
     */
    longDescription: z
        .string()
        .describe('2-3 paragraph marketing description for the website'),

    /**
     * Video duration in seconds (if detectable)
     */
    duration: z
        .number()
        .optional()
        .describe('Video duration in seconds if available'),

    /**
     * Detected language of the testimonial
     */
    language: z
        .string()
        .optional()
        .describe('Detected language (e.g., "English", "Spanish")'),
})

/**
 * Inferred type from video analysis schema
 */
export type VideoAnalysis = z.infer<typeof videoAnalysisSchema>

/**
 * Video analysis result with metadata
 */
export interface VideoAnalysisResult extends VideoAnalysis {
    /** When analysis was performed */
    analyzedAt: string
    /** Model used for analysis */
    modelId?: string
}
