/**
 * Pipeline SSE Types
 *
 * Types for the blog content generation pipeline's Server-Sent Events.
 * Core pipeline types are imported from @workspace/ai/agents.
 *
 * @module @/lib/types/blog/pipeline
 */

import type { PipelineStep } from '@workspace/ai/agents'

/**
 * Component-specific step states that extend the pipeline steps.
 * These are UI states not part of the core pipeline.
 */
export type DialogStep = PipelineStep | 'idle' | 'saving' | 'error'

/**
 * SSE progress event from the pipeline API
 */
export type SSEProgressEvent = {
    step: PipelineStep
    progress: number
    message: string
}

/**
 * Review summary from an agent (subset of AgentReview for SSE)
 */
export type ReviewSummary = {
    agentName: string
    score: number
    summary: string
    issueCount: number
}

/**
 * SSE completion event from the pipeline API
 */
export type SSECompleteEvent = {
    success: boolean
    error?: string
    initialContent?: {
        content: string
        wordCount: number
        metaDescription: string
        excerpt: string
    }
    reviews?: ReviewSummary[]
    finalContent?: string
    changesSummary?: string
    overallScore?: number
    totalProcessingTimeMs?: number
    timeBreakdown?: {
        research: number
        contentGeneration: number
        review: number
        orchestration: number
    }
}

/**
 * SSE error event from the pipeline API
 */
export type SSEErrorEvent = {
    error: string
}

/**
 * Union of all SSE event types
 */
export type SSEEventData = SSEProgressEvent | SSECompleteEvent | SSEErrorEvent
