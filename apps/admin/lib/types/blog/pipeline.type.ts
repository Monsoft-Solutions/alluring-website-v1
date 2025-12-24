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
 * Individual research finding from web search
 */
export type ResearchFinding = {
    title: string
    url: string
    snippet: string
    relevanceScore: number
}

/**
 * Research query event data (when a search is starting)
 */
export type SSEResearchQueryData = {
    type: 'research-query'
    query: string
    queryIndex: number
    totalQueries: number
}

/**
 * Research finding event data (when results come back)
 */
export type SSEResearchFindingData = {
    type: 'research-finding'
    query: string
    findings: ResearchFinding[]
    summary?: string
}

/**
 * Union of research data types
 */
export type SSEResearchData = SSEResearchQueryData | SSEResearchFindingData

/**
 * SSE progress event from the pipeline API
 */
export type SSEProgressEvent = {
    step: PipelineStep
    progress: number
    message: string
    data?: SSEResearchData
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
 * Research summary for the complete event
 */
export type ResearchSummary = {
    query: string
    findingsCount: number
    topSources: Array<{
        title: string
        url: string
    }>
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
    research?: ResearchSummary[]
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
