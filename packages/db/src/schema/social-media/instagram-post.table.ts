/**
 * Instagram Post Table
 *
 * Stores Instagram posts scraped from the business profile.
 * Each post references gallery_media for the actual media files.
 *
 * @module packages/db/src/schema/social-media/instagram-post.table
 */
import {
    boolean,
    foreignKey,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import { galleryMedia } from '../gallery/gallery-media.table'

/**
 * Instagram media types
 */
export const instagramMediaType = pgEnum('instagram_media_type', [
    'image',
    'video',
    'carousel',
])

/**
 * Instagram post table for storing scraped posts
 */
export const instagramPost = pgTable(
    'instagram_post',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * Instagram's unique post ID
         */
        instagramId: varchar('instagram_id', { length: 100 })
            .notNull()
            .unique(),

        /**
         * Instagram shortcode for building permalink
         */
        code: varchar('code', { length: 50 }).notNull(),

        /**
         * Type of media in the post
         */
        mediaType: instagramMediaType('media_type').notNull(),

        /**
         * Post caption/description
         */
        caption: text('caption'),

        /**
         * Full URL to the Instagram post
         */
        permalink: text('permalink').notNull(),

        /**
         * When the post was originally published on Instagram
         */
        takenAt: timestamp('taken_at').notNull(),

        /**
         * Number of likes on the post
         */
        likeCount: integer('like_count').default(0),

        /**
         * Number of comments on the post
         */
        commentCount: integer('comment_count').default(0),

        /**
         * Number of plays (for videos/reels)
         */
        playCount: integer('play_count'),

        /**
         * Video duration in seconds (for videos/reels)
         */
        videoDuration: integer('video_duration'),

        /**
         * Reference to the primary media in gallery_media
         * For images: the image
         * For videos: the video file
         * For carousels: the first item (cover)
         */
        mediaId: uuid('media_id').notNull(),

        /**
         * Reference to thumbnail in gallery_media (for videos)
         */
        thumbnailMediaId: uuid('thumbnail_media_id'),

        /**
         * Whether this post should be visible on the website
         */
        isPublished: boolean('is_published').default(false).notNull(),

        /**
         * Whether this post is featured/highlighted
         */
        isFeatured: boolean('is_featured').default(false).notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        // Index for finding posts by Instagram ID
        index('instagram_post_instagram_id_idx').on(table.instagramId),
        // Index for listing posts by date
        index('instagram_post_taken_at_idx').on(table.takenAt),
        // Index for published posts
        index('instagram_post_published_idx').on(
            table.isPublished,
            table.takenAt
        ),
        // Index for featured posts
        index('instagram_post_featured_idx').on(
            table.isFeatured,
            table.takenAt
        ),
        // Foreign key to gallery_media for primary media
        foreignKey({
            columns: [table.mediaId],
            foreignColumns: [galleryMedia.id],
            name: 'instagram_post_media_id_fkey',
        }).onDelete('cascade'),
        // Foreign key to gallery_media for thumbnail
        foreignKey({
            columns: [table.thumbnailMediaId],
            foreignColumns: [galleryMedia.id],
            name: 'instagram_post_thumbnail_media_id_fkey',
        }).onDelete('set null'),
    ]
)

export type InstagramPost = typeof instagramPost.$inferSelect
export type InsertInstagramPost = typeof instagramPost.$inferInsert
