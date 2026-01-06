/**
 * Blog Post Analysis Schemas
 *
 * Zod schemas and types for AI-powered blog post quality analysis.
 * Used across packages for type safety and validation.
 *
 * @module @workspace/shared/schemas/blog/blog-post-analysis
 */
import { z } from 'zod'

/**
 * Schema for a single category score with details
 */
export const categoryScoreSchema = z.object({
    score: z.number().describe('Score from 0 to 100'),
    findings: z.array(z.string()),
    suggestions: z.array(z.string()),
})

/**
 * Content length category with additional metrics
 * All metrics are optional - include only if determinable from content
 */
export const contentLengthCategorySchema = categoryScoreSchema.extend({
    wordCount: z.number().optional().describe('Word count (non-negative)'),
})

/**
 * Readability category with additional metrics
 * All metrics are optional - include only if determinable from content
 */
export const readabilityCategorySchema = categoryScoreSchema.extend({
    avgSentenceLength: z
        .number()
        .optional()
        .describe('Average sentence length (non-negative)'),
    avgParagraphLength: z
        .number()
        .optional()
        .describe('Average paragraph length (non-negative)'),
})

/**
 * Heading structure category with additional metrics
 * All metrics are optional - include only if determinable from content
 */
export const headingStructureCategorySchema = categoryScoreSchema.extend({
    h1Count: z.number().optional().describe('H1 heading count (non-negative)'),
    h2Count: z.number().optional().describe('H2 heading count (non-negative)'),
    h3Count: z.number().optional().describe('H3 heading count (non-negative)'),
})

/**
 * Keywords category with additional metrics
 * All metrics are optional - include only if determinable from content
 */
export const keywordsCategorySchema = categoryScoreSchema.extend({
    density: z.number().optional().describe('Keyword density from 0 to 100'),
    keywordInFirst100Words: z.boolean().optional(),
})

/**
 * Linking category with additional metrics
 * All metrics are optional - include only if determinable from content
 */
export const linkingCategorySchema = categoryScoreSchema.extend({
    internalLinkCount: z
        .number()
        .optional()
        .describe('Internal link count (non-negative)'),
    externalLinkCount: z
        .number()
        .optional()
        .describe('External link count (non-negative)'),
})

/**
 * Visual content category with additional metrics
 * All metrics are optional - include only if determinable from content
 */
export const visualContentCategorySchema = categoryScoreSchema.extend({
    imageCount: z.number().optional().describe('Image count (non-negative)'),
    hasFeaturedImage: z.boolean().optional(),
    imagesWithAlt: z
        .number()
        .optional()
        .describe('Images with alt text (non-negative)'),
})

/**
 * Structure category with additional metrics
 * All metrics are optional - include only if determinable from content
 */
export const structureCategorySchema = categoryScoreSchema.extend({
    hasTLDR: z.boolean().optional(),
    hasCTA: z.boolean().optional(),
})

/**
 * Suggestion priority levels
 */
export const suggestionPrioritySchema = z.enum(['high', 'medium', 'low'])

/**
 * Individual suggestion with priority and context
 */
export const suggestionSchema = z.object({
    priority: suggestionPrioritySchema,
    category: z.string(),
    suggestion: z.string(),
})

/**
 * Complete blog post analysis result
 */
export const blogPostAnalysisResultSchema = z.object({
    overallScore: z.number().describe('Overall score from 0 to 100'),
    grade: z.enum(['A', 'B', 'C', 'D', 'F']),
    categories: z.object({
        title: categoryScoreSchema,
        metaDescription: categoryScoreSchema,
        contentLength: contentLengthCategorySchema,
        readability: readabilityCategorySchema,
        headingStructure: headingStructureCategorySchema,
        keywords: keywordsCategorySchema,
        linking: linkingCategorySchema,
        visualContent: visualContentCategorySchema,
        structure: structureCategorySchema,
    }),
    topSuggestions: z.array(suggestionSchema),
    summary: z.string().describe('Summary (50-1000 characters)'),
})

/**
 * Input for blog post analysis
 */
export const analyzeBlogPostInputSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    excerpt: z.string().optional(),
    hasFeaturedImage: z.boolean().default(false),
})

// Type exports
export type CategoryScore = z.infer<typeof categoryScoreSchema>
export type ContentLengthCategory = z.infer<typeof contentLengthCategorySchema>
export type ReadabilityCategory = z.infer<typeof readabilityCategorySchema>
export type HeadingStructureCategory = z.infer<
    typeof headingStructureCategorySchema
>
export type KeywordsCategory = z.infer<typeof keywordsCategorySchema>
export type LinkingCategory = z.infer<typeof linkingCategorySchema>
export type VisualContentCategory = z.infer<typeof visualContentCategorySchema>
export type StructureCategory = z.infer<typeof structureCategorySchema>
export type SuggestionPriority = z.infer<typeof suggestionPrioritySchema>
export type Suggestion = z.infer<typeof suggestionSchema>
export type BlogPostAnalysisResult = z.infer<
    typeof blogPostAnalysisResultSchema
>
export type AnalyzeBlogPostInput = z.infer<typeof analyzeBlogPostInputSchema>
