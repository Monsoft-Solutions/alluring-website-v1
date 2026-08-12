/**
 * GSC Query/Page Daily Snapshot Table
 *
 * One row per (date, query, page) from Search Console's searchanalytics API —
 * our own copy of the data GSC deletes after 16 months. Pulled daily by the
 * `gsc-snapshot` cron for final dates only (≤ today−3, GSC's delay window),
 * so rows never need revising once written.
 *
 * `blog_post_id` is resolved at insert time via the shared blog-URL resolver;
 * NULL means the page is not a blog post (marketing page, gallery, …).
 *
 * @module packages/db/src/schema/gsc/gsc-query-page-daily.table
 */
import { sql } from 'drizzle-orm'
import {
    date,
    doublePrecision,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core'

import { blogPost } from '../blog/blog-post.table'

export const gscQueryPageDaily = pgTable(
    'gsc_query_page_daily',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /** GSC's own date key (Pacific Time days, as the API reports them). */
        date: date('date').notNull(),

        query: text('query').notNull(),

        /** Full page URL exactly as GSC returns it. */
        page: text('page').notNull(),

        /** Resolved blog post, when the page is one. */
        blogPostId: uuid('blog_post_id').references(() => blogPost.id, {
            onDelete: 'set null',
        }),

        clicks: integer('clicks').notNull(),
        impressions: integer('impressions').notNull(),
        ctr: doublePrecision('ctr').notNull(),
        position: doublePrecision('position').notNull(),

        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        // Upsert target: one row per (date, query, page).
        uniqueIndex('gsc_qpd_date_query_page_idx').on(
            table.date,
            table.query,
            table.page
        ),
        index('gsc_qpd_page_date_idx').on(table.page, table.date),
        index('gsc_qpd_query_date_idx').on(table.query, table.date),
        index('gsc_qpd_post_date_idx')
            .on(table.blogPostId, table.date)
            .where(sql`${table.blogPostId} IS NOT NULL`),
    ]
)

export type GscQueryPageDaily = typeof gscQueryPageDaily.$inferSelect
export type InsertGscQueryPageDaily = typeof gscQueryPageDaily.$inferInsert
