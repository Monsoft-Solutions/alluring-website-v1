/**
 * Pipeline Types
 *
 * Types for the blog content generation pipeline.
 *
 * @module @workspace/ai/pipelines/types
 */
import type { FaqItem } from '@workspace/shared/schemas/blog'

import type {
    AgentReview,
    OrchestratorResult,
    PipelineStep,
} from '../agents/types.agent'

/**
 * Blog idea input for the pipeline
 */
export type BlogIdeaInput = {
    title: string
    topic?: string
    primaryKeyword?: string
    secondaryKeywords?: string[]
    targetAudience?: string
    uniqueAngle?: string
    estimatedWordCount?: number
    contentType?: string
}

/**
 * Outline section for content generation
 */
export type OutlineSection = {
    id: string
    title: string
    description: string
    keyPoints?: string[]
    subsections?: Array<{
        title: string
        description?: string
    }>
}

/**
 * Blog outline input for the pipeline
 */
export type BlogOutlineInput = {
    tldr: string[]
    introduction: {
        hook: string
        preview: string
    }
    sections: OutlineSection[]
    conclusion: {
        summaryPoints: string[]
        nextSteps: string
    }
    seoNotes?: {
        internalLinks?: string[]
        externalSources?: string[]
        imageIdeas?: string[]
    }
}

/**
 * Research result from web search
 */
export type ResearchResult = {
    query: string
    findings: Array<{
        title: string
        url: string
        snippet: string
        relevanceScore: number
    }>
    summary?: string
}

/**
 * Content generation result
 */
export type ContentGenerationResult = {
    content: string
    wordCount: number
    metaDescription: string
    excerpt: string
    suggestedTags?: string[]
    faqs?: FaqItem[]
}

/**
 * Pipeline progress callback
 */
export type PipelineProgressCallback = (
    step: PipelineStep,
    progress: number,
    message: string,
    data?: unknown
) => void

/**
 * Pipeline options
 */
export type BlogContentPipelineOptions = {
    /** Blog idea input */
    idea: BlogIdeaInput
    /** Blog outline */
    outline: BlogOutlineInput
    /** Callback for progress updates */
    onProgress?: PipelineProgressCallback
    /** Whether to skip the research phase */
    skipResearch?: boolean
    /** Whether to skip the review phase */
    skipReview?: boolean
    /** Model ID for content generation */
    contentModelId?: string
    /** Model ID for review agents */
    reviewModelId?: string
}

/**
 * Full pipeline result
 */
export type BlogContentPipelineResult = {
    /** Whether the pipeline succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** Research findings (if research was performed) */
    research?: ResearchResult[]
    /** Initial generated content */
    initialContent: ContentGenerationResult
    /** Reviews from all agents */
    reviews: AgentReview[]
    /** Final result from orchestrator */
    orchestratorResult: OrchestratorResult
    /** Total processing time */
    totalProcessingTimeMs: number
    /** Breakdown of time per phase */
    timeBreakdown: {
        research: number
        contentGeneration: number
        review: number
        orchestration: number
    }
}
