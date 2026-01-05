/**
 * Pipeline SSE Types
 *
 * Types for the blog content generation pipeline's Server-Sent Events.
 * Core pipeline types are imported from @workspace/ai.
 *
 * @module @/lib/types/blog/pipeline
 */

import type { FaqItem } from '@workspace/shared/schemas/blog'
import type { PipelineStep } from '@workspace/ai/agents'
import type { AgenticPipelineStep } from '@workspace/ai/pipelines'

/**
 * Unified pipeline step from the new agentic content pipeline
 */
export type UnifiedPipelineStep = AgenticPipelineStep

/**
 * Component-specific step states that extend the pipeline steps.
 * These are UI states not part of the core pipeline.
 */
export type DialogStep =
    | PipelineStep
    | UnifiedPipelineStep
    | 'idle'
    | 'saving'
    | 'error'

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
 * Review result event data (when a review agent completes)
 */
export type SSEReviewResultData = {
    type: 'review-result'
    agentName: string
    score: number
    summary: string
    issueCount: number
}

/**
 * Tool call event data (for agentic mode)
 */
export type SSEToolCallData = {
    type: 'tool-call'
    toolName: 'perplexity_search' | 'google_search'
    query: string
    toolCallIndex: number
}

/**
 * Union of all progress event data types
 */
export type SSEProgressData =
    | SSEResearchData
    | SSEReviewResultData
    | SSEToolCallData

/**
 * SSE progress event from the pipeline API
 */
export type SSEProgressEvent = {
    step: PipelineStep
    progress: number
    message: string
    data?: SSEProgressData
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
        faqs?: FaqItem[]
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
 * Source collected during agentic research
 */
export type AgenticSource = {
    title: string
    url: string
    type: 'perplexity' | 'google'
}

/**
 * Agentic pipeline metadata
 */
export type AgenticPipelineMetadata = {
    totalTimeMs: number
    toolCallCount: number
    contentGenTimeMs: number
    metadataTimeMs: number
}

/**
 * SSE completion event from the agentic pipeline API
 */
export type SSEAgenticCompleteEvent = {
    success: boolean
    error?: string
    content?: string
    wordCount?: number
    metaDescription?: string
    excerpt?: string
    suggestedTags?: string[]
    readingTimeMinutes?: number
    suggestedCategory?: string
    faqs?: FaqItem[]
    faqSchema?: object | null
    sources?: AgenticSource[]
    pipelineMetadata?: AgenticPipelineMetadata
}

/**
 * SSE completion event from the unified agentic pipeline API
 */
export type SSEUnifiedCompleteEvent = {
    success: boolean
    error?: string
    content?: string
    wordCount?: number
    metaDescription?: string
    excerpt?: string
    suggestedTags?: string[]
    readingTimeMinutes?: number
    suggestedCategory?: string
    faqs?: FaqItem[]
    faqSchema?: object | null
    sources?: AgenticSource[]
    reviews?: ReviewSummary[]
    orchestratorResult?: {
        revisedContent: string
        changesSummary: string
        changes: Array<{
            type: 'fix' | 'improvement' | 'addition' | 'removal'
            description: string
            before?: string
            after?: string
        }>
        overallScore: number
    } | null
    initialContent?: string
    initialWordCount?: number
    metrics?: {
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
 * Union of all SSE event types
 */
export type SSEEventData =
    | SSEProgressEvent
    | SSECompleteEvent
    | SSEAgenticCompleteEvent
    | SSEUnifiedCompleteEvent
    | SSEErrorEvent
