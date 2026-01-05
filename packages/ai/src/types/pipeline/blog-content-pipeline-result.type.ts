/**
 * Full pipeline result
 *
 * @module @workspace/ai/types/pipeline/blog-content-pipeline-result
 */
import type { ResearchResult } from './research-result.type'
import type { ContentGenerationResult } from './content-generation-result.type'
import type { AgentReview, OrchestratorResult } from '../../agents/types.agent'

/**
 * Full pipeline result
 */
export type BlogContentPipelineResult = {
    /** Whether the pipeline succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** Research findings (if research was performed) */
    research?: ResearchResult[]
    /** Initial generated content */
    initialContent: ContentGenerationResult
    /** Reviews from all agents */
    reviews: AgentReview[]
    /** Final result from orchestrator */
    orchestratorResult: OrchestratorResult
    /** Total processing time */
    totalProcessingTimeMs: number
    /** Breakdown of time per phase */
    timeBreakdown: {
        research: number
        contentGeneration: number
        review: number
        orchestration: number
    }
}
