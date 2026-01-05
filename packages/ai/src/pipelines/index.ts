/**
 * @workspace/ai/pipelines
 *
 * AI pipelines for complex multi-step content generation.
 *
 * @module @workspace/ai/pipelines
 */

// Types (legacy)
export {
    type BlogIdeaInput,
    type OutlineSection,
    type BlogOutlineInput,
    type ResearchResult,
    type ContentGenerationResult,
    type PipelineProgressCallback,
    type BlogContentPipelineOptions,
    type BlogContentPipelineResult,
} from './types.pipeline'

// Unified Agentic Content Pipeline (recommended)
export {
    runAgenticContentPipeline,
    type AgenticContentPipelineOptions,
    type AgenticContentPipelineResult,
    type AgenticPipelineStep,
    type AgenticPipelineProgressCallback,
    type AgenticProgressData,
    type AgenticPipelineIdeaInput,
    type AgenticPipelineOutlineInput,
} from './agentic-content.pipeline'
