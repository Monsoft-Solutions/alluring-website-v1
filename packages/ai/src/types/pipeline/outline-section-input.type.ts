/**
 * Outline section input type
 *
 * @module @workspace/ai/types/pipeline/outline-section-input
 */

/**
 * Outline section input type
 */
export type OutlineSectionInput = {
    title: string
    description: string
    keyPoints?: string[]
    subsections?: Array<{ title: string; description?: string }>
}
