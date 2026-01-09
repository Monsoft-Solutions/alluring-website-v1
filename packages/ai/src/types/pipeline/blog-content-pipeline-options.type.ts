/**
 * Pipeline options
 *
 * @module @workspace/ai/types/pipeline/blog-content-pipeline-options
 */
import type { BlogIdeaInput } from './blog-idea-input.type'
import type { BlogOutlineInput } from './blog-outline-input.type'
import type { PipelineProgressCallback } from './pipeline-progress-callback.type'

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
