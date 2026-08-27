/**
 * Options for the unified agentic content pipeline
 *
 * @module @workspace/ai/types/pipeline/agentic-content-pipeline-options
 */
import type { ReasoningEffort } from '../../models/reasoning-effort.constant'
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
    /** How hard the content model should think (default: none) */
    contentEffort?: ReasoningEffort
    /** Model ID for review agents (default: gpt-5.2) */
    reviewModelId?: string
    /** How hard the review agents should think (default: none) */
    reviewEffort?: ReasoningEffort
    /** Maximum tool call steps (default: 25) */
    maxSteps?: number
    /** Minimum acceptable quality score (default: 70) */
    minQualityScore?: number
}
