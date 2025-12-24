/**
 * @workspace/ai/pipelines
 *
 * AI pipelines for complex multi-step content generation.
 *
 * @module @workspace/ai/pipelines
 */

// Types
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

// Pipeline runner
export { runBlogContentPipeline } from './blog-content.pipeline'
