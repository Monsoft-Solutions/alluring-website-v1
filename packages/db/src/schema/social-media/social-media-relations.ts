/**
 * Social Media Relations
 *
 * Defines Drizzle ORM relations for social media tables.
 *
 * @module packages/db/src/schema/social-media/social-media-relations
 */
import { relations } from 'drizzle-orm'

import { galleryMedia } from '../gallery/gallery-media.table'

import { instagramPost } from './instagram-post.table'
import { instagramPostMedia } from './instagram-post-media.table'

/**
 * Instagram Post relations
 */
export const instagramPostRelations = relations(
    instagramPost,
    ({ one, many }) => ({
        // Primary media (image, video, or first carousel item)
        media: one(galleryMedia, {
            fields: [instagramPost.mediaId],
            references: [galleryMedia.id],
            relationName: 'primaryMedia',
        }),
        // Thumbnail for videos
        thumbnail: one(galleryMedia, {
            fields: [instagramPost.thumbnailMediaId],
            references: [galleryMedia.id],
            relationName: 'thumbnailMedia',
        }),
        // All carousel media items
        carouselMedia: many(instagramPostMedia),
    })
)

/**
 * Instagram Post Media (junction table) relations
 */
export const instagramPostMediaRelations = relations(
    instagramPostMedia,
    ({ one }) => ({
        post: one(instagramPost, {
            fields: [instagramPostMedia.postId],
            references: [instagramPost.id],
        }),
        media: one(galleryMedia, {
            fields: [instagramPostMedia.mediaId],
            references: [galleryMedia.id],
        }),
    })
)
