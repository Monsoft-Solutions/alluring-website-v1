/**
 * Blog Pipeline Types
 *
 * Types for the unified blog content pipeline.
 * Used in the blog_post table for planning data and pipeline state.
 *
 * @module @workspace/db/types/blog-pipeline
 */

import type { SelectedImageOptions } from '@workspace/shared/schemas/blog'

import type { RefreshBrief } from './content-refresh.type'

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
    /**
     * Present ⇒ this post is a hidden refresh working copy (epic #144).
     * Carries the data-driven brief the writer runs in refresh mode with.
     */
    refresh?: {
        /** The live post this working copy will be merged back onto. */
        originalPostId: string
        brief: RefreshBrief
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
 * A hazard the MDX validator had to strip from generated content.
 *
 * Mirrors `MdxSanitizationAction` in
 * `packages/ai/src/functions/validate-generated-mdx.function.ts` — kept
 * structurally rather than imported so `@workspace/db` does not depend on
 * `@workspace/ai`.
 */
export type MdxSanitizationAction = {
    kind:
        | 'unknown-component'
        | 'renderer-owned-component'
        | 'unbalanced-component'
        | 'stray-html-comment'
        | 'duplicate-cta-marker'
        | 'invalid-cta-id'
        | 'stray-expression'
        // Not an MDX hazard — a link to one of our own pages that does not
        // exist. Recorded alongside the rest so the admin card shows every
        // change made to the generated body in one place.
        | 'broken-internal-link'
    detail: string
}

/**
 * Result from the orchestrator
 */
export type OrchestratorResult = {
    revisedContent: string
    agentReviews: AgentReview[]
    processingTimeMs: number
    sanitizationActions?: MdxSanitizationAction[]
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
        /** Model the phase ran on (resolved after defaults) */
        model?: string
        /** OTEL/Langfuse trace id of the phase run */
        traceId?: string
        /**
         * MDX hazards the validator stripped before persisting. Present and
         * non-empty means the writer produced something unrenderable — the post
         * still shipped, but the prompt needs looking at.
         */
        sanitizationActions?: MdxSanitizationAction[]
    }
    /** Review phase results */
    reviewPhase?: {
        startedAt: string
        completedAt?: string
        reviews?: AgentReview[]
        /** Model the review agents ran on (resolved after defaults) */
        model?: string
        /** OTEL/Langfuse trace id covering review + orchestration */
        traceId?: string
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
        /** Model the phase ran on (resolved after defaults) */
        model?: string
        /** OTEL/Langfuse trace id of the phase run */
        traceId?: string
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
        /** OTEL/Langfuse trace id of the phase run */
        traceId?: string
    }
    /** Overall pipeline metrics */
    metrics?: PipelineMetrics
    /** One-shot automatic retries after transient provider errors, keyed by phase */
    autoRetries?: Partial<Record<PipelinePhaseKey, PhaseAutoRetry>>
    /** Error message if pipeline failed */
    error?: string
}
