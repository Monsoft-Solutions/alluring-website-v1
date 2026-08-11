/**
 * Extraction Phase Runner
 *
 * Standalone runner for the metadata and FAQ extraction phase.
 * Extracts SEO metadata and FAQ items from generated content.
 *
 * @module @workspace/ai/pipelines/extraction-phase
 */
import type { FaqItem } from '@workspace/shared/schemas/blog'

import { extractMetadata } from '../functions/extract-metadata.function'
import {
    extractFaqs,
    generateFaqSchema,
} from '../functions/extract-faqs.function'
import type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'

/**
 * Options for running the extraction phase
 */
export type ExtractionPhaseOptions = {
    /** Content to extract metadata from (markdown) */
    content: string
    /** Blog post title */
    title: string
    /** Primary SEO keyword */
    primaryKeyword?: string
    /** Model for metadata + FAQ extraction (defaults per function) */
    modelId?: string
    /** Progress callback */
    onProgress?: AgenticPipelineProgressCallback
}

/**
 * Result from the extraction phase
 */
export type ExtractionPhaseResult = {
    /** Whether extraction succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** SEO title tag (50-60 characters) */
    metaTitle: string
    /** SEO meta description */
    metaDescription: string
    /** Short excerpt for previews */
    excerpt: string
    /** Suggested tags for the post */
    suggestedTags: string[]
    /** Estimated reading time in minutes */
    readingTimeMinutes: number
    /** Suggested category */
    suggestedCategory: string
    /** Extracted FAQ items */
    faqs: FaqItem[]
    /** FAQ Schema JSON-LD (null if no FAQs) */
    faqSchema: object | null
    /** Processing time in ms */
    timeMs: number
}

/**
 * Run the extraction phase standalone
 *
 * Extracts metadata and FAQs from content in parallel:
 * - SEO meta description
 * - Excerpt for previews
 * - Suggested tags
 * - Reading time estimate
 * - FAQ items with JSON-LD schema
 *
 * @param options - Extraction options
 * @returns Extraction result with metadata and FAQs
 *
 * @example
 * ```typescript
 * const result = await runExtractionPhase({
 *   content: finalMarkdown,
 *   title: 'BBL Recovery Guide',
 *   primaryKeyword: 'bbl recovery',
 * })
 *
 * console.log(result.metaDescription)
 * console.log(result.faqs) // FAQ items
 * console.log(result.faqSchema) // JSON-LD for SEO
 * ```
 */
export async function runExtractionPhase(
    options: ExtractionPhaseOptions
): Promise<ExtractionPhaseResult> {
    const startTime = Date.now()
    const { content, title, primaryKeyword, modelId, onProgress } = options

    try {
        console.log('[Extraction Phase] Starting Extraction')
        onProgress?.('extraction', 10, 'Extracting metadata and FAQs...')

        // Run metadata and FAQ extraction in parallel
        const [metadata, faqResult] = await Promise.all([
            extractMetadata({
                content,
                primaryKeyword: primaryKeyword || title,
                title,
                modelId,
            }),
            extractFaqs({
                content,
                primaryKeyword: primaryKeyword || title,
                modelId,
            }),
        ])

        const faqSchema = generateFaqSchema(faqResult.faqs)
        const timeMs = Date.now() - startTime

        onProgress?.('extraction', 100, 'Extraction complete', {
            type: 'extraction-result',
            faqCount: faqResult.faqs.length,
        })

        console.log(
            `[Extraction Phase] Extraction complete: ${faqResult.faqs.length} FAQs`
        )
        console.log(`[Extraction Phase] Time: ${timeMs}ms`)

        return {
            success: true,
            metaTitle: metadata.metaTitle,
            metaDescription: metadata.metaDescription,
            excerpt: metadata.excerpt,
            suggestedTags: metadata.suggestedTags,
            readingTimeMinutes: metadata.readingTimeMinutes,
            suggestedCategory: metadata.suggestedCategory,
            faqs: faqResult.faqs,
            faqSchema,
            timeMs,
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('[Extraction Phase] ERROR:', errorMessage)

        onProgress?.('error', 0, `Extraction failed: ${errorMessage}`)

        return {
            success: false,
            error: errorMessage,
            metaTitle: '',
            metaDescription: '',
            excerpt: '',
            suggestedTags: [],
            readingTimeMinutes: 0,
            suggestedCategory: '',
            faqs: [],
            faqSchema: null,
            timeMs: Date.now() - startTime,
        }
    }
}
