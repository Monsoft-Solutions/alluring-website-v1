/**
 * Outline section for content generation
 *
 * @module @workspace/ai/types/pipeline/outline-section
 */

/**
 * Outline section for content generation
 */
export type OutlineSection = {
    id: string
    title: string
    description: string
    keyPoints?: string[]
    subsections?: Array<{
        title: string
        description?: string
    }>
}
