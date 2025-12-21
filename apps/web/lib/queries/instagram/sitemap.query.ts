/**
 * Instagram Sitemap Query
 *
 * Lightweight queries for sitemap generation.
 *
 * @module lib/queries/instagram/sitemap
 */
import { db } from '@workspace/db/client'
import { instagramPost } from '@workspace/db/schema/social-media'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { desc, eq, max } from 'drizzle-orm'

/**
 * Instagram post data for sitemap entry
 */
export type InstagramSitemapEntry = {
    code: string
    takenAt: Date
    /** Image URL for sitemap (uses thumbnail for videos) */
    imageUrl: string
    caption: string | null
}

/**
 * Get all Instagram posts for sitemap generation
 *
 * For video posts, uses the thumbnail image instead of the video URL
 * since image sitemaps require actual image files.
 *
 * @returns Array of posts with minimal data for sitemap
 */
export async function getInstagramPostsForSitemap(): Promise<
    InstagramSitemapEntry[]
> {
    const posts = await db
        .select({
            code: instagramPost.code,
            takenAt: instagramPost.takenAt,
            mediaUrl: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            mediaType: instagramPost.mediaType,
            caption: instagramPost.caption,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .orderBy(desc(instagramPost.takenAt))

    // Map to sitemap entries, using thumbnail for videos
    return posts.map((post) => ({
        code: post.code,
        takenAt: post.takenAt,
        // For videos, use thumbnail; for images/carousels, use the main URL
        imageUrl:
            post.mediaType === 'video' && post.thumbnailUrl
                ? post.thumbnailUrl
                : post.mediaUrl,
        caption: post.caption,
    }))
}

/**
 * Get the most recent Instagram post date for sitemap lastModified
 *
 * @returns Most recent post date or null if no posts
 */
export async function getMostRecentInstagramPostDate(): Promise<Date | null> {
    const [result] = await db
        .select({ maxDate: max(instagramPost.takenAt) })
        .from(instagramPost)

    return result?.maxDate ?? null
}
