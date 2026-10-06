/**
 * Gallery Sitemap Query
 *
 * Fetches data needed for sitemap generation:
 * - All visible gallery groups with cover image URLs and updatedAt
 * - All published media grouped by their group slug, so every image and
 *   video can be attached to its indexable group page URL in the image /
 *   video sitemap extensions
 *
 * Image detail pages (/gallery/media/[slug]) are noindexed and not listed
 * as sitemap URLs (issue #118). Their images are still surfaced to Google
 * Images by attaching them to the group page entries instead — image
 * sitemaps support up to 1,000 images per URL.
 *
 * Videos are listed under their own detail page, which is their indexable
 * watch page (issue #321) — see getVideoWatchPagesForSitemap.
 */
import { db } from '@workspace/db/client'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, desc, eq, isNotNull, isNull, max } from 'drizzle-orm'
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
 * Published media item attached to a group page for sitemap extensions
 */
export type GroupMediaSitemapItem = {
    url: string
    title: string
    description: string | null
    /** Media type (image or video) for video sitemap support */
    type: 'image' | 'video'
    /** Thumbnail URL (required for video sitemap entries) */
    thumbnailUrl: string | null
    /** Duration in seconds for videos */
    duration: number | null
}

/**
 * Get all published media keyed by their gallery group slug
 *
 * Used to attach every image/video to its indexable group page URL in
 * the gallery sitemap (issue #118 follow-up: media detail pages are
 * noindexed, so this is how the media stays visible to Google Images).
 */
export const getMediaByGroupForSitemap = cache(
    async (): Promise<Map<string, GroupMediaSitemapItem[]>> => {
        const rows = await db
            .select({
                groupSlug: galleryGroup.slug,
                url: galleryMedia.url,
                title: galleryMedia.title,
                description: galleryMedia.description,
                type: galleryMedia.type,
                thumbnailUrl: galleryMedia.thumbnailUrl,
                duration: galleryMedia.duration,
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

        const byGroup = new Map<string, GroupMediaSitemapItem[]>()
        for (const row of rows) {
            const items = byGroup.get(row.groupSlug) ?? []
            items.push({
                url: row.url,
                title: row.title,
                description: row.description,
                type: row.type,
                thumbnailUrl: row.thumbnailUrl,
                duration: row.duration,
            })
            byGroup.set(row.groupSlug, items)
        }
        return byGroup
    }
)

/**
 * Get published media that belong to no gallery group
 *
 * These have no group page to be attached to, so the sitemap attaches
 * them to the main /gallery listing page instead.
 */
export const getUngroupedMediaForSitemap = cache(
    async (): Promise<GroupMediaSitemapItem[]> => {
        const rows = await db
            .select({
                url: galleryMedia.url,
                title: galleryMedia.title,
                description: galleryMedia.description,
                type: galleryMedia.type,
                thumbnailUrl: galleryMedia.thumbnailUrl,
                duration: galleryMedia.duration,
            })
            .from(galleryMedia)
            .leftJoin(
                galleryMediaGroup,
                eq(galleryMediaGroup.mediaId, galleryMedia.id)
            )
            .where(
                and(
                    eq(galleryMedia.status, 'published'),
                    isNull(galleryMediaGroup.mediaId)
                )
            )

        return rows.map((r) => ({
            url: r.url,
            title: r.title,
            description: r.description,
            type: r.type,
            thumbnailUrl: r.thumbnailUrl,
            duration: r.duration,
        }))
    }
)

/**
 * A published gallery video and its watch page
 */
export type VideoWatchPageSitemapItem = {
    slug: string
    url: string
    title: string
    description: string | null
    thumbnailUrl: string
    duration: number | null
    publishedAt: Date | null
    updatedAt: Date
}

/**
 * Get every published video that has a poster image
 *
 * Each becomes its own sitemap URL (/gallery/media/[slug]) carrying one
 * <video:video> entry: Google indexes a video from the page where it is
 * the main content, and the video sitemap spec requires a thumbnail.
 * Videos without a poster stay attached to their group page as images.
 */
export const getVideoWatchPagesForSitemap = cache(
    async (): Promise<VideoWatchPageSitemapItem[]> => {
        const rows = await db
            .select({
                slug: galleryMedia.slug,
                url: galleryMedia.url,
                title: galleryMedia.title,
                description: galleryMedia.description,
                thumbnailUrl: galleryMedia.thumbnailUrl,
                duration: galleryMedia.duration,
                publishedAt: galleryMedia.publishedAt,
                updatedAt: galleryMedia.updatedAt,
            })
            .from(galleryMedia)
            .where(
                and(
                    eq(galleryMedia.status, 'published'),
                    eq(galleryMedia.type, 'video'),
                    isNotNull(galleryMedia.thumbnailUrl)
                )
            )
            .orderBy(desc(galleryMedia.publishedAt))

        return rows.flatMap((r) =>
            r.thumbnailUrl ? [{ ...r, thumbnailUrl: r.thumbnailUrl }] : []
        )
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
