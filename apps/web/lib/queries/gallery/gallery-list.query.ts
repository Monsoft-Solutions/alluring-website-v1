import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, count, desc, eq, sql } from 'drizzle-orm'

import type {
    GalleryGroupCard,
    GalleryMediaCard,
} from '@/lib/types/gallery/gallery-group.type'

/**
 * Internal function to fetch visible gallery groups from database
 */
async function fetchVisibleGalleryGroups(): Promise<GalleryGroupCard[]> {
    const groups = await db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
            slug: galleryGroup.slug,
            description: galleryGroup.description,
            coverImageUrl: galleryMedia.url,
            coverImageAlt: galleryMedia.alt,
            coverImageBlur: galleryMedia.blurDataUrl,
            displayOrder: galleryGroup.displayOrder,
            mediaCount: sql<number>`(
                SELECT COUNT(*)::int 
                FROM gallery_media_group gmg
                INNER JOIN gallery_media gm ON gm.id = gmg.media_id
                WHERE gmg.group_id = ${galleryGroup.id}
                AND gm.status = 'published'
            )`,
        })
        .from(galleryGroup)
        .leftJoin(galleryMedia, eq(galleryGroup.coverImageId, galleryMedia.id))
        .where(eq(galleryGroup.isVisible, true))
        .orderBy(asc(galleryGroup.displayOrder))

    return groups.map((group) => ({
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        coverImage: group.coverImageUrl
            ? {
                  url: group.coverImageUrl,
                  alt: group.coverImageAlt ?? group.name,
                  blurDataUrl: group.coverImageBlur,
              }
            : null,
        mediaCount: group.mediaCount,
    }))
}

/**
 * Get all visible gallery groups with caching
 *
 * @returns Array of gallery group cards
 */
export const getVisibleGalleryGroups = (): Promise<GalleryGroupCard[]> => {
    return unstable_cache(
        () => fetchVisibleGalleryGroups(),
        ['gallery-groups-list'],
        {
            tags: ['gallery-groups'],
            revalidate: 60,
        }
    )()
}

/**
 * Internal function to fetch published gallery media with pagination
 */
async function fetchPublishedGalleryMedia(options: {
    page?: number
    pageSize?: number
    groupId?: string
    featured?: boolean
}): Promise<{ media: GalleryMediaCard[]; total: number }> {
    const { page = 1, pageSize = 20, groupId, featured } = options
    const offset = (page - 1) * pageSize

    const conditions = [eq(galleryMedia.status, 'published')]

    if (featured !== undefined) {
        conditions.push(eq(galleryMedia.isFeatured, featured))
    }

    // If filtering by group, join with junction table
    if (groupId) {
        const [media, totalResult] = await Promise.all([
            db
                .select({
                    id: galleryMedia.id,
                    type: galleryMedia.type,
                    url: galleryMedia.url,
                    thumbnailUrl: galleryMedia.thumbnailUrl,
                    title: galleryMedia.title,
                    slug: galleryMedia.slug,
                    alt: galleryMedia.alt,
                    blurDataUrl: galleryMedia.blurDataUrl,
                    width: galleryMedia.width,
                    height: galleryMedia.height,
                    isFeatured: galleryMedia.isFeatured,
                })
                .from(galleryMedia)
                .innerJoin(
                    galleryMediaGroup,
                    eq(galleryMedia.id, galleryMediaGroup.mediaId)
                )
                .where(
                    and(eq(galleryMediaGroup.groupId, groupId), ...conditions)
                )
                .orderBy(
                    asc(galleryMedia.displayOrder),
                    desc(galleryMedia.publishedAt)
                )
                .limit(pageSize)
                .offset(offset),
            db
                .select({ count: count() })
                .from(galleryMedia)
                .innerJoin(
                    galleryMediaGroup,
                    eq(galleryMedia.id, galleryMediaGroup.mediaId)
                )
                .where(
                    and(eq(galleryMediaGroup.groupId, groupId), ...conditions)
                ),
        ])

        return {
            media: media.map((m) => ({
                id: m.id,
                type: m.type,
                url: m.url,
                thumbnailUrl: m.thumbnailUrl,
                title: m.title,
                slug: m.slug,
                alt: m.alt ?? m.title,
                blurDataUrl: m.blurDataUrl,
                width: m.width,
                height: m.height,
                isFeatured: m.isFeatured,
            })),
            total: totalResult[0]?.count ?? 0,
        }
    }

    // Regular query without group filter
    const [media, totalResult] = await Promise.all([
        db
            .select({
                id: galleryMedia.id,
                type: galleryMedia.type,
                url: galleryMedia.url,
                thumbnailUrl: galleryMedia.thumbnailUrl,
                title: galleryMedia.title,
                slug: galleryMedia.slug,
                alt: galleryMedia.alt,
                blurDataUrl: galleryMedia.blurDataUrl,
                width: galleryMedia.width,
                height: galleryMedia.height,
                isFeatured: galleryMedia.isFeatured,
            })
            .from(galleryMedia)
            .where(and(...conditions))
            .orderBy(
                asc(galleryMedia.displayOrder),
                desc(galleryMedia.publishedAt)
            )
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: count() })
            .from(galleryMedia)
            .where(and(...conditions)),
    ])

    return {
        media: media.map((m) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbnailUrl: m.thumbnailUrl,
            title: m.title,
            slug: m.slug,
            alt: m.alt ?? m.title,
            blurDataUrl: m.blurDataUrl,
            width: m.width,
            height: m.height,
            isFeatured: m.isFeatured,
        })),
        total: totalResult[0]?.count ?? 0,
    }
}

/**
 * Get published gallery media with caching
 *
 * @param options - Pagination and filter options
 * @returns Paginated media results
 */
export const getPublishedGalleryMedia = (options: {
    page?: number
    pageSize?: number
    groupId?: string
    featured?: boolean
}): Promise<{ media: GalleryMediaCard[]; total: number }> => {
    const cacheKey = `gallery-media-${options.page ?? 1}-${options.pageSize ?? 20}-${options.groupId ?? 'all'}-${options.featured ?? 'all'}`

    return unstable_cache(
        () => fetchPublishedGalleryMedia(options),
        [cacheKey],
        {
            tags: ['gallery-media'],
            revalidate: 60,
        }
    )()
}

/**
 * Get featured gallery media
 */
export const getFeaturedGalleryMedia = (
    limit = 8
): Promise<{ media: GalleryMediaCard[]; total: number }> => {
    return getPublishedGalleryMedia({ pageSize: limit, featured: true })
}
