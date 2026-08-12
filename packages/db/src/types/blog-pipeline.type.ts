/**
 * Blog Pipeline Types
 *
 * Types for the unified blog content pipeline.
 * Used in the blog_post table for planning data and pipeline state.
 *
 * @module @workspace/db/types/blog-pipeline
 */

import type { SelectedImageOptions } from '@workspace/shared/schemas/blog'

/**
 * Outline section for structured blog outlines
 */
export type OutlineSection = {
    id: string
    title: string
    description?: string
    keyPoints?: string[]
    subsections?: OutlineSection[]
}

/**
 * Planning data stored during the ideation phase.
 * Contains all the research and planning information
 * needed to generate content.
 */
export type PlanningData = {
    /** The main topic or theme of the post */
    topic?: string
    /** Unique angle or perspective for the content */
    uniqueAngle?: string
    /** Target audience description */
    targetAudience?: string
    /** Pain points the content addresses */
    painPoints?: string[]
    /** Type of content (guide, tutorial, etc.) */
    contentType?: string
    /** Estimated word count for the post */
    estimatedWordCount?: number
    /** Structured outline for the content */
    outline?: OutlineSection[]
    /** Research notes collected during planning */
    researchNotes?: string
    /** Competitor URLs analyzed for research */
    competitorUrls?: string[]
    /** AI-generated SEO opportunity score (0-100) */
    aiGeneratedScore?: number
    /** AI-generated suggestions for improvement */
    aiSuggestions?: string
    /** Rejection details when an idea is declined (by an admin or by the
     * autopilot write-time re-gate). Rejected ideas stay in the DB so
     * ideation never re-proposes them. */
    ideaRejection?: {
        reason?: string
        rejectedAt?: string
        rejectedBy?: 'admin' | 'autopilot'
    }
    /** Keyword-ownership gate verdict recorded when the post was created */
    ideationGate?: {
        verdict: 'new' | 'refresh' | 'reject'
        reason?: string
        /** Owning page when the verdict is refresh/reject */
        owningUrl?: string
        /** Queries this post claims (verdict 'new') */
        claimedQueries?: string[]
        /** ISO timestamp of the gate check */
        checkedAt?: string
    }
}

/**
 * Source collected during research
 */
export type CollectedSource = {
    title: string
    url: string
    type: 'perplexity' | 'google'
}

/**
 * Review issue found by an agent
 */
export type ReviewIssue = {
    severity: 'critical' | 'warning' | 'suggestion'
    location: string
    description: string
    suggestedFix: string
    originalText: string | null
}

/**
 * Result from a review agent
 */
export type AgentReview = {
    agentName: string
    score: number
    issues: ReviewIssue[]
    summary: string
    processingTimeMs: number
    modelId: string
}

/**
 * Result from the orchestrator
 */
export type OrchestratorResult = {
    revisedContent: string
    agentReviews: AgentReview[]
    processingTimeMs: number
}

/**
 * Phase keys for per-phase bookkeeping inside PipelineState
 */
export type PipelinePhaseKey =
    | 'generation'
    | 'review'
    | 'extraction'
    | 'imageGeneration'

/**
 * Record of the one-shot automatic re-run a phase gets after failing with
 * a transient provider error (rate limit, 5xx, network).
 */
export type PhaseAutoRetry = {
    attemptedAt: string
    /** The transient error message that triggered the retry */
    reason: string
}

/**
 * Pipeline metrics for tracking performance
 */
export type PipelineMetrics = {
    totalTimeMs: number
    generationTimeMs: number
    reviewTimeMs: number
    orchestrationTimeMs: number
    extractionTimeMs: number
    toolCallCount: number
    stepCount: number
}

/**
 * Pipeline state for tracking intermediate results.
 * Stores results from each phase of the content pipeline.
 */
export type PipelineState = {
    /** Generation phase results */
    generationPhase?: {
        startedAt: string
        completedAt?: string
        sources?: CollectedSource[]
        initialContent?: string
        initialWordCount?: number
        toolCallCount?: number
        stepCount?: number
    }
    /** Review phase results */
    reviewPhase?: {
        startedAt: string
        completedAt?: string
        reviews?: AgentReview[]
    }
    /** Orchestration phase results */
    orchestrationPhase?: {
        startedAt: string
        completedAt?: string
        result?: OrchestratorResult
    }
    /** Extraction phase results */
    extractionPhase?: {
        startedAt: string
        completedAt?: string
    }
    /** Image generation phase results */
    imageGenerationPhase?: {
        startedAt: string
        completedAt?: string
        selectedOptions?: SelectedImageOptions
        prompt?: string
        imageId?: string
        imageUrl?: string
        model?: string
        /** Artistic style preset the image was generated from */
        artisticStyleId?: string
        /**
         * True when the no-people QA gate still detected a person in the kept
         * image. Advisory: the phase succeeds either way, this flag exists so
         * the admin UI can surface the image for human review.
         */
        peopleDetected?: boolean
        /** True when the QA gate regenerated the image with reinforced negatives */
        qaRegenerated?: boolean
    }
    /** Overall pipeline metrics */
    metrics?: PipelineMetrics
    /** One-shot automatic retries after transient provider errors, keyed by phase */
    autoRetries?: Partial<Record<PipelinePhaseKey, PhaseAutoRetry>>
    /** Error message if pipeline failed */
    error?: string
}
