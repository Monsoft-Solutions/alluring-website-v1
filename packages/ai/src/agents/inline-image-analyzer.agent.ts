/**
 * Inline Image Analyzer Agent
 *
 * AI agent that analyzes blog content to identify optimal locations
 * for inline image insertion. Uses structured output for reliable
 * image placement recommendations.
 *
 * @module @workspace/ai/agents/inline-image-analyzer
 */
import { coreGenerateObject } from '../core'
import {
    INLINE_IMAGE_ANALYZER_SYSTEM_PROMPT,
    getInlineImageAnalyzerPrompt,
} from '../prompts/blog/inline-image-analyzer.prompt'
import { inlineImageAnalysisSchema } from '../schemas/inline-image-analysis.schema'
import type { InlineImageAnalysis } from '../schemas/inline-image-analysis.schema'

/**
 * Default model for content analysis
 */
const DEFAULT_MODEL_ID = 'claude-opus-5'

/**
 * Options for the inline image analyzer agent
 */
export type InlineImageAnalyzerOptions = {
    /** Blog post content (markdown) */
    content: string
    /** Blog post title */
    title: string
    /** Maximum number of images to recommend (default: 5) */
    maxImages?: number
    /** Model ID to use (default: claude-opus-5) */
    modelId?: string
    /** Temperature for generation (default: 0.7) */
    temperature?: number
}

/**
 * Result of the inline image analyzer agent
 */
export type InlineImageAnalyzerResult = {
    /** The analysis result */
    analysis: InlineImageAnalysis
    /** Processing time in milliseconds */
    processingTimeMs: number
    /** Model used for analysis */
    modelId: string
}

/**
 * Run the inline image analyzer agent
 *
 * Analyzes blog content to identify optimal locations for inline images.
 * Returns structured recommendations with insertion markers, image types,
 * and priority rankings.
 *
 * @param options - Analysis options
 * @returns Analysis result with image placement recommendations
 *
 * @example
 * ```typescript
 * const result = await runInlineImageAnalyzer({
 *   content: markdownContent,
 *   title: 'BBL Recovery Guide',
 *   maxImages: 5,
 * })
 *
 * console.log(result.analysis.opportunities)
 * // [{ id: 'img-1', insertAfterText: '...', recommendedImageType: 'infographic', ... }]
 * ```
 */
export async function runInlineImageAnalyzer(
    options: InlineImageAnalyzerOptions
): Promise<InlineImageAnalyzerResult> {
    const startTime = Date.now()
    const {
        content,
        title,
        maxImages = 5,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.7,
    } = options

    console.log(
        '[Inline Image Analyzer] ========================================'
    )
    console.log(`[Inline Image Analyzer] Analyzing: "${title}"`)
    console.log(`[Inline Image Analyzer] Max images: ${maxImages}`)
    console.log(`[Inline Image Analyzer] Model: ${modelId}`)
    console.log(
        '[Inline Image Analyzer] ========================================'
    )

    const prompt = getInlineImageAnalyzerPrompt({
        content,
        title,
        maxImages,
    })

    const result = await coreGenerateObject({
        modelId,
        schema: inlineImageAnalysisSchema,
        system: INLINE_IMAGE_ANALYZER_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    // Sort opportunities by priority (lowest number = highest priority)
    const sortedOpportunities = [...result.object.opportunities].sort(
        (a, b) => a.priority - b.priority
    )

    // Limit to maxImages
    const limitedOpportunities = sortedOpportunities.slice(0, maxImages)

    const analysis: InlineImageAnalysis = {
        ...result.object,
        opportunities: limitedOpportunities,
    }

    console.log(
        '[Inline Image Analyzer] ----------------------------------------'
    )
    console.log(
        `[Inline Image Analyzer] Analysis complete: ${analysis.opportunities.length} opportunities identified`
    )
    console.log(
        `[Inline Image Analyzer] Content assessment: ${analysis.contentAssessment.contentLength} words, ${analysis.contentAssessment.existingImageCount} existing images`
    )
    console.log(`[Inline Image Analyzer] Time: ${processingTimeMs}ms`)

    return {
        analysis,
        processingTimeMs,
        modelId,
    }
}
