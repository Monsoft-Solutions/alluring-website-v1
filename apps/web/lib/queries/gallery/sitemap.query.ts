/**
 * Gallery Sitemap Query
 *
 * Fetches data needed for sitemap generation:
 * - All published gallery media with image URLs and updatedAt
 * - All visible gallery groups with cover image URLs and updatedAt
 */
import { db } from '@workspace/db/client'
import { galleryGroup, galleryMedia } from '@workspace/db/schema/gallery'
import { eq } from 'drizzle-orm'
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
