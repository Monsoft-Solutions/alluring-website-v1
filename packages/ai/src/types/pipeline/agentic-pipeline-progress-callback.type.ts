/**
 * Progress callback for streaming updates
 *
 * @module @workspace/ai/types/pipeline/agentic-pipeline-progress-callback
 */
import type { AgenticPipelineStep } from './agentic-pipeline-step.type'
import type { AgenticProgressData } from './agentic-progress-data.type'

/**
 * Progress callback for streaming updates
 */
export type AgenticPipelineProgressCallback = (
    step: AgenticPipelineStep,
    progress: number,
    message: string,
    data?: AgenticProgressData
) => void
