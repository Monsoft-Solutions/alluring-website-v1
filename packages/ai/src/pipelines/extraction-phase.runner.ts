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
import {
    extractQuickAnswer,
    serializeQuickAnswer,
} from '../functions/extract-quick-answer.function'
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
    /**
     * Serialized Quick Answer (`question\n\nanswer`) for `blog_post.quick_answer`.
     *
     * Null when extraction of this one part failed — the phase still succeeds,
     * because a post without a Quick Answer is exactly what ships today, while
     * a failed phase costs the whole post.
     */
    quickAnswer: string | null
    /** Processing time in ms */
    timeMs: number
    /** Model the extraction ran on (resolved after defaults) */
    modelId: string
}

/**
 * Default extraction model, mirrored from extract-metadata / extract-faqs so
 * the runner can report which model actually ran when none is configured.
 */
const DEFAULT_EXTRACTION_MODEL = 'claude-opus-5'

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
    const { content, title, primaryKeyword, onProgress } = options
    const modelId = options.modelId ?? DEFAULT_EXTRACTION_MODEL

    try {
        console.log('[Extraction Phase] Starting Extraction')
        onProgress?.('extraction', 10, 'Extracting metadata and FAQs...')

        // Run metadata, FAQ and Quick Answer extraction in parallel.
        // The Quick Answer is settled rather than awaited outright: it is the
        // newest of the three and the least essential, so a failure there must
        // not cost the metadata and FAQs alongside it.
        const [metadata, faqResult, quickAnswerOutcome] = await Promise.all([
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
            extractQuickAnswer({
                content,
                title,
                primaryKeyword,
                modelId,
            }).then(
                (value) => ({ ok: true as const, value }),
                (error: unknown) => ({ ok: false as const, error })
            ),
        ])

        const quickAnswer = quickAnswerOutcome.ok
            ? serializeQuickAnswer(quickAnswerOutcome.value)
            : null

        if (!quickAnswerOutcome.ok) {
            console.warn(
                '[Extraction Phase] Quick Answer extraction failed, continuing without one:',
                quickAnswerOutcome.error instanceof Error
                    ? quickAnswerOutcome.error.message
                    : quickAnswerOutcome.error
            )
        }

        const faqSchema = generateFaqSchema(faqResult.faqs)
        const timeMs = Date.now() - startTime

        onProgress?.('extraction', 100, 'Extraction complete', {
            type: 'extraction-result',
            faqCount: faqResult.faqs.length,
        })

        console.log(
            `[Extraction Phase] Extraction complete: ${faqResult.faqs.length} FAQs, Quick Answer: ${quickAnswer ? 'yes' : 'no'}`
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
            quickAnswer,
            timeMs,
            modelId,
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
            quickAnswer: null,
            timeMs: Date.now() - startTime,
            modelId,
        }
    }
}
