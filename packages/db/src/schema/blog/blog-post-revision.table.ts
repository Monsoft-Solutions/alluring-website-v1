/**
 * Blog Post Revision Table
 *
 * Point-in-time snapshot of a post's reader-facing fields, written before a
 * refresh is applied (and before a rollback restores one) — the undo log for
 * in-place updates (epic #144). Only the fields the refresh merge is allowed
 * to touch are captured; `slug`, `publishedAt` and `status` are deliberately
 * absent because the merge must never change them.
 *
 * @module packages/db/src/schema/blog/blog-post-revision.table
 */
import {
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import type { FaqItem } from '@workspace/shared/schemas/blog'

import { blogPost } from './blog-post.table'

export const blogPostRevision = pgTable(
    'blog_post_revision',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        blogPostId: uuid('blog_post_id')
            .notNull()
            .references(() => blogPost.id, { onDelete: 'cascade' }),

        /** Why the snapshot was taken. */
        reason: varchar('reason', { length: 40 }).notNull(),

        title: varchar('title', { length: 255 }).notNull(),
        content: text('content').notNull(),
        metaTitle: varchar('meta_title', { length: 255 }),
        metaDescription: text('meta_description'),
        metaKeywords: text('meta_keywords'),
        excerpt: text('excerpt'),
        faqs: jsonb('faqs').$type<FaqItem[]>(),
        quickAnswer: text('quick_answer'),
        aiSummary: text('ai_summary'),
        readingTime: integer('reading_time'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('blog_post_revision_post_created_idx').on(
            table.blogPostId,
            table.createdAt
        ),
    ]
)

export type BlogPostRevision = typeof blogPostRevision.$inferSelect
export type InsertBlogPostRevision = typeof blogPostRevision.$inferInsert
