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
    /** SEO-optimized title for sitemap */
    seoTitle: string | null
    /** SEO-optimized description for sitemap */
    seoDescription: string | null
    /** Media type (image, video, carousel) */
    mediaType: 'image' | 'video' | 'carousel'
    /** Video URL (only for video posts) */
    videoUrl: string | null
    /** Thumbnail URL (for videos) */
    thumbnailUrl: string | null
}

/**
 * Get all Instagram posts for sitemap generation
 *
 * Includes both image and video data for comprehensive sitemap support.
 * For video posts, includes video URL for video sitemap and thumbnail for image sitemap.
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
            seoTitle: instagramPost.seoTitle,
            seoDescription: instagramPost.seoDescription,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .orderBy(desc(instagramPost.takenAt))

    // Map to sitemap entries with video support
    return posts.map((post) => ({
        code: post.code,
        takenAt: post.takenAt,
        mediaType: post.mediaType,
        // For videos, use thumbnail; for images/carousels, use the main URL
        imageUrl:
            post.mediaType === 'video' && post.thumbnailUrl
                ? post.thumbnailUrl
                : post.mediaUrl,
        // Include video URL for video posts
        videoUrl: post.mediaType === 'video' ? post.mediaUrl : null,
        thumbnailUrl: post.thumbnailUrl,
        caption: post.caption,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
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
