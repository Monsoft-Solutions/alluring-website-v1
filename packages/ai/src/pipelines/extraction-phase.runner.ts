/**
 * Extraction Phase Runner
 *
 * Standalone runner for the metadata and FAQ extraction phase.
 * Extracts SEO metadata and FAQ items from generated content.
 *
 * @module @workspace/ai/pipelines/extraction-phase
 */
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import type { FaqItem } from '@workspace/shared/schemas/blog'

import { extractMetadata } from '../functions/extract-metadata.function'
import { normalizeClaimText } from '../functions/normalize-claim-text.function'
import {
    extractFaqs,
    generateFaqSchema,
} from '../functions/extract-faqs.function'
import {
    extractQuickAnswer,
    serializeQuickAnswer,
} from '../functions/extract-quick-answer.function'
import type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'
import type { ReasoningEffort } from '../models/reasoning-effort.constant'
import { sumCosts } from '../models/openrouter-usage.util'

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
    /** How hard the extraction model should think (default: none) */
    reasoningEffort?: ReasoningEffort
    /**
     * The live pricing snapshot (#354): the extracted fields' claim tokens
     * and typed prices are checked against it. The 2026-09-15 sheet when
     * omitted.
     */
    pricing?: PricingSnapshot
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
    /**
     * What OpenRouter billed for this phase in total, in USD — metadata, FAQs
     * and the Quick Answer. Absent when nothing reported usage.
     */
    costUsd?: number
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
    const { content, title, primaryKeyword, reasoningEffort, onProgress } =
        options
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
                reasoningEffort,
            }),
            extractFaqs({
                content,
                primaryKeyword: primaryKeyword || title,
                modelId,
                reasoningEffort,
            }),
            extractQuickAnswer({
                content,
                title,
                primaryKeyword,
                modelId,
                reasoningEffort,
            }).then(
                (value) => ({ ok: true as const, value }),
                (error: unknown) => ({ ok: false as const, error })
            ),
        ])

        // Claim tokens and typed prices in what the models extracted (#354),
        // checked like the body: canonical tokens, typed prices as tokens,
        // the rest reported.
        const notes: string[] = []
        const claimText = (
            text: string,
            field: Parameters<typeof normalizeClaimText>[1]
        ) => {
            const result = normalizeClaimText(text, field, options.pricing)
            notes.push(...result.notes)
            return result.text
        }
        const metaTitle = claimText(metadata.metaTitle, 'metaTitle')
        const metaDescription = claimText(
            metadata.metaDescription,
            'metaDescription'
        )
        const excerpt = claimText(metadata.excerpt, 'excerpt')
        const faqs = faqResult.faqs.map((faq) => ({
            ...faq,
            question: claimText(faq.question, 'faq'),
            answer: claimText(faq.answer, 'faq'),
        }))

        const quickAnswerRaw = quickAnswerOutcome.ok
            ? serializeQuickAnswer(quickAnswerOutcome.value)
            : null
        const quickAnswer = quickAnswerRaw
            ? claimText(quickAnswerRaw, 'quickAnswer')
            : null
        for (const note of notes) {
            console.warn(`[Extraction Phase] Claims: ${note}`)
        }

        if (!quickAnswerOutcome.ok) {
            console.warn(
                '[Extraction Phase] Quick Answer extraction failed, continuing without one:',
                quickAnswerOutcome.error instanceof Error
                    ? quickAnswerOutcome.error.message
                    : quickAnswerOutcome.error
            )
        }

        const faqSchema = generateFaqSchema(faqs)
        const timeMs = Date.now() - startTime

        onProgress?.('extraction', 100, 'Extraction complete', {
            type: 'extraction-result',
            faqCount: faqs.length,
        })

        console.log(
            `[Extraction Phase] Extraction complete: ${faqs.length} FAQs, Quick Answer: ${quickAnswer ? 'yes' : 'no'}`
        )
        console.log(`[Extraction Phase] Time: ${timeMs}ms`)

        return {
            success: true,
            metaTitle,
            metaDescription,
            excerpt,
            suggestedTags: metadata.suggestedTags,
            readingTimeMinutes: metadata.readingTimeMinutes,
            suggestedCategory: metadata.suggestedCategory,
            faqs,
            faqSchema,
            quickAnswer,
            timeMs,
            modelId,
            costUsd: sumCosts([
                metadata.costUsd,
                faqResult.costUsd,
                quickAnswerOutcome.ok
                    ? quickAnswerOutcome.value.costUsd
                    : undefined,
            ]),
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
