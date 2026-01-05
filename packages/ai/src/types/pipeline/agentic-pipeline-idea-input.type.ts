/**
 * Blog idea input for the pipeline
 *
 * @module @workspace/ai/types/pipeline/agentic-pipeline-idea-input
 */
import type { ContentType } from '../../prompts/blog/agentic-writer.prompt'

/**
 * Blog idea input for the pipeline
 */
export type AgenticPipelineIdeaInput = {
    title: string
    topic?: string
    primaryKeyword?: string
    secondaryKeywords?: string[]
    targetAudience?: string
    uniqueAngle?: string
    estimatedWordCount?: number
    /** Content type for structure guidance */
    contentType?: ContentType
}
