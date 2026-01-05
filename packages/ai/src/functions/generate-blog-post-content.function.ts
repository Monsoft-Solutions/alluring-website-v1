/**
 * Generate Blog Post Content Function
 *
 * @deprecated Use `runAgenticContentPipeline` from `@workspace/ai/pipelines` instead.
 * This function will be removed in a future version.
 *
 * AI-powered blog post content generation from an idea and outline.
 * Creates full markdown content following brand guidelines.
 *
 * @module @workspace/ai/functions/generate-blog-post-content
 */
import { z } from 'zod'

import {
    GENERATE_POST_CONTENT_SYSTEM_PROMPT,
    getGeneratePostContentPrompt,
} from '../prompts/blog/generate-post-content.prompt'
import { coreGenerateObject } from '../core'

/**
 * Schema for the generated content response
 */
const generatePostContentResponseSchema = z.object({
    content: z
        .string()
        .min(500)
        .describe('Full markdown content of the blog post'),
    wordCount: z.number().describe('Approximate word count of the content'),
    metaDescription: z
        .string()
        .describe('SEO meta description (150-160 characters)'),
    excerpt: z
        .string()
        .max(300)
        .describe('Short excerpt for previews (2-3 sentences)'),
    suggestedTags: z
        .array(z.string())
        .optional()
        .describe('Suggested tags for the post'),
})

/**
 * Default model for content generation
 * Using a more capable model for longer content
 */
const DEFAULT_MODEL_ID = 'gpt-5.2'

/**
 * Outline section input type.
 * Simplified from the full OutlineSection in generate-blog-outline
 * since content generation only needs these fields.
 */
type OutlineSectionInput = {
    title: string
    description: string
    keyPoints?: string[]
    subsections?: Array<{ title: string; description?: string }>
}

/**
 * Options for content generation
 */
export type GenerateBlogPostContentOptions = {
    /** Blog post title */
    title: string
    /** Main topic */
    topic: string
    /** Primary keyword to target */
    primaryKeyword: string
    /** Secondary keywords */
    secondaryKeywords?: string[]
    /** Target audience description */
    targetAudience?: string
    /** What makes this post unique */
    uniqueAngle?: string
    /** Structured outline to follow */
    outline: {
        tldr: string[]
        introduction: { hook: string; preview: string }
        sections: OutlineSectionInput[]
        conclusion: {
            summaryPoints: string[]
            nextSteps: string
        }
    }
    /** Target word count */
    estimatedWordCount?: number
    /** Model ID to use */
    modelId?: string
    /** Temperature (lower = more consistent) */
    temperature?: number
}

/**
 * Full content response type
 */
export type GenerateBlogPostContentResult = z.infer<
    typeof generatePostContentResponseSchema
>

/**
 * Generate full blog post content using AI
 *
 * Creates complete markdown content from an idea and outline,
 * following brand guidelines and SEO best practices.
 *
 * @param options - Generation options including outline
 * @returns Full content with meta description and excerpt
 *
 * @example
 * ```typescript
 * const result = await generateBlogPostContent({
 *   title: 'BBL Recovery Guide: Week by Week',
 *   topic: 'Brazilian Butt Lift Recovery',
 *   primaryKeyword: 'bbl recovery',
 *   outline: {
 *     tldr: ['Recovery takes 6-8 weeks', 'Avoid sitting directly for 2 weeks'],
 *     introduction: { hook: '...', preview: '...' },
 *     sections: [...],
 *     conclusion: { summaryPoints: [...], nextSteps: '...' },
 *   },
 * })
 *
 * console.log(result.content) // Full markdown content
 * console.log(result.wordCount) // ~1500
 * console.log(result.metaDescription) // SEO meta description
 * ```
 */
export async function generateBlogPostContent(
    options: GenerateBlogPostContentOptions
): Promise<GenerateBlogPostContentResult> {
    const {
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        uniqueAngle,
        outline,
        estimatedWordCount = 1500,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.7,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: generatePostContentResponseSchema,
        system: GENERATE_POST_CONTENT_SYSTEM_PROMPT,
        prompt: getGeneratePostContentPrompt({
            title,
            topic,
            primaryKeyword,
            secondaryKeywords,
            targetAudience,
            uniqueAngle,
            outline,
            estimatedWordCount,
        }),
        temperature,
    })

    return result.object
}
