/**
 * Generate Blog Post Content V2 Function
 *
 * @deprecated Use `runAgenticContentPipeline` from `@workspace/ai/pipelines` instead.
 * This function will be removed in a future version.
 *
 * Enhanced multi-phase blog post content generation pipeline.
 * Features:
 * - Research-first approach with web search
 * - Context injection for internal linking
 * - Quality scoring and enhancement
 * - Parallel metadata and FAQ extraction
 *
 * @module @workspace/ai/functions/generate-blog-post-content-v2
 */
import { coreGenerateText } from '../core'
import {
    GENERATE_POST_CONTENT_SYSTEM_PROMPT,
    getGeneratePostContentV2Prompt,
} from '../prompts/blog/generate-post-content.prompt'
import { getInternalPagesContext } from '../data/internal-pages.data'
import {
    gatherResearch,
    type GatheredResearch,
} from './gather-research.function'
import type { FaqItem } from '@workspace/shared/schemas/blog'

import {
    enhanceContent,
    type EnhanceContentResult,
} from './enhance-content.function'
import { extractMetadata } from './extract-metadata.function'
import { extractFaqs, generateFaqSchema } from './extract-faqs.function'
import { type QualityScoreResult } from './score-content-quality.function'

/**
 * Outline section input type.
 * Simplified from the full OutlineSection in generate-blog-outline
 * since content generation only needs these fields.
 */
type OutlineSectionInput = {
    title: string
    description: string
    keyPoints?: string[]
    subsections?: Array<{ title: string; description?: string }>
}

/**
 * Options for V2 content generation
 */
export type GenerateBlogPostContentV2Options = {
    /** Blog post title */
    title: string
    /** Main topic */
    topic: string
    /** Primary keyword to target */
    primaryKeyword: string
    /** Secondary keywords */
    secondaryKeywords?: string[]
    /** Target audience description */
    targetAudience?: string
    /** What makes this post unique */
    uniqueAngle?: string
    /** Structured outline to follow */
    outline: {
        tldr: string[]
        introduction: { hook: string; preview: string }
        sections: OutlineSectionInput[]
        conclusion: {
            summaryPoints: string[]
            nextSteps: string
        }
    }
    /** Target word count */
    estimatedWordCount?: number
    /** Model ID for content generation (default: gpt-5.2) */
    modelId?: string
    /** Temperature for content (default: 0.7) */
    temperature?: number
    /** Skip research phase (use if you have your own research) */
    skipResearch?: boolean
    /** Custom research context to inject */
    customResearchContext?: string
    /** Minimum quality score threshold (default: 7) */
    minQualityScore?: number
    /** Maximum enhancement passes (default: 2) */
    maxEnhancementPasses?: number
    /** Skip enhancement phase (use raw output) */
    skipEnhancement?: boolean
}

/**
 * Full V2 content response type
 */
export type GenerateBlogPostContentV2Result = {
    /** Final blog post content (markdown) */
    content: string
    /** Word count of final content */
    wordCount: number
    /** SEO meta description */
    metaDescription: string
    /** Short excerpt for previews */
    excerpt: string
    /** Suggested tags */
    suggestedTags: string[]
    /** Reading time in minutes */
    readingTimeMinutes: number
    /** Suggested category */
    suggestedCategory: string
    /** Extracted FAQ items */
    faqs: FaqItem[]
    /** FAQ Schema JSON-LD (null if no FAQs) */
    faqSchema: object | null
    /** Quality score details */
    qualityScore: QualityScoreResult
    /** Research results (if gathered) */
    research?: GatheredResearch
    /** Pipeline metadata */
    pipelineMetadata: {
        /** Total generation time in ms */
        totalTimeMs: number
        /** Research phase time in ms */
        researchTimeMs?: number
        /** Content generation time in ms */
        contentGenTimeMs: number
        /** Enhancement phase time in ms */
        enhancementTimeMs?: number
        /** Number of enhancement passes */
        enhancementPasses: number
        /** Metadata extraction time in ms */
        metadataTimeMs: number
    }
}

/**
 * Default content generation model
 */
const DEFAULT_CONTENT_MODEL = 'gpt-5.2'

/**
 * Generate raw content from outline with research context
 */
async function generateRawContent(options: {
    title: string
    topic: string
    primaryKeyword: string
    secondaryKeywords?: string[]
    targetAudience?: string
    uniqueAngle?: string
    outline: GenerateBlogPostContentV2Options['outline']
    estimatedWordCount?: number
    researchContext?: string
    internalPagesContext: string
    modelId: string
    temperature: number
}): Promise<string> {
    const {
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        uniqueAngle,
        outline,
        estimatedWordCount,
        researchContext,
        internalPagesContext,
        modelId,
        temperature,
    } = options

    const prompt = getGeneratePostContentV2Prompt({
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        uniqueAngle,
        outline,
        estimatedWordCount,
        researchContext,
        internalPagesContext,
    })

    const result = await coreGenerateText({
        modelId,
        system: GENERATE_POST_CONTENT_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    return result.text
}

/**
 * Generate blog post content using V2 multi-phase pipeline
 *
 * This enhanced pipeline:
 * 1. **Research Phase**: Gathers current statistics and authoritative sources
 * 2. **Content Generation**: Creates raw content with research context injection
 * 3. **Quality Enhancement**: Multi-pass editing for natural, human-like writing
 * 4. **Metadata Extraction**: Parallel extraction of SEO metadata and FAQs
 *
 * @param options - Generation options including outline and preferences
 * @returns Complete content with metadata, FAQs, and quality scores
 *
 * @example
 * ```typescript
 * const result = await generateBlogPostContentV2({
 *   title: 'BBL Recovery Guide: Week by Week',
 *   topic: 'Brazilian Butt Lift Recovery',
 *   primaryKeyword: 'bbl recovery',
 *   outline: {
 *     tldr: ['Recovery takes 6-8 weeks', 'Avoid sitting directly for 2 weeks'],
 *     introduction: { hook: '...', preview: '...' },
 *     sections: [...],
 *     conclusion: { summaryPoints: [...], nextSteps: '...' },
 *   },
 * })
 *
 * console.log(result.content) // Full markdown content
 * console.log(result.qualityScore.overall) // 8.5
 * console.log(result.faqs) // Extracted FAQ items
 * console.log(result.pipelineMetadata.totalTimeMs) // 45000
 * ```
 */
export async function generateBlogPostContentV2(
    options: GenerateBlogPostContentV2Options
): Promise<GenerateBlogPostContentV2Result> {
    const startTime = Date.now()

    const {
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        uniqueAngle,
        outline,
        estimatedWordCount = 1500,
        modelId = DEFAULT_CONTENT_MODEL,
        temperature = 0.7,
        skipResearch = false,
        customResearchContext,
        minQualityScore = 7,
        maxEnhancementPasses = 2,
        skipEnhancement = false,
    } = options

    // =========================================================================
    // PHASE 1: RESEARCH
    // =========================================================================
    let research: GatheredResearch | undefined
    let researchContext: string | undefined = customResearchContext
    let researchTimeMs: number | undefined

    if (!skipResearch && !customResearchContext) {
        const researchStart = Date.now()
        try {
            research = await gatherResearch({
                topic,
                primaryKeyword,
                secondaryKeywords,
            })
            researchContext = research.formattedContext
        } catch (error) {
            // Research is optional, continue without it
            console.warn('Research gathering failed:', error)
        }
        researchTimeMs = Date.now() - researchStart
    }

    // =========================================================================
    // PHASE 2: CONTENT GENERATION
    // =========================================================================
    const contentGenStart = Date.now()

    // Get internal pages context for natural linking
    const internalPagesContext = getInternalPagesContext()

    // Generate raw content
    const rawContent = await generateRawContent({
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        uniqueAngle,
        outline,
        estimatedWordCount,
        researchContext,
        internalPagesContext,
        modelId,
        temperature,
    })

    const contentGenTimeMs = Date.now() - contentGenStart

    // =========================================================================
    // PHASE 3: QUALITY ENHANCEMENT
    // =========================================================================
    let enhancementTimeMs: number | undefined
    let enhanceResult: EnhanceContentResult

    if (skipEnhancement) {
        // Import scoreContentQuality for skip case
        const { scoreContentQuality } = await import(
            './score-content-quality.function'
        )
        const qualityScore = await scoreContentQuality({
            content: rawContent,
            primaryKeyword,
            targetAudience,
            threshold: minQualityScore,
        })
        enhanceResult = {
            content: rawContent,
            qualityScore,
            passesPerformed: 0,
            wordCount: rawContent.split(/\s+/).length,
        }
    } else {
        const enhancementStart = Date.now()
        enhanceResult = await enhanceContent({
            content: rawContent,
            primaryKeyword,
            targetAudience,
            minQualityScore,
            maxPasses: maxEnhancementPasses,
            modelId,
        })
        enhancementTimeMs = Date.now() - enhancementStart
    }

    const finalContent = enhanceResult.content
    const wordCount = enhanceResult.wordCount

    // =========================================================================
    // PHASE 4: PARALLEL METADATA & FAQ EXTRACTION
    // =========================================================================
    const metadataStart = Date.now()

    const [metadata, faqResult] = await Promise.all([
        extractMetadata({
            content: finalContent,
            primaryKeyword,
            title,
        }),
        extractFaqs({
            content: finalContent,
            primaryKeyword,
        }),
    ])

    const metadataTimeMs = Date.now() - metadataStart

    // Generate FAQ Schema
    const faqSchema = generateFaqSchema(faqResult.faqs)

    // =========================================================================
    // RETURN COMPLETE RESULT
    // =========================================================================
    const totalTimeMs = Date.now() - startTime

    return {
        content: finalContent,
        wordCount,
        metaDescription: metadata.metaDescription,
        excerpt: metadata.excerpt,
        suggestedTags: metadata.suggestedTags,
        readingTimeMinutes: metadata.readingTimeMinutes,
        suggestedCategory: metadata.suggestedCategory,
        faqs: faqResult.faqs,
        faqSchema,
        qualityScore: enhanceResult.qualityScore,
        research,
        pipelineMetadata: {
            totalTimeMs,
            researchTimeMs,
            contentGenTimeMs,
            enhancementTimeMs,
            enhancementPasses: enhanceResult.passesPerformed,
            metadataTimeMs,
        },
    }
}
