/**
 * Instagram Post Media Junction Table
 *
 * Stores the relationship between Instagram carousel posts
 * and their individual media items in gallery_media.
 *
 * @module packages/db/src/schema/social-media/instagram-post-media.table
 */
import {
    foreignKey,
    index,
    integer,
    pgTable,
    primaryKey,
    uuid,
} from 'drizzle-orm/pg-core'

import { galleryMedia } from '../gallery/gallery-media.table'

import { instagramPost } from './instagram-post.table'

/**
 * Junction table for carousel posts with multiple media items
 */
export const instagramPostMedia = pgTable(
    'instagram_post_media',
    {
        /**
         * Reference to the Instagram post
         */
        postId: uuid('post_id').notNull(),

        /**
         * Reference to the media item in gallery_media
         */
        mediaId: uuid('media_id').notNull(),

        /**
         * Order of the media item in the carousel (0-indexed)
         */
        displayOrder: integer('display_order').default(0).notNull(),
    },
    (table) => [
        // Composite primary key
        primaryKey({ columns: [table.postId, table.mediaId] }),
        // Index for fetching media by post
        index('instagram_post_media_post_id_idx').on(table.postId),
        // Index for finding posts by media
        index('instagram_post_media_media_id_idx').on(table.mediaId),
        // Foreign key to instagram_post
        foreignKey({
            columns: [table.postId],
            foreignColumns: [instagramPost.id],
            name: 'instagram_post_media_post_id_fkey',
        }).onDelete('cascade'),
        // Foreign key to gallery_media
        foreignKey({
            columns: [table.mediaId],
            foreignColumns: [galleryMedia.id],
            name: 'instagram_post_media_media_id_fkey',
        }).onDelete('cascade'),
    ]
)

export type InstagramPostMedia = typeof instagramPostMedia.$inferSelect
export type InsertInstagramPostMedia = typeof instagramPostMedia.$inferInsert
