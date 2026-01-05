/**
 * Blog outline input for the pipeline
 *
 * @module @workspace/ai/types/pipeline/agentic-pipeline-outline-input
 */
import type { OutlineSectionInput } from './outline-section-input.type'

/**
 * Blog outline input for the pipeline
 */
export type AgenticPipelineOutlineInput = {
    tldr: string[]
    introduction: {
        hook: string
        preview: string
    }
    sections: OutlineSectionInput[]
    conclusion: {
        summaryPoints: string[]
        nextSteps: string
    }
}
