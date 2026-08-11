/**
 * Unified Agentic Content Pipeline
 *
 * Single source of truth for blog content generation with 4 phases:
 * 1. Agentic Content Generation (with on-demand research tools)
 * 2. Review (parallel - all 5 agents)
 * 3. Orchestration (revise based on reviews)
 * 4. Extraction (parallel - FAQ + Metadata)
 *
 * @module @workspace/ai/pipelines/agentic-content
 */
import { generateText, stepCountIs } from 'ai'
import type { FaqItem } from '@workspace/shared/schemas/blog'

import {
    runInternalLinksReviewer,
    runExternalLinksReviewer,
    runWritingQualityReviewer,
    runAISlopDetector,
    runCannibalizationChecker,
    runOrchestrator,
    type AgentReview,
    type OrchestratorResult,
} from '../agents'
import { getModel, temperatureParam } from '../models/model-resolver.util'
import { runFactSourceVerifier } from '../agents/fact-source-verifier.agent'
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
import type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'
import type { AgenticContentPipelineOptions } from '../types/pipeline/agentic-content-pipeline-options.type'
import type { AgenticContentPipelineResult } from '../types/pipeline/agentic-content-pipeline-result.type'

/**
 * Default configuration
 */
const DEFAULTS = {
    CONTENT_MODEL: 'claude-opus-5',
    REVIEW_MODEL: 'claude-opus-5',
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

    // Build prompts using modular prompt system with content type
    const systemPrompt = buildAgenticSystemPrompt(idea.contentType)
    const userPrompt = buildAgenticUserPrompt({
        title: idea.title,
        topic: idea.topic || idea.title,
        primaryKeyword: idea.primaryKeyword || '',
        secondaryKeywords: idea.secondaryKeywords,
        targetAudience: idea.targetAudience,
        uniqueAngle: idea.uniqueAngle,
        contentType: idea.contentType,
        outline: outline,
        estimatedWordCount: idea.estimatedWordCount,
        internalPagesContext,
    })

    // Track progress
    let toolCallCount = 0
    let stepCount = 0

    console.log('[Agentic Pipeline] ========================================')
    console.log('[Agentic Pipeline] Starting Phase 1: Content Generation')
    console.log(`[Agentic Pipeline] Title: "${idea.title}"`)
    console.log(
        `[Agentic Pipeline] Content Type: ${idea.contentType || 'guide'}`
    )
    console.log(`[Agentic Pipeline] Model: ${contentModelId}`)
    console.log(`[Agentic Pipeline] Max steps: ${maxSteps}`)
    console.log('[Agentic Pipeline] ========================================')

    const model = getModel(contentModelId)

    // Generate content with tools
    const result = await generateText({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        ...temperatureParam(contentModelId, temperature),
        maxOutputTokens: 16000,
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
 * Runs all 5 review agents in parallel:
 * 1. Internal Links Reviewer
 * 2. External Links Reviewer
 * 3. Writing Quality Reviewer
 * 4. AI Slop Detector
 * 5. Fact & Source Verifier
 * 6. Cannibalization Checker (registry-only in this path)
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

    console.log('[Agentic Pipeline] Starting Phase 2: Review (6 agents)')

    const reviewOptions = {
        content,
        title,
        primaryKeyword,
        secondaryKeywords,
        modelId: reviewModelId,
    }

    // Run all 6 reviews in parallel
    const [
        internalLinksReview,
        externalLinksReview,
        writingQualityReview,
        aiSlopReview,
        factSourceReview,
        cannibalizationReview,
    ]: [
        AgentReview,
        AgentReview,
        AgentReview,
        AgentReview,
        AgentReview,
        AgentReview,
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
        runFactSourceVerifier(reviewOptions).then((result) => {
            onProgress?.(
                'review-fact-source',
                100,
                'Fact & source verification complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            console.log(
                `[Agentic Pipeline] Fact verification: ${result.score}/100 (${result.issues.length} issues)`
            )
            return result
        }),
        runCannibalizationChecker(reviewOptions).then((result) => {
            onProgress?.(
                'review-cannibalization',
                100,
                'Cannibalization review complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            console.log(
                `[Agentic Pipeline] Cannibalization: ${result.score}/100 (${result.issues.length} issues)`
            )
            return result
        }),
    ])

    const reviews = [
        internalLinksReview,
        externalLinksReview,
        writingQualityReview,
        aiSlopReview,
        factSourceReview,
        cannibalizationReview,
    ]

    const timeMs = Date.now() - startTime
    console.log(`[Agentic Pipeline] Review phase complete: ${timeMs}ms`)

    return { reviews, timeMs }
}

/**
 * Orchestration phase options
 */
type OrchestrationPhaseOptions = {
    content: string
    title: string
    primaryKeyword?: string
    secondaryKeywords?: string[]
    targetAudience?: string
    contentType?: string
    estimatedWordCount?: number
    reviews: AgentReview[]
    onProgress?: AgenticPipelineProgressCallback
}

/**
 * Phase 3: Orchestration Phase
 *
 * Revises content based on review feedback with full context.
 */
async function runOrchestrationPhase(
    options: OrchestrationPhaseOptions
): Promise<{ result: OrchestratorResult; timeMs: number }> {
    const startTime = Date.now()
    const {
        content,
        title,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        contentType,
        estimatedWordCount,
        reviews,
        onProgress,
    } = options

    console.log('[Agentic Pipeline] Starting Phase 3: Orchestration')
    onProgress?.('orchestration', 10, 'Starting content revision...')

    const result = await runOrchestrator({
        originalContent: content,
        title,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        contentType,
        estimatedWordCount,
        reviews,
    })

    const timeMs = Date.now() - startTime

    onProgress?.('orchestration', 100, 'Content revision complete', {
        type: 'orchestration-result',
    })

    console.log('[Agentic Pipeline] Orchestration complete')
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
 * 2. Review (parallel - 5 agents including fact verification)
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
 *     contentType: 'guide',
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
 * console.log(result.reviews) // Review agent results (5 agents)
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
    console.log(
        `[Agentic Pipeline] Content Type: ${idea.contentType || 'guide'}`
    )
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
                const orchestrationResult = await runOrchestrationPhase({
                    content: generationResult.content,
                    title: idea.title,
                    primaryKeyword: idea.primaryKeyword,
                    secondaryKeywords: idea.secondaryKeywords,
                    targetAudience: idea.targetAudience,
                    contentType: idea.contentType,
                    estimatedWordCount: idea.estimatedWordCount,
                    reviews,
                    onProgress,
                })
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
