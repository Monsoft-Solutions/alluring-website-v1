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
    score: z.number().min(0).max(100),
    findings: z.array(z.string()),
    suggestions: z.array(z.string()),
})

/**
 * Content length category with additional metrics
 */
export const contentLengthCategorySchema = categoryScoreSchema.extend({
    wordCount: z.number().min(0),
})

/**
 * Readability category with additional metrics
 */
export const readabilityCategorySchema = categoryScoreSchema.extend({
    avgSentenceLength: z.number().min(0),
    avgParagraphLength: z.number().min(0),
})

/**
 * Heading structure category with additional metrics
 */
export const headingStructureCategorySchema = categoryScoreSchema.extend({
    h1Count: z.number().min(0),
    h2Count: z.number().min(0),
    h3Count: z.number().min(0),
})

/**
 * Keywords category with additional metrics
 */
export const keywordsCategorySchema = categoryScoreSchema.extend({
    density: z.number().min(0).max(100),
    keywordInFirst100Words: z.boolean(),
})

/**
 * Linking category with additional metrics
 */
export const linkingCategorySchema = categoryScoreSchema.extend({
    internalLinkCount: z.number().min(0),
    externalLinkCount: z.number().min(0),
})

/**
 * Visual content category with additional metrics
 */
export const visualContentCategorySchema = categoryScoreSchema.extend({
    imageCount: z.number().min(0),
    hasFeaturedImage: z.boolean(),
    imagesWithAlt: z.number().min(0),
})

/**
 * Structure category with additional metrics
 */
export const structureCategorySchema = categoryScoreSchema.extend({
    hasTLDR: z.boolean(),
    hasCTA: z.boolean(),
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
    overallScore: z.number().min(0).max(100),
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
    summary: z.string().min(50).max(500),
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
