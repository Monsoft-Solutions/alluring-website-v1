/**
 * Review Phase Runner
 *
 * Standalone runner for the review and orchestration phases.
 * Runs 6 review agents in parallel and then orchestrates content revision.
 *
 * @module @workspace/ai/pipelines/review-phase
 */
import {
    runInternalLinksReviewer,
    runExternalLinksReviewer,
    runWritingQualityReviewer,
    runAISlopDetector,
    runCannibalizationChecker,
    runOrchestrator,
    type AgentReview,
    type OrchestratorResult,
    type RankingPage,
} from '../agents'
import { runFactSourceVerifier } from '../agents/fact-source-verifier.agent'
import type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'

/**
 * Default configuration for review phase
 */
const DEFAULTS = {
    REVIEW_MODEL: 'claude-opus-5',
} as const

/**
 * Options for running the review phase
 */
export type ReviewPhaseOptions = {
    /** Generated content to review (markdown) */
    content: string
    /** Blog post title */
    title: string
    /** Primary SEO keyword */
    primaryKeyword?: string
    /** Secondary SEO keywords */
    secondaryKeywords?: string[]
    /** Target audience (for orchestration context) */
    targetAudience?: string
    /** Content type (for orchestration context) */
    contentType?: string
    /** Estimated word count (for orchestration context) */
    estimatedWordCount?: number
    /** Model ID for review agents */
    reviewModelId?: string
    /** Whether to skip orchestration (just return reviews) */
    skipOrchestration?: boolean
    /** Slug of the post under review (cannibalization self-match guard) */
    currentPostSlug?: string
    /**
     * Live Search Console lookup for the cannibalization checker,
     * injected by the caller. Registry-only mode when absent.
     */
    pagesForQuery?: (query: string) => Promise<RankingPage[]>
    /** Progress callback */
    onProgress?: AgenticPipelineProgressCallback
}

/**
 * Result from the review phase
 */
export type ReviewPhaseResult = {
    /** Whether review succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** Reviews from all 5 agents */
    reviews: AgentReview[]
    /** Revised content after orchestration (null if skipped) */
    revisedContent: string | null
    /** Orchestrator result (null if skipped) */
    orchestratorResult: OrchestratorResult | null
    /** Review phase time in ms */
    reviewTimeMs: number
    /** Orchestration phase time in ms */
    orchestrationTimeMs: number
    /** Total processing time in ms */
    totalTimeMs: number
    /** Model the review agents ran on (resolved after defaults) */
    modelId: string
}

/**
 * Run the review phase standalone
 *
 * Runs 6 review agents in parallel:
 * 1. Internal Links Reviewer
 * 2. External Links Reviewer
 * 3. Writing Quality Reviewer
 * 4. AI Slop Detector
 * 5. Fact & Source Verifier
 * 6. Cannibalization Checker
 *
 * Then runs orchestration to revise content based on feedback.
 *
 * @param options - Review options
 * @returns Review result with reviews and revised content
 *
 * @example
 * ```typescript
 * const result = await runReviewPhase({
 *   content: generatedMarkdown,
 *   title: 'BBL Recovery Guide',
 *   primaryKeyword: 'bbl recovery',
 * })
 *
 * console.log(result.reviews) // 6 agent reviews
 * console.log(result.revisedContent) // Improved content
 * ```
 */
export async function runReviewPhase(
    options: ReviewPhaseOptions
): Promise<ReviewPhaseResult> {
    const startTime = Date.now()
    const {
        content,
        title,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        contentType,
        estimatedWordCount,
        reviewModelId = DEFAULTS.REVIEW_MODEL,
        skipOrchestration = false,
        currentPostSlug,
        pagesForQuery,
        onProgress,
    } = options

    try {
        // Phase 1: Run all 6 reviews in parallel
        console.log('[Review Phase] Starting Review (6 agents)')
        const reviewStartTime = Date.now()

        const reviewOptions = {
            content,
            title,
            primaryKeyword,
            secondaryKeywords,
            modelId: reviewModelId,
        }

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
                    `[Review Phase] Internal links: ${result.score}/100 (${result.issues.length} issues)`
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
                    `[Review Phase] External links: ${result.score}/100 (${result.issues.length} issues)`
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
                    `[Review Phase] Writing quality: ${result.score}/100 (${result.issues.length} issues)`
                )
                return result
            }),
            runAISlopDetector(reviewOptions).then((result) => {
                onProgress?.(
                    'review-ai-slop',
                    100,
                    'AI slop detection complete',
                    {
                        type: 'review-result',
                        agentName: result.agentName,
                        score: result.score,
                        summary: result.summary,
                        issueCount: result.issues.length,
                    }
                )
                console.log(
                    `[Review Phase] AI slop: ${result.score}/100 (${result.issues.length} issues)`
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
                    `[Review Phase] Fact verification: ${result.score}/100 (${result.issues.length} issues)`
                )
                return result
            }),
            runCannibalizationChecker({
                ...reviewOptions,
                currentPostSlug,
                pagesForQuery,
            }).then((result) => {
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
                    `[Review Phase] Cannibalization: ${result.score}/100 (${result.issues.length} issues)`
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

        const reviewTimeMs = Date.now() - reviewStartTime
        console.log(`[Review Phase] Review complete: ${reviewTimeMs}ms`)

        // Phase 2: Orchestration (if not skipped)
        let revisedContent: string | null = null
        let orchestratorResult: OrchestratorResult | null = null
        let orchestrationTimeMs = 0

        if (!skipOrchestration) {
            console.log('[Review Phase] Starting Orchestration')
            const orchestrationStartTime = Date.now()
            onProgress?.('orchestration', 10, 'Starting content revision...')

            orchestratorResult = await runOrchestrator({
                originalContent: content,
                title,
                primaryKeyword,
                secondaryKeywords,
                targetAudience,
                contentType,
                estimatedWordCount,
                reviews,
                // Configured review model drives the orchestrator too
                modelId: reviewModelId,
            })

            revisedContent = orchestratorResult.revisedContent
            orchestrationTimeMs = Date.now() - orchestrationStartTime

            onProgress?.('orchestration', 100, 'Content revision complete', {
                type: 'orchestration-result',
            })

            console.log('[Review Phase] Orchestration complete')
            console.log(
                `[Review Phase] Orchestration time: ${orchestrationTimeMs}ms`
            )
        }

        const totalTimeMs = Date.now() - startTime

        return {
            success: true,
            reviews,
            revisedContent,
            orchestratorResult,
            reviewTimeMs,
            orchestrationTimeMs,
            totalTimeMs,
            modelId: reviewModelId,
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('[Review Phase] ERROR:', errorMessage)

        onProgress?.('error', 0, `Review failed: ${errorMessage}`)

        return {
            success: false,
            error: errorMessage,
            reviews: [],
            revisedContent: null,
            orchestratorResult: null,
            reviewTimeMs: 0,
            orchestrationTimeMs: 0,
            totalTimeMs: Date.now() - startTime,
            modelId: reviewModelId,
        }
    }
}
