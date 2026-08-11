/**
 * @workspace/ai/pipelines
 *
 * AI pipelines for complex multi-step content generation.
 *
 * @module @workspace/ai/pipelines
 */

// Types (legacy)
export type { BlogIdeaInput } from '../types/pipeline/blog-idea-input.type'
export type { OutlineSection } from '../types/pipeline/outline-section.type'
export type { BlogOutlineInput } from '../types/pipeline/blog-outline-input.type'
export type { ResearchResult } from '../types/pipeline/research-result.type'
export type { ContentGenerationResult } from '../types/pipeline/content-generation-result.type'
export type { PipelineProgressCallback } from '../types/pipeline/pipeline-progress-callback.type'
export type { BlogContentPipelineOptions } from '../types/pipeline/blog-content-pipeline-options.type'
export type { BlogContentPipelineResult } from '../types/pipeline/blog-content-pipeline-result.type'

// Unified Agentic Content Pipeline (recommended)
export { runAgenticContentPipeline } from './agentic-content.pipeline'
export type { AgenticContentPipelineOptions } from '../types/pipeline/agentic-content-pipeline-options.type'
export type { AgenticContentPipelineResult } from '../types/pipeline/agentic-content-pipeline-result.type'
export type { AgenticPipelineStep } from '../types/pipeline/agentic-pipeline-step.type'
export type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'
export type { AgenticProgressData } from '../types/pipeline/agentic-progress-data.type'
export type { AgenticPipelineIdeaInput } from '../types/pipeline/agentic-pipeline-idea-input.type'

// Standalone Phase Runners (for stage-based processing)
export {
    runGenerationPhase,
    type GenerationPhaseInput,
    type GenerationPhaseOutline,
    type GenerationPhaseOptions,
    type GenerationPhaseResult,
} from './generation-phase.runner'

export {
    runReviewPhase,
    type ReviewPhaseOptions,
    type ReviewPhaseResult,
} from './review-phase.runner'

export {
    runExtractionPhase,
    type ExtractionPhaseOptions,
    type ExtractionPhaseResult,
} from './extraction-phase.runner'

export {
    runImageGenerationPhase,
    buildImageDescriptor,
    type ImageGenerationPhaseOptions,
    type ImageGenerationPhaseResult,
    type ImageGenerationPhaseImage,
    type ImageGenerationAdapter,
} from './image-generation-phase.runner'

// No-people QA gate for artistic image presets
export {
    runNoPeopleQaGate,
    type NoPeopleQaGateOptions,
    type NoPeopleQaGateResult,
    type QaGateImage,
} from './no-people-image-qa.gate'

// Auto Inline Image Pipeline
export {
    runAutoInlineImagePipeline,
    type AutoInlineImagePipelineOptions,
    type AutoInlineImageProgressCallback,
    type AutoInlineImagePipelineStep,
    type AutoInlineImageProgressData,
} from './auto-inline-image.pipeline'
