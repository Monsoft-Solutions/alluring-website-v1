/**
 * Blog Post Analysis Table
 *
 * Stores AI-powered quality analysis results for blog posts.
 * Evaluates SEO optimization, readability, content structure, and provides
 * actionable suggestions for improvement.
 *
 * @module packages/db/src/schema/blog/blog-post-analysis.table
 */
import {
    foreignKey,
    index,
    integer,
    jsonb,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import { blogPost } from './blog-post.table'

/**
 * Detailed analysis data structure (JSONB)
 * Contains category-specific details and suggestions
 */
export type BlogPostAnalysisDetails = {
    categories: {
        title: {
            score: number
            findings: string[]
            suggestions: string[]
        }
        metaDescription: {
            score: number
            findings: string[]
            suggestions: string[]
        }
        contentLength: {
            score: number
            wordCount: number
            findings: string[]
            suggestions: string[]
        }
        readability: {
            score: number
            avgSentenceLength: number
            avgParagraphLength: number
            findings: string[]
            suggestions: string[]
        }
        headingStructure: {
            score: number
            h1Count: number
            h2Count: number
            h3Count: number
            findings: string[]
            suggestions: string[]
        }
        keywords: {
            score: number
            density: number
            keywordInFirst100Words: boolean
            findings: string[]
            suggestions: string[]
        }
        linking: {
            score: number
            internalLinkCount: number
            externalLinkCount: number
            findings: string[]
            suggestions: string[]
        }
        visualContent: {
            score: number
            imageCount: number
            hasFeaturedImage: boolean
            imagesWithAlt: number
            findings: string[]
            suggestions: string[]
        }
        structure: {
            score: number
            hasTLDR: boolean
            hasCTA: boolean
            findings: string[]
            suggestions: string[]
        }
    }
    topSuggestions: Array<{
        priority: 'high' | 'medium' | 'low'
        category: string
        suggestion: string
    }>
    summary: string
}

/**
 * Blog Post Analysis table - stores quality analysis results
 */
export const blogPostAnalysis = pgTable(
    'blog_post_analysis',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * Reference to the analyzed blog post
         */
        blogPostId: uuid('blog_post_id').notNull(),

        /**
         * Overall quality score (0-100)
         */
        overallScore: integer('overall_score').notNull(),

        /**
         * Letter grade based on overall score
         * A: 90+, B: 75-89, C: 60-74, D: 40-59, F: <40
         */
        grade: varchar('grade', { length: 2 }).notNull(),

        /**
         * Individual category scores (0-100)
         */
        titleScore: integer('title_score').notNull(),
        metaDescriptionScore: integer('meta_description_score').notNull(),
        contentLengthScore: integer('content_length_score').notNull(),
        readabilityScore: integer('readability_score').notNull(),
        headingStructureScore: integer('heading_structure_score').notNull(),
        keywordScore: integer('keyword_score').notNull(),
        linkingScore: integer('linking_score').notNull(),
        visualContentScore: integer('visual_content_score').notNull(),
        structureScore: integer('structure_score').notNull(),

        /**
         * Detailed analysis data (JSONB)
         * Contains findings, suggestions, and metrics for each category
         */
        analysisDetails: jsonb('analysis_details')
            .$type<BlogPostAnalysisDetails>()
            .notNull(),

        /**
         * AI model used for analysis
         */
        modelUsed: varchar('model_used', { length: 50 }),

        /**
         * Timestamps
         */
        analyzedAt: timestamp('analyzed_at').notNull().defaultNow(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        // Foreign Key
        foreignKey({
            columns: [table.blogPostId],
            foreignColumns: [blogPost.id],
            name: 'blog_post_analysis_blog_post_id_fk',
        }).onDelete('cascade'),

        // Performance Indexes
        index('blog_post_analysis_blog_post_id_idx').on(table.blogPostId),
        index('blog_post_analysis_overall_score_idx').on(table.overallScore),
        index('blog_post_analysis_grade_idx').on(table.grade),
        index('blog_post_analysis_analyzed_at_idx').on(table.analyzedAt),
    ]
)

export type BlogPostAnalysis = typeof blogPostAnalysis.$inferSelect
export type InsertBlogPostAnalysis = typeof blogPostAnalysis.$inferInsert
