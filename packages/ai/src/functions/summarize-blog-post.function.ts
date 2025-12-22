/**
 * Summarize Blog Post Function
 *
 * AI-powered blog post summarization focused on content extraction.
 * Captures topic, key message, and audience context for downstream processing.
 *
 * @module @workspace/ai/functions/summarize-blog-post
 */
import { z } from 'zod'

import {
    BLOG_SUMMARY_SYSTEM_PROMPT,
    getBlogSummaryPrompt,
} from '../prompts/blog/blog-summary.prompt'
import { coreGenerateObject } from '../core'

/**
 * Schema for blog post summary output
 */
const blogSummarySchema = z.object({
    summary: z
        .string()
        .min(50)
        .max(1000)
        .describe(
            'A  content summary capturing the main topic, key message, target audience, and relevant medical/cosmetic context'
        ),
})

/**
 * Default model for text generation
 * Uses a cost-effective model since this is text-only
 */
const DEFAULT_MODEL_ID = 'gpt-4.1'

/**
 * Options for blog post summarization
 */
export type SummarizeBlogPostOptions = {
    /** Blog post title */
    title: string
    /** Blog post content (HTML or plain text) */
    content: string
    /** Model ID to use (defaults to gpt-4o-mini) */
    modelId?: string
    /** Temperature for generation (defaults to 0.5 for consistency) */
    temperature?: number
}

/**
 * Result of blog post summarization
 */
export type BlogPostSummary = z.infer<typeof blogSummarySchema>

/**
 * Generate a content summary of a blog post
 *
 * Creates a concise 2-3 sentence summary that captures the main topic,
 * key message, target audience, and relevant context. Does NOT include
 * visual descriptions - those are handled by the image prompt generator.
 *
 * @param options - Summarization options including title and content
 * @returns Content summary suitable for downstream processing
 *
 * @example
 * ```typescript
 * const summary = await summarizeBlogPost({
 *   title: 'Brazilian Butt Lift Recovery Tips',
 *   content: '<p>Recovery from BBL surgery requires...</p>',
 * })
 * console.log(summary.summary)
 * // 'A week-by-week recovery guide for BBL patients covering healing milestones, pain management, and return-to-activity timelines...'
 * ```
 */
export async function summarizeBlogPost(
    options: SummarizeBlogPostOptions
): Promise<BlogPostSummary> {
    const {
        title,
        content,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.5,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: blogSummarySchema,
        system: BLOG_SUMMARY_SYSTEM_PROMPT,
        prompt: getBlogSummaryPrompt(title, content),
        temperature,
    })

    return result.object
}
