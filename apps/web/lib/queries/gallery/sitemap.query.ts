/**
 * Gallery Sitemap Query
 *
 * Fetches data needed for sitemap generation:
 * - All visible gallery groups with cover image URLs and updatedAt
 *
 * Media detail pages (/gallery/media/[slug]) are noindexed and no longer
 * listed in the sitemap (issue #118), so only group-level queries remain.
 */
import { db } from '@workspace/db/client'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, desc, eq, max } from 'drizzle-orm'
import { cache } from 'react'

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
 * Get most recent media dates for all visible gallery groups in a single query
 * Returns a Map of groupSlug -> mostRecentMediaDate
 * Used for efficient batch fetching to avoid N+1 queries in sitemap generation
 */
export const getAllGroupsRecentMediaDates = cache(
    async (): Promise<Map<string, Date>> => {
        const rows = await db
            .select({
                groupSlug: galleryGroup.slug,
                mostRecentDate: max(galleryMedia.updatedAt),
            })
            .from(galleryGroup)
            .innerJoin(
                galleryMediaGroup,
                eq(galleryMediaGroup.groupId, galleryGroup.id)
            )
            .innerJoin(
                galleryMedia,
                eq(galleryMedia.id, galleryMediaGroup.mediaId)
            )
            .where(
                and(
                    eq(galleryGroup.isVisible, true),
                    eq(galleryMedia.status, 'published')
                )
            )
            .groupBy(galleryGroup.slug)

        const resultMap = new Map<string, Date>()
        for (const row of rows) {
            if (row.mostRecentDate) {
                resultMap.set(row.groupSlug, row.mostRecentDate)
            }
        }
        return resultMap
    }
)
