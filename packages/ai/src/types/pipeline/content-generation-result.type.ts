/**
 * Content generation result
 *
 * @module @workspace/ai/types/pipeline/content-generation-result
 */
import type { FaqItem } from '@workspace/shared/schemas/blog'

/**
 * Content generation result
 */
export type ContentGenerationResult = {
    content: string
    wordCount: number
    metaDescription: string
    excerpt: string
    suggestedTags?: string[]
    faqs?: FaqItem[]
}
