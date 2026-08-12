import {
    boolean,
    foreignKey,
    index,
    integer,
    json,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import type { FaqItem } from '@workspace/shared/schemas/blog'

import type {
    PlanningData,
    PipelineState,
} from '../../types/blog-pipeline.type'
import { author } from './author.table'
import { images } from './image.table'

/**
 * Blog post status enum - represents the full pipeline lifecycle
 *
 * Pre-content stages (former "idea" stages):
 * - ideation: Initial idea, planning phase
 * - generate: Triggers content generation
 * - ai_review: Triggers review + orchestration
 * - generate_metadata: Triggers FAQ/meta extraction
 * - generate_image: Triggers featured image generation
 *
 * Post-content stages:
 * - draft: Human review/editing
 * - ready_to_publish: Approved, awaiting publication
 * - scheduled: Scheduled for future publish
 * - published: Live on site
 */
export const blogPostStatus = pgEnum('blog_post_status', [
    // Pre-content stages (former "idea" stages)
    'ideation',
    'generate',
    'ai_review',
    'generate_metadata',
    'generate_image',
    // Post-content stages
    'draft',
    'ready_to_publish',
    'scheduled',
    'published',
])

/**
 * Processing status for pipeline operations
 */
export const processingStatus = pgEnum('processing_status', [
    'idle',
    'processing',
    'error',
])

/**
 * Priority levels for Kanban ordering
 */
export const blogPostPriority = pgEnum('blog_post_priority', [
    'low',
    'medium',
    'high',
    'urgent',
])

/**
 * Idea approval state for the autopilot approval queue.
 *
 * Only meaningful while a post is in `ideation` status. Manual admin creates
 * are stamped `approved` (the admin chose the topic); autopilot-generated
 * ideas start `pending`. Rejected ideas stay in the DB (hidden from the
 * board) so ideation stops re-proposing them. Legacy NULL is treated as
 * approved.
 */
export const ideaApprovalStatus = pgEnum('idea_approval_status', [
    'pending',
    'approved',
    'rejected',
])

export const blogPost = pgTable(
    'blog_post',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        slug: varchar('slug', { length: 255 }).unique(),
        title: varchar('title', { length: 255 }).notNull(),
        metaDescription: text('meta_description'),
        metaTitle: varchar('meta_title', { length: 255 }),
        metaKeywords: text('meta_keywords'),
        primaryKeyword: varchar('primary_keyword', { length: 100 }),
        secondaryKeywords: json('secondary_keywords').$type<string[]>(),
        excerpt: text('excerpt'),
        publishedAt: timestamp('published_at'),
        scheduledAt: timestamp('scheduled_at'),
        readingTime: integer('reading_time'), // in minutes
        content: text('content'),
        aiSummary: text('ai_summary'), // AI-generated summary for image generation
        /**
         * 40–70 word answer to the post's head query, written to stand alone
         * when lifted out of context. Rendered above the article body inside
         * `.quick-answer`, which `Speakable` schema points at.
         *
         * Stored as a column rather than in the markdown body so it is
         * structurally guaranteed, editable as a discrete field, and unaffected
         * by the CTA content split. The writer must never emit its own
         * `<QuickAnswer>` block — see MDX_WRITER_COMPONENTS.
         */
        quickAnswer: text('quick_answer'),
        faqs: jsonb('faqs').$type<FaqItem[]>(), // Extracted FAQ items for FAQ Schema
        status: blogPostStatus('status').default('ideation'),
        views: integer('views').default(0).notNull(),
        likes: integer('likes').default(0).notNull(),
        shares: integer('shares').default(0).notNull(),
        isFeatured: boolean('is_featured').default(false).notNull(),
        allowComments: boolean('allow_comments').default(true).notNull(),
        authorId: uuid('author_id'),
        featuredImageId: uuid('featured_image_id'),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => new Date()),

        // Pipeline management
        priority: blogPostPriority('priority').default('medium'),
        ideaApproval: ideaApprovalStatus('idea_approval'),
        pipelineProcessingStatus:
            processingStatus('processing_status').default('idle'),
        processingError: text('processing_error'),
        processingStartedAt: timestamp('processing_started_at'),

        // Planning data (replaces blog_idea fields)
        planningData: jsonb('planning_data').$type<PlanningData>(),

        // Pipeline state (intermediate results, reviews, sources)
        pipelineState: jsonb('pipeline_state').$type<PipelineState>(),
    },
    (table) => [
        // Foreign Keys
        foreignKey({
            columns: [table.authorId],
            foreignColumns: [author.id],
            name: 'blog_post_author_id_fk',
        }).onDelete('set null'),
        foreignKey({
            columns: [table.featuredImageId],
            foreignColumns: [images.id],
            name: 'blog_post_featured_image_id_fk',
        }).onDelete('set null'),

        // Performance Indexes
        index('blog_post_status_idx').on(table.status),
        index('blog_post_author_id_idx').on(table.authorId),
        index('blog_post_created_at_idx').on(table.createdAt),
        index('blog_post_published_at_idx').on(table.publishedAt),
        index('blog_post_scheduled_at_idx').on(table.scheduledAt),
        index('blog_post_status_published_at_idx').on(
            table.status,
            table.publishedAt
        ),
        index('blog_post_is_featured_idx').on(table.isFeatured),
        index('blog_post_views_idx').on(table.views),
        index('blog_post_likes_idx').on(table.likes),
        // Pipeline indexes
        index('blog_post_priority_idx').on(table.priority),
        index('blog_post_processing_status_idx').on(
            table.pipelineProcessingStatus
        ),
        index('blog_post_status_priority_idx').on(table.status, table.priority),
        index('blog_post_status_idea_approval_idx').on(
            table.status,
            table.ideaApproval
        ),
    ]
)

export type BlogPost = typeof blogPost.$inferSelect
export type InsertBlogPost = typeof blogPost.$inferInsert
