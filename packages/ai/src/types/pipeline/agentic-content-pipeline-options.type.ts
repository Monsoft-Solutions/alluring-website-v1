/**
 * Options for the unified agentic content pipeline
 *
 * @module @workspace/ai/types/pipeline/agentic-content-pipeline-options
 */
import type { AgenticPipelineIdeaInput } from './agentic-pipeline-idea-input.type'
import type { AgenticPipelineProgressCallback } from './agentic-pipeline-progress-callback.type'

/**
 * Options for the unified agentic content pipeline
 */
export type AgenticContentPipelineOptions = {
    /** Blog idea input */
    idea: AgenticPipelineIdeaInput
    /** Blog outline */
    outline?: string
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
    /** Maximum tool call steps (default: 25) */
    maxSteps?: number
    /** Minimum acceptable quality score (default: 70) */
    minQualityScore?: number
}
