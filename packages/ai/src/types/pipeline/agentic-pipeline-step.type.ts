/**
 * Pipeline step types for progress tracking
 *
 * @module @workspace/ai/types/pipeline/agentic-pipeline-step
 */

/**
 * Pipeline step types for progress tracking
 */
export type AgenticPipelineStep =
    | 'generation'
    | 'generation-tool-call'
    | 'review-internal-links'
    | 'review-external-links'
    | 'review-writing-quality'
    | 'review-ai-slop'
    | 'review-fact-source'
    | 'orchestration'
    | 'extraction'
    | 'complete'
    | 'error'
