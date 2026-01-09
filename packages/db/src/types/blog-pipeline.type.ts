/**
 * Blog Pipeline Types
 *
 * Types for the unified blog content pipeline.
 * Used in the blog_post table for planning data and pipeline state.
 *
 * @module @workspace/db/types/blog-pipeline
 */

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
 * Selected image options for featured image generation
 */
export type SelectedImageOptions = {
    scene: string
    subject: string
    style: string
    lighting: string
    colorPalette: string
    composition: string
    modelProfile?: {
        age?: string
        ethnicity?: string
        bodyType?: string
        hairColor?: string
        hairLength?: string
        hairStyle?: string
        skinTone?: string
        expression?: string
        pose?: string
        attire?: string
    }
    reasoning?: string
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
    }
    /** Overall pipeline metrics */
    metrics?: PipelineMetrics
    /** Error message if pipeline failed */
    error?: string
}
