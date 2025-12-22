import {
    foreignKey,
    index,
    integer,
    json,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import { author } from './author.table'
import { blogPost } from './blog-post.table'

/**
 * Enum for blog idea pipeline stages
 */
export const blogIdeaStage = pgEnum('blog_idea_stage', [
    'backlog',
    'researching',
    'approved',
    'in_progress',
    'published',
])

/**
 * Enum for blog idea priority levels
 */
export const blogIdeaPriority = pgEnum('blog_idea_priority', [
    'low',
    'medium',
    'high',
    'urgent',
])

/**
 * Enum for blog content types
 */
export const blogContentType = pgEnum('blog_content_type', [
    'tutorial',
    'guide',
    'how_to',
    'case_study',
    'comparison',
    'faq',
    'listicle',
    'announcement',
    'thought_leadership',
])

/**
 * Outline section type for structured blog outlines
 */
export type BlogIdeaOutlineSection = {
    id: string
    title: string
    description?: string
    subsections?: BlogIdeaOutlineSection[]
}

/**
 * Blog Idea table - Stores structured idea data for the ideation pipeline
 * Each idea can be tracked from initial concept to published blog post
 */
export const blogIdea = pgTable(
    'blog_idea',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // Core content
        title: varchar('title', { length: 255 }).notNull(),
        topic: text('topic'),
        uniqueAngle: text('unique_angle'),

        // SEO targeting
        primaryKeyword: varchar('primary_keyword', { length: 100 }),
        secondaryKeywords: json('secondary_keywords').$type<string[]>(),

        // Audience & context
        targetAudience: text('target_audience'),
        painPoints: json('pain_points').$type<string[]>(),

        // Content planning
        contentType: blogContentType('content_type'),
        estimatedWordCount: integer('estimated_word_count'),
        outline: json('outline').$type<BlogIdeaOutlineSection[]>(),

        // Research & references
        researchNotes: text('research_notes'),
        competitorUrls: json('competitor_urls').$type<string[]>(),

        // Pipeline management
        stage: blogIdeaStage('stage').default('backlog').notNull(),
        priority: blogIdeaPriority('priority').default('medium').notNull(),

        // AI-generated insights
        aiGeneratedScore: integer('ai_generated_score'), // SEO opportunity score 0-100
        aiSuggestions: text('ai_suggestions'), // AI-generated recommendations

        // Relationships
        assignedAuthorId: uuid('assigned_author_id'),
        blogPostId: uuid('blog_post_id'), // Links to created blog post

        // Timestamps
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        // Foreign Keys
        foreignKey({
            columns: [table.assignedAuthorId],
            foreignColumns: [author.id],
            name: 'blog_idea_assigned_author_id_fk',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.blogPostId],
            foreignColumns: [blogPost.id],
            name: 'blog_idea_blog_post_id_fk',
        }).onDelete('set null'),

        // Performance Indexes
        index('blog_idea_stage_idx').on(table.stage),
        index('blog_idea_priority_idx').on(table.priority),
        index('blog_idea_content_type_idx').on(table.contentType),
        index('blog_idea_assigned_author_id_idx').on(table.assignedAuthorId),
        index('blog_idea_blog_post_id_idx').on(table.blogPostId),
        index('blog_idea_created_at_idx').on(table.createdAt),
        index('blog_idea_stage_priority_idx').on(table.stage, table.priority),
    ]
)

export type BlogIdea = typeof blogIdea.$inferSelect
export type InsertBlogIdea = typeof blogIdea.$inferInsert
