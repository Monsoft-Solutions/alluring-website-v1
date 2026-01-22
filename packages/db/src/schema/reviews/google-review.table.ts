/**
 * Google Review Table
 *
 * Stores reviews from Google Business Profile.
 * Reviews are synced from Google and filtered to show only 4+ stars on the frontend.
 *
 * @module packages/db/src/schema/reviews/google-review.table
 */
import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * Google reviews table for storing reviews from Google Business Profile
 */
export const googleReview = pgTable(
    'google_review',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * Unique review ID from Google
         */
        googleReviewId: varchar('google_review_id', { length: 255 })
            .notNull()
            .unique(),

        /**
         * Name of the reviewer
         */
        reviewerName: varchar('reviewer_name', { length: 255 }).notNull(),

        /**
         * URL to reviewer's profile photo (from Google)
         */
        reviewerPhotoUrl: text('reviewer_photo_url'),

        /**
         * Star rating (1-5)
         */
        rating: integer('rating').notNull(),

        /**
         * Review text/comment
         */
        comment: text('comment'),

        /**
         * When the review was originally created on Google
         */
        reviewCreatedAt: timestamp('review_created_at').notNull(),

        /**
         * When the review was last updated on Google
         */
        reviewUpdatedAt: timestamp('review_updated_at'),

        /**
         * Owner's reply to the review (if any)
         */
        replyText: text('reply_text'),

        /**
         * When the owner replied to the review
         */
        replyCreatedAt: timestamp('reply_created_at'),

        /**
         * Whether to show this review on the website
         */
        isPublished: boolean('is_published').default(true).notNull(),

        /**
         * Whether this review is featured (shown prominently)
         */
        isFeatured: boolean('is_featured').default(false).notNull(),

        /**
         * Custom display order for sorting (lower = first)
         */
        displayOrder: integer('display_order').default(0).notNull(),

        // ====================================================================
        // System Fields
        // ====================================================================

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index('google_review_rating_idx').on(table.rating),
        index('google_review_published_rating_idx').on(
            table.isPublished,
            table.rating
        ),
        index('google_review_featured_idx').on(table.isFeatured),
        index('google_review_display_order_idx').on(table.displayOrder),
    ]
)

export type GoogleReview = typeof googleReview.$inferSelect
export type InsertGoogleReview = typeof googleReview.$inferInsert
