/**
 * Gallery Sitemap Query
 *
 * Fetches data needed for sitemap generation:
 * - All published gallery media with image URLs and updatedAt
 * - All visible gallery groups with cover image URLs and updatedAt
 */
import { db } from '@workspace/db/client'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, desc, eq } from 'drizzle-orm'
import { cache } from 'react'

/**
 * Gallery media sitemap entry
 */
export type GalleryMediaSitemapEntry = {
    slug: string
    url: string
    title: string
    updatedAt: Date
}

/**
 * Gallery group sitemap entry
 */
export type GalleryGroupSitemapEntry = {
    slug: string
    coverImageUrl: string | null
    name: string
    updatedAt: Date
}

/**
 * Get all published gallery media for sitemap
 * Includes image URL, title, and last modified date
 */
export const getGalleryMediaForSitemap = cache(
    async (): Promise<GalleryMediaSitemapEntry[]> => {
        const rows = await db
            .select({
                slug: galleryMedia.slug,
                url: galleryMedia.url,
                title: galleryMedia.title,
                updatedAt: galleryMedia.updatedAt,
            })
            .from(galleryMedia)
            .where(eq(galleryMedia.status, 'published'))

        return rows.map((r) => ({
            slug: r.slug,
            url: r.url,
            title: r.title,
            updatedAt: r.updatedAt,
        }))
    }
)

/**
 * Get all visible gallery groups for sitemap
 * Includes cover image URL and last modified date
 */
export const getGalleryGroupsForSitemap = cache(
    async (): Promise<GalleryGroupSitemapEntry[]> => {
        // Alias for the cover image join
        const coverImage = galleryMedia

        const rows = await db
            .select({
                slug: galleryGroup.slug,
                name: galleryGroup.name,
                coverImageUrl: coverImage.url,
                updatedAt: galleryGroup.updatedAt,
            })
            .from(galleryGroup)
            .leftJoin(coverImage, eq(coverImage.id, galleryGroup.coverImageId))
            .where(eq(galleryGroup.isVisible, true))

        return rows.map((r) => ({
            slug: r.slug,
            name: r.name,
            coverImageUrl: r.coverImageUrl,
            updatedAt: r.updatedAt,
        }))
    }
)

/**
 * Get the most recent published gallery media date (for gallery listing page lastmod)
 * Returns the updatedAt date of the most recently updated published media
 */
export const getMostRecentMediaDate = cache(async (): Promise<Date | null> => {
    const result = await db
        .select({ updatedAt: galleryMedia.updatedAt })
        .from(galleryMedia)
        .where(eq(galleryMedia.status, 'published'))
        .orderBy(desc(galleryMedia.updatedAt))
        .limit(1)

    return result[0]?.updatedAt ?? null
})

/**
 * Get most recent media date for a specific gallery group
 * Returns the updatedAt date of the most recent published media in the group
 */
export const getMostRecentMediaDateForGroup = cache(
    async (groupSlug: string): Promise<Date | null> => {
        const result = await db
            .select({ updatedAt: galleryMedia.updatedAt })
            .from(galleryMedia)
            .innerJoin(
                galleryMediaGroup,
                eq(galleryMediaGroup.mediaId, galleryMedia.id)
            )
            .innerJoin(
                galleryGroup,
                eq(galleryGroup.id, galleryMediaGroup.groupId)
            )
            .where(
                and(
                    eq(galleryMedia.status, 'published'),
                    eq(galleryGroup.slug, groupSlug),
                    eq(galleryGroup.isVisible, true)
                )
            )
            .orderBy(desc(galleryMedia.updatedAt))
            .limit(1)

        return result[0]?.updatedAt ?? null
    }
)
