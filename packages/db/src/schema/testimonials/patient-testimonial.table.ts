/**
 * Patient Testimonial Table
 *
 * Stores patient testimonials with support for:
 * - Instagram-sourced testimonials (video/carousel content)
 * - Direct video uploads
 * - Manual text entries
 *
 * @module packages/db/src/schema/testimonials/patient-testimonial.table
 */
import {
    boolean,
    foreignKey,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import { galleryMedia } from '../gallery/gallery-media.table'
import { instagramPost } from '../social-media/instagram-post.table'

/**
 * Source type for testimonials
 * - instagram: Linked to an Instagram post
 * - direct: Direct video upload to gallery
 * - manual: Text-only testimonial
 */
export const testimonialSourceType = pgEnum('testimonial_source_type', [
    'instagram',
    'direct',
    'manual',
])

/**
 * Status for testimonials
 */
export const testimonialStatus = pgEnum('testimonial_status', [
    'draft',
    'published',
    'archived',
])

/**
 * Metadata stored in JSONB for testimonials
 */
export interface TestimonialMetadata {
    /** Instagram engagement metrics (for instagram source) */
    instagramEngagement?: {
        likeCount?: number
        commentCount?: number
        playCount?: number
    }
    /** Additional unstructured data */
    [key: string]: unknown
}

/**
 * Patient Testimonial table
 */
export const patientTestimonial = pgTable(
    'patient_testimonial',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * Source type of the testimonial
         */
        sourceType: testimonialSourceType('source_type').notNull(),

        /**
         * Reference to Instagram post (for instagram source type)
         */
        instagramPostId: uuid('instagram_post_id'),

        /**
         * Reference to gallery media for direct video uploads
         */
        mediaId: uuid('media_id'),

        /**
         * Reference to thumbnail image in gallery_media
         */
        thumbnailMediaId: uuid('thumbnail_media_id'),

        /**
         * Patient's first name or display name
         */
        patientName: varchar('patient_name', { length: 100 }).notNull(),

        /**
         * Procedure name (e.g., "Brazilian Butt Lift", "Tummy Tuck")
         */
        procedure: varchar('procedure', { length: 100 }).notNull(),

        /**
         * URL-friendly slug for the procedure (e.g., "brazilian-butt-lift")
         * Used for filtering testimonials by procedure
         */
        procedureSlug: varchar('procedure_slug', { length: 100 }),

        /**
         * Time since procedure (e.g., "3 months post-op", "1 year post-op")
         */
        timeframe: varchar('timeframe', { length: 100 }),

        /**
         * Patient's testimonial quote/review text
         */
        quote: text('quote').notNull(),

        /**
         * Rating out of 5 stars
         */
        rating: integer('rating').default(5).notNull(),

        /**
         * Whether this testimonial is featured on homepage/key pages
         */
        isFeatured: boolean('is_featured').default(false).notNull(),

        /**
         * Display order for featured section (lower = first)
         */
        displayOrder: integer('display_order').default(0).notNull(),

        /**
         * Publication status
         */
        status: testimonialStatus('status').default('draft').notNull(),

        /**
         * URL-friendly slug for the testimonial
         */
        slug: varchar('slug', { length: 255 }).notNull().unique(),

        /**
         * Additional metadata (Instagram engagement, etc.)
         */
        metadata: jsonb('metadata').$type<TestimonialMetadata>(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
        publishedAt: timestamp('published_at'),
    },
    (table) => [
        // Index for listing published testimonials
        index('patient_testimonial_status_published_at_idx').on(
            table.status,
            table.publishedAt
        ),
        // Index for featured testimonials section
        index('patient_testimonial_featured_order_idx').on(
            table.isFeatured,
            table.displayOrder
        ),
        // Index for filtering by procedure
        index('patient_testimonial_procedure_slug_idx').on(table.procedureSlug),
        // Index for finding by instagram post
        index('patient_testimonial_instagram_post_id_idx').on(
            table.instagramPostId
        ),

        // Foreign key to instagram_post (set null on delete)
        foreignKey({
            columns: [table.instagramPostId],
            foreignColumns: [instagramPost.id],
            name: 'patient_testimonial_instagram_post_id_fkey',
        }).onDelete('set null'),

        // Foreign key to gallery_media for direct video (set null on delete)
        foreignKey({
            columns: [table.mediaId],
            foreignColumns: [galleryMedia.id],
            name: 'patient_testimonial_media_id_fkey',
        }).onDelete('set null'),

        // Foreign key to gallery_media for thumbnail (set null on delete)
        foreignKey({
            columns: [table.thumbnailMediaId],
            foreignColumns: [galleryMedia.id],
            name: 'patient_testimonial_thumbnail_media_id_fkey',
        }).onDelete('set null'),
    ]
)

export type PatientTestimonial = typeof patientTestimonial.$inferSelect
export type InsertPatientTestimonial = typeof patientTestimonial.$inferInsert
