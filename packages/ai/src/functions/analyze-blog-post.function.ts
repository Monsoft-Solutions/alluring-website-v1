/**
 * Analyze Blog Post Function
 *
 * AI-powered comprehensive quality analysis for blog posts.
 * Evaluates SEO optimization, readability, content structure, and provides
 * actionable suggestions for improvement.
 *
 * @module @workspace/ai/functions/analyze-blog-post
 */
import {
    blogPostAnalysisResultSchema,
    type AnalyzeBlogPostInput,
    type BlogPostAnalysisResult,
} from '@workspace/shared/schemas/blog'

import {
    BLOG_ANALYSIS_SYSTEM_PROMPT,
    getBlogAnalysisPrompt,
} from '../prompts/blog/blog-analysis.prompt'
import { coreGenerateObject } from '../core'

/**
 * Default model for blog post analysis
 * Uses Claude Opus 4.5 for comprehensive analysis requiring nuanced evaluation
 */
const DEFAULT_MODEL_ID = 'claude-opus-5'

/**
 * Options for blog post analysis
 */
export type AnalyzeBlogPostOptions = AnalyzeBlogPostInput & {
    /** Model ID to use (defaults to gpt-4o) */
    modelId?: string
    /** Temperature for generation (defaults to 0.3 for consistency) */
    temperature?: number
}

/**
 * Analyze a blog post for quality and SEO optimization
 *
 * Evaluates blog posts across 9 key categories:
 * - Title optimization (50-60 chars, keyword placement)
 * - Meta description (150-160 chars, keyword inclusion)
 * - Content length (appropriate word count)
 * - Readability (sentence/paragraph structure, active voice)
 * - Heading structure (H1/H2/H3 hierarchy)
 * - Keyword optimization (density 0.5-2%, natural integration)
 * - Linking strategy (internal/external links)
 * - Visual content (images, alt text)
 * - Content structure (TL;DR, CTA, scannable format)
 *
 * Returns detailed scoring (0-100) for each category, overall grade (A-F),
 * specific findings, and prioritized actionable suggestions.
 *
 * @param options - Analysis options including post content and metadata
 * @returns Comprehensive analysis with scores and improvement suggestions
 *
 * @example
 * ```typescript
 * const analysis = await analyzeBlogPost({
 *   title: 'Brazilian Butt Lift Recovery: Week by Week Guide',
 *   content: '<p>Recovery from BBL surgery...</p>',
 *   metaDescription: 'Complete BBL recovery timeline...',
 *   hasFeaturedImage: true,
 * })
 *
 * console.log(analysis.overallScore) // 85
 * console.log(analysis.grade) // 'B'
 * console.log(analysis.topSuggestions)
 * // [
 * //   {
 * //     priority: 'high',
 * //     category: 'keywords',
 * //     suggestion: 'Add primary keyword "BBL recovery" to first paragraph'
 * //   },
 * //   ...
 * // ]
 * ```
 */
export async function analyzeBlogPost(
    options: AnalyzeBlogPostOptions
): Promise<BlogPostAnalysisResult & { modelId: string }> {
    const {
        title,
        content,
        metaDescription,
        metaKeywords,
        excerpt,
        hasFeaturedImage,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.3,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: blogPostAnalysisResultSchema,
        system: BLOG_ANALYSIS_SYSTEM_PROMPT,
        prompt: getBlogAnalysisPrompt({
            title,
            content,
            metaDescription,
            metaKeywords,
            excerpt,
            hasFeaturedImage,
        }),
        temperature,
    })

    return {
        ...result.object,
        modelId,
    }
}
