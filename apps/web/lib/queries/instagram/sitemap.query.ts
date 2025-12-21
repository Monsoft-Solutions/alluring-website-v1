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
    mediaUrl: string
    caption: string | null
}

/**
 * Get all Instagram posts for sitemap generation
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
            caption: instagramPost.caption,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .orderBy(desc(instagramPost.takenAt))

    return posts
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
