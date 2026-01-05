/**
 * Pipeline progress callback
 *
 * @module @workspace/ai/types/pipeline/pipeline-progress-callback
 */
import type { PipelineStep } from '../../agents/types.agent'

/**
 * Pipeline progress callback
 */
export type PipelineProgressCallback = (
    step: PipelineStep,
    progress: number,
    message: string,
    data?: unknown
) => void
