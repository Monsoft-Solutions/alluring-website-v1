/**
 * Blog idea input for the pipeline
 *
 * @module @workspace/ai/types/pipeline/blog-idea-input
 */

/**
 * Blog idea input for the pipeline
 */
export type BlogIdeaInput = {
    title: string
    topic?: string
    primaryKeyword?: string
    secondaryKeywords?: string[]
    targetAudience?: string
    uniqueAngle?: string
    estimatedWordCount?: number
    contentType?: string
}
