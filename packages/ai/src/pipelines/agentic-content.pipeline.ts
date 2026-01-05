/**
 * Unified Agentic Content Pipeline
 *
 * Single source of truth for blog content generation with 4 phases:
 * 1. Agentic Content Generation (with on-demand research tools)
 * 2. Review (parallel - all 4 agents)
 * 3. Orchestration (revise based on reviews)
 * 4. Extraction (parallel - FAQ + Metadata)
 *
 * @module @workspace/ai/pipelines/agentic-content
 */
import { generateText, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { FaqItem } from '@workspace/shared/schemas/blog'

import {
    runInternalLinksReviewer,
    runExternalLinksReviewer,
    runWritingQualityReviewer,
    runAISlopDetector,
    runOrchestrator,
    type AgentReview,
    type OrchestratorResult,
} from '../agents'
import {
    createResearchTools,
    createSourceCollector,
    type CollectedSource,
} from '../tools/research-tools.tool'
import { getInternalPagesContext } from '../data/internal-pages.data'
import { extractMetadata } from '../functions/extract-metadata.function'
import {
    extractFaqs,
    generateFaqSchema,
} from '../functions/extract-faqs.function'
import { telemetryConfig } from '../telemetry'
import {
    buildAgenticSystemPrompt,
    buildAgenticUserPrompt,
} from '../prompts/blog/agentic-writer.prompt'

/**
 * Pipeline step types for progress tracking
 */
export type AgenticPipelineStep =
    | 'generation'
    | 'generation-tool-call'
    | 'review-internal-links'
    | 'review-external-links'
    | 'review-writing-quality'
    | 'review-ai-slop'
    | 'orchestration'
    | 'extraction'
    | 'complete'
    | 'error'

/**
 * Progress callback for streaming updates
 */
export type AgenticPipelineProgressCallback = (
    step: AgenticPipelineStep,
    progress: number,
    message: string,
    data?: AgenticProgressData
) => void

/**
 * Progress data types
 */
export type AgenticProgressData =
    | {
          type: 'tool-call'
          toolName: string
          query: string
          toolCallIndex: number
      }
    | { type: 'text-generation'; charCount: number }
    | {
          type: 'review-result'
          agentName: string
          score: number
          summary: string
          issueCount: number
      }
    | {
          type: 'orchestration-result'
          changeCount: number
          overallScore: number
      }
    | { type: 'extraction-result'; faqCount: number }
    | Record<string, unknown>

/**
 * Outline section input type
 */
type OutlineSectionInput = {
    title: string
    description: string
    keyPoints?: string[]
    subsections?: Array<{ title: string; description?: string }>
}

/**
 * Blog idea input for the pipeline
 */
export type AgenticPipelineIdeaInput = {
    title: string
    topic?: string
    primaryKeyword?: string
    secondaryKeywords?: string[]
    targetAudience?: string
    uniqueAngle?: string
    estimatedWordCount?: number
}

/**
 * Blog outline input for the pipeline
 */
export type AgenticPipelineOutlineInput = {
    tldr: string[]
    introduction: {
        hook: string
        preview: string
    }
    sections: OutlineSectionInput[]
    conclusion: {
        summaryPoints: string[]
        nextSteps: string
    }
}

/**
 * Options for the unified agentic content pipeline
 */
export type AgenticContentPipelineOptions = {
    /** Blog idea input */
    idea: AgenticPipelineIdeaInput
    /** Blog outline */
    outline: AgenticPipelineOutlineInput
    /** Progress callback for streaming updates */
    onProgress?: AgenticPipelineProgressCallback
    /** Skip review phase (faster, lower quality) */
    skipReview?: boolean
    /** Skip orchestration/revision phase */
    skipOrchestration?: boolean
    /** Model ID for content generation (default: gpt-5.2) */
    contentModelId?: string
    /** Model ID for review agents (default: gpt-5.2) */
    reviewModelId?: string
    /** Temperature for content generation (default: 0.7) */
    temperature?: number
    /** Maximum tool call steps (default: 25) */
    maxSteps?: number
    /** Minimum acceptable quality score (default: 70) */
    minQualityScore?: number
}

/**
 * Result from the unified agentic content pipeline
 */
export type AgenticContentPipelineResult = {
    /** Whether pipeline succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** Final revised content (or initial if review skipped) */
    content: string
    /** Word count */
    wordCount: number
    /** SEO meta description */
    metaDescription: string
    /** Short excerpt */
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
    /** All sources used during generation */
    sources: CollectedSource[]
    /** Reviews from all agents (empty if skipped) */
    reviews: AgentReview[]
    /** Orchestrator result (null if skipped) */
    orchestratorResult: OrchestratorResult | null
    /** Initial content before revisions */
    initialContent: string
    /** Initial word count before revisions */
    initialWordCount: number
    /** Pipeline timing metrics */
    metrics: {
        totalTimeMs: number
        generationTimeMs: number
        reviewTimeMs: number
        orchestrationTimeMs: number
        extractionTimeMs: number
        toolCallCount: number
        stepCount: number
    }
}

/**
 * Default configuration
 */
const DEFAULTS = {
    CONTENT_MODEL: 'gpt-5.2',
    REVIEW_MODEL: 'gpt-5.2',
    TEMPERATURE: 0.7,
    MAX_STEPS: 25,
    MIN_QUALITY_SCORE: 70,
    MIN_WORD_COUNT: 200,
} as const

/**
 * Count words in content
 */
function countWords(text: string): number {
    return text.split(/\s+/).filter((w) => w.length > 0).length
}

/**
 * Phase 1: Agentic Content Generation
 *
 * Generates content with on-demand research using AI tools.
 */
async function runGenerationPhase(
    options: AgenticContentPipelineOptions,
    onProgress?: AgenticPipelineProgressCallback
): Promise<{
    content: string
    wordCount: number
    sources: CollectedSource[]
    toolCallCount: number
    stepCount: number
    timeMs: number
}> {
    const startTime = Date.now()
    const {
        idea,
        outline,
        contentModelId = DEFAULTS.CONTENT_MODEL,
        temperature = DEFAULTS.TEMPERATURE,
        maxSteps = DEFAULTS.MAX_STEPS,
    } = options

    onProgress?.('generation', 5, 'Starting agentic content generation...')

    // Create source collector and tools
    const sourceContext = createSourceCollector()
    const tools = createResearchTools(sourceContext)

    // Get internal pages context
    const internalPagesContext = getInternalPagesContext()

    // Build prompts using modular prompt system
    const systemPrompt = buildAgenticSystemPrompt()
    const userPrompt = buildAgenticUserPrompt({
        title: idea.title,
        topic: idea.topic || idea.title,
        primaryKeyword: idea.primaryKeyword || '',
        secondaryKeywords: idea.secondaryKeywords,
        targetAudience: idea.targetAudience,
        uniqueAngle: idea.uniqueAngle,
        outline: {
            tldr: outline.tldr,
            introduction: outline.introduction,
            sections: outline.sections,
            conclusion: outline.conclusion,
        },
        estimatedWordCount: idea.estimatedWordCount,
        internalPagesContext,
    })

    // Track progress
    let toolCallCount = 0
    let stepCount = 0

    console.log('[Agentic Pipeline] ========================================')
    console.log('[Agentic Pipeline] Starting Phase 1: Content Generation')
    console.log(`[Agentic Pipeline] Title: "${idea.title}"`)
    console.log(`[Agentic Pipeline] Model: ${contentModelId}`)
    console.log(`[Agentic Pipeline] Max steps: ${maxSteps}`)
    console.log('[Agentic Pipeline] ========================================')

    // Generate content with tools
    const result = await generateText({
        model: openai(contentModelId),
        system: systemPrompt,
        prompt: userPrompt,
        temperature,
        tools,
        stopWhen: stepCountIs(maxSteps),
        experimental_telemetry: telemetryConfig,
        onStepFinish: (event) => {
            stepCount++
            const hasToolCalls = (event.toolCalls?.length ?? 0) > 0

            if (hasToolCalls) {
                toolCallCount += event.toolCalls?.length ?? 0

                // Send tool call progress
                for (const toolCall of event.toolCalls) {
                    const toolInput =
                        'input' in toolCall
                            ? (toolCall.input as Record<string, unknown>)
                            : {}
                    const query =
                        typeof toolInput?.query === 'string'
                            ? toolInput.query
                            : 'research query'

                    onProgress?.(
                        'generation-tool-call',
                        Math.min(80, 10 + toolCallCount * 5),
                        `Searching: ${query}`,
                        {
                            type: 'tool-call',
                            toolName: toolCall.toolName,
                            query,
                            toolCallIndex: toolCallCount,
                        }
                    )

                    console.log(
                        `[Agentic Pipeline] Tool call ${toolCallCount}: ${toolCall.toolName} - "${query}"`
                    )
                }
            } else {
                console.log(
                    `[Agentic Pipeline] Step ${stepCount}: Text generation (${event.text?.length ?? 0} chars)`
                )
            }
        },
    })

    const content = result.text
    const wordCount = countWords(content)
    const timeMs = Date.now() - startTime

    console.log('[Agentic Pipeline] ----------------------------------------')
    console.log(`[Agentic Pipeline] Generation complete: ${wordCount} words`)
    console.log(`[Agentic Pipeline] Tool calls: ${toolCallCount}`)
    console.log(`[Agentic Pipeline] Sources: ${sourceContext.sources.length}`)
    console.log(`[Agentic Pipeline] Time: ${timeMs}ms`)

    // Validate content
    if (!content || content.trim().length === 0) {
        throw new Error(
            `Content generation failed: Empty result. Finish reason: ${result.finishReason}`
        )
    }

    if (wordCount < DEFAULTS.MIN_WORD_COUNT) {
        throw new Error(
            `Content generation incomplete: Only ${wordCount} words generated (minimum: ${DEFAULTS.MIN_WORD_COUNT})`
        )
    }

    onProgress?.(
        'generation',
        100,
        `Content generation complete: ${wordCount} words`
    )

    return {
        content,
        wordCount,
        sources: sourceContext.sources,
        toolCallCount,
        stepCount,
        timeMs,
    }
}

/**
 * Phase 2: Review Phase
 *
 * Runs all 4 review agents in parallel.
 */
async function runReviewPhase(
    content: string,
    title: string,
    primaryKeyword?: string,
    secondaryKeywords?: string[],
    reviewModelId?: string,
    onProgress?: AgenticPipelineProgressCallback
): Promise<{ reviews: AgentReview[]; timeMs: number }> {
    const startTime = Date.now()

    console.log('[Agentic Pipeline] Starting Phase 2: Review')

    const reviewOptions = {
        content,
        title,
        primaryKeyword,
        secondaryKeywords,
        modelId: reviewModelId,
    }

    // Run all reviews in parallel
    const [
        internalLinksReview,
        externalLinksReview,
        writingQualityReview,
        aiSlopReview,
    ] = await Promise.all([
        runInternalLinksReviewer(reviewOptions).then((result) => {
            onProgress?.(
                'review-internal-links',
                100,
                'Internal links review complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            console.log(
                `[Agentic Pipeline] Internal links: ${result.score}/100 (${result.issues.length} issues)`
            )
            return result
        }),
        runExternalLinksReviewer(reviewOptions).then((result) => {
            onProgress?.(
                'review-external-links',
                100,
                'External links review complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            console.log(
                `[Agentic Pipeline] External links: ${result.score}/100 (${result.issues.length} issues)`
            )
            return result
        }),
        runWritingQualityReviewer(reviewOptions).then((result) => {
            onProgress?.(
                'review-writing-quality',
                100,
                'Writing quality review complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            console.log(
                `[Agentic Pipeline] Writing quality: ${result.score}/100 (${result.issues.length} issues)`
            )
            return result
        }),
        runAISlopDetector(reviewOptions).then((result) => {
            onProgress?.('review-ai-slop', 100, 'AI slop detection complete', {
                type: 'review-result',
                agentName: result.agentName,
                score: result.score,
                summary: result.summary,
                issueCount: result.issues.length,
            })
            console.log(
                `[Agentic Pipeline] AI slop: ${result.score}/100 (${result.issues.length} issues)`
            )
            return result
        }),
    ])

    const reviews = [
        internalLinksReview,
        externalLinksReview,
        writingQualityReview,
        aiSlopReview,
    ]

    const timeMs = Date.now() - startTime
    console.log(`[Agentic Pipeline] Review phase complete: ${timeMs}ms`)

    return { reviews, timeMs }
}

/**
 * Phase 3: Orchestration Phase
 *
 * Revises content based on review feedback.
 */
async function runOrchestrationPhase(
    content: string,
    title: string,
    primaryKeyword: string | undefined,
    reviews: AgentReview[],
    onProgress?: AgenticPipelineProgressCallback
): Promise<{ result: OrchestratorResult; timeMs: number }> {
    const startTime = Date.now()

    console.log('[Agentic Pipeline] Starting Phase 3: Orchestration')
    onProgress?.('orchestration', 10, 'Starting content revision...')

    const result = await runOrchestrator({
        originalContent: content,
        title,
        primaryKeyword,
        reviews,
    })

    const timeMs = Date.now() - startTime

    onProgress?.('orchestration', 100, 'Content revision complete', {
        type: 'orchestration-result',
        changeCount: result.changes.length,
        overallScore: result.overallScore,
    })

    console.log(
        `[Agentic Pipeline] Orchestration complete: ${result.changes.length} changes, score ${result.overallScore}/100`
    )
    console.log(`[Agentic Pipeline] Orchestration time: ${timeMs}ms`)

    return { result, timeMs }
}

/**
 * Phase 4: Extraction Phase
 *
 * Extracts metadata and FAQs in parallel.
 */
async function runExtractionPhase(
    content: string,
    title: string,
    primaryKeyword?: string,
    onProgress?: AgenticPipelineProgressCallback
): Promise<{
    metaDescription: string
    excerpt: string
    suggestedTags: string[]
    readingTimeMinutes: number
    suggestedCategory: string
    faqs: FaqItem[]
    faqSchema: object | null
    timeMs: number
}> {
    const startTime = Date.now()

    console.log('[Agentic Pipeline] Starting Phase 4: Extraction')
    onProgress?.('extraction', 10, 'Extracting metadata and FAQs...')

    const [metadata, faqResult] = await Promise.all([
        extractMetadata({
            content,
            primaryKeyword: primaryKeyword || title,
            title,
        }),
        extractFaqs({
            content,
            primaryKeyword: primaryKeyword || title,
        }),
    ])

    const faqSchema = generateFaqSchema(faqResult.faqs)
    const timeMs = Date.now() - startTime

    onProgress?.('extraction', 100, 'Extraction complete', {
        type: 'extraction-result',
        faqCount: faqResult.faqs.length,
    })

    console.log(
        `[Agentic Pipeline] Extraction complete: ${faqResult.faqs.length} FAQs`
    )
    console.log(`[Agentic Pipeline] Extraction time: ${timeMs}ms`)

    return {
        metaDescription: metadata.metaDescription,
        excerpt: metadata.excerpt,
        suggestedTags: metadata.suggestedTags,
        readingTimeMinutes: metadata.readingTimeMinutes,
        suggestedCategory: metadata.suggestedCategory,
        faqs: faqResult.faqs,
        faqSchema,
        timeMs,
    }
}

/**
 * Run the unified agentic content pipeline
 *
 * Single entry point for all blog content generation with 4 phases:
 * 1. Agentic Generation (with on-demand research)
 * 2. Review (parallel - 4 agents)
 * 3. Orchestration (revise based on reviews)
 * 4. Extraction (FAQ + Metadata)
 *
 * @param options - Pipeline options
 * @returns Complete pipeline result
 *
 * @example
 * ```typescript
 * const result = await runAgenticContentPipeline({
 *   idea: {
 *     title: 'BBL Recovery Guide: Week by Week',
 *     topic: 'Brazilian Butt Lift Recovery',
 *     primaryKeyword: 'bbl recovery',
 *   },
 *   outline: {
 *     tldr: ['Recovery takes 6-8 weeks'],
 *     introduction: { hook: '...', preview: '...' },
 *     sections: [...],
 *     conclusion: { summaryPoints: [...], nextSteps: '...' },
 *   },
 *   onProgress: (step, progress, message) => {
 *     console.log(`${step}: ${progress}% - ${message}`)
 *   },
 * })
 *
 * console.log(result.content) // Final revised content
 * console.log(result.reviews) // Review agent results
 * console.log(result.sources) // All sources used
 * ```
 */
export async function runAgenticContentPipeline(
    options: AgenticContentPipelineOptions
): Promise<AgenticContentPipelineResult> {
    const startTime = Date.now()
    const {
        idea,
        onProgress,
        skipReview = false,
        skipOrchestration = false,
    } = options

    console.log('[Agentic Pipeline] ========================================')
    console.log('[Agentic Pipeline] Starting Unified Agentic Content Pipeline')
    console.log(`[Agentic Pipeline] Title: "${idea.title}"`)
    console.log(`[Agentic Pipeline] Skip review: ${skipReview}`)
    console.log(`[Agentic Pipeline] Skip orchestration: ${skipOrchestration}`)
    console.log('[Agentic Pipeline] ========================================')

    // Initialize metrics
    const metrics = {
        totalTimeMs: 0,
        generationTimeMs: 0,
        reviewTimeMs: 0,
        orchestrationTimeMs: 0,
        extractionTimeMs: 0,
        toolCallCount: 0,
        stepCount: 0,
    }

    try {
        // Phase 1: Agentic Content Generation
        const generationResult = await runGenerationPhase(options, onProgress)
        metrics.generationTimeMs = generationResult.timeMs
        metrics.toolCallCount = generationResult.toolCallCount
        metrics.stepCount = generationResult.stepCount

        let finalContent = generationResult.content
        let reviews: AgentReview[] = []
        let orchestratorResult: OrchestratorResult | null = null

        // Phase 2: Review (if not skipped)
        if (!skipReview) {
            const reviewResult = await runReviewPhase(
                generationResult.content,
                idea.title,
                idea.primaryKeyword,
                idea.secondaryKeywords,
                options.reviewModelId,
                onProgress
            )
            reviews = reviewResult.reviews
            metrics.reviewTimeMs = reviewResult.timeMs

            // Phase 3: Orchestration (if not skipped)
            if (!skipOrchestration) {
                const orchestrationResult = await runOrchestrationPhase(
                    generationResult.content,
                    idea.title,
                    idea.primaryKeyword,
                    reviews,
                    onProgress
                )
                orchestratorResult = orchestrationResult.result
                finalContent = orchestrationResult.result.revisedContent
                metrics.orchestrationTimeMs = orchestrationResult.timeMs
            }
        }

        // Phase 4: Extraction
        const extractionResult = await runExtractionPhase(
            finalContent,
            idea.title,
            idea.primaryKeyword,
            onProgress
        )
        metrics.extractionTimeMs = extractionResult.timeMs

        // Complete
        metrics.totalTimeMs = Date.now() - startTime
        onProgress?.('complete', 100, 'Pipeline complete!')

        console.log(
            '[Agentic Pipeline] ========================================'
        )
        console.log('[Agentic Pipeline] Pipeline Complete!')
        console.log(`[Agentic Pipeline] Total time: ${metrics.totalTimeMs}ms`)
        console.log(
            `[Agentic Pipeline] Final word count: ${countWords(finalContent)}`
        )
        console.log(
            '[Agentic Pipeline] ========================================'
        )

        return {
            success: true,
            content: finalContent,
            wordCount: countWords(finalContent),
            metaDescription: extractionResult.metaDescription,
            excerpt: extractionResult.excerpt,
            suggestedTags: extractionResult.suggestedTags,
            readingTimeMinutes: extractionResult.readingTimeMinutes,
            suggestedCategory: extractionResult.suggestedCategory,
            faqs: extractionResult.faqs,
            faqSchema: extractionResult.faqSchema,
            sources: generationResult.sources,
            reviews,
            orchestratorResult,
            initialContent: generationResult.content,
            initialWordCount: generationResult.wordCount,
            metrics,
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('[Agentic Pipeline] ERROR:', errorMessage)

        metrics.totalTimeMs = Date.now() - startTime
        onProgress?.('error', 0, `Pipeline failed: ${errorMessage}`)

        return {
            success: false,
            error: errorMessage,
            content: '',
            wordCount: 0,
            metaDescription: '',
            excerpt: '',
            suggestedTags: [],
            readingTimeMinutes: 0,
            suggestedCategory: '',
            faqs: [],
            faqSchema: null,
            sources: [],
            reviews: [],
            orchestratorResult: null,
            initialContent: '',
            initialWordCount: 0,
            metrics,
        }
    }
}
