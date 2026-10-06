import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import {
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, desc, eq, sql } from 'drizzle-orm'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

const CACHE_TTL = 3600

/** A procedure collection as the gallery's index and switcher show it. */
export type GalleryProcedure = {
    readonly slug: string
    readonly name: string
    readonly description: string | null
    readonly photoCount: number
    readonly videoCount: number
    /** The group's chosen cover, else its newest photo. */
    readonly cover: { url: string; alt: string } | null
}

/** A media card that knows which collection it came from. */
export type GalleryOverviewMedia = GalleryMediaCard & {
    readonly groupSlug: string
    readonly groupName: string
}

export type GalleryOverview = {
    readonly procedures: GalleryProcedure[]
    readonly totals: { photos: number; videos: number }
    readonly latest: GalleryOverviewMedia[]
    readonly videos: GalleryOverviewMedia[]
}

const LATEST_LIMIT = 12
const VIDEO_LIMIT = 8

async function fetchProcedures(): Promise<GalleryProcedure[]> {
    // The correlated subqueries name gallery_group's columns literally: in a
    // single-table select Drizzle renders ${galleryGroup.id} as a bare "id",
    // which inside the subquery binds to gallery_media.id instead.
    const rows = await db
        .select({
            slug: galleryGroup.slug,
            name: galleryGroup.name,
            description: galleryGroup.description,
            displayOrder: galleryGroup.displayOrder,
            coverUrl: sql<string | null>`(
                SELECT gm.url FROM gallery_media gm
                WHERE gm.id = gallery_group.cover_image_id
                AND gm.type = 'image' AND gm.status = 'published'
            )`,
            coverAlt: sql<string | null>`(
                SELECT gm.alt FROM gallery_media gm
                WHERE gm.id = gallery_group.cover_image_id
            )`,
            newestUrl: sql<string | null>`(
                SELECT gm.url FROM gallery_media_group gmg
                INNER JOIN gallery_media gm ON gm.id = gmg.media_id
                WHERE gmg.group_id = gallery_group.id
                AND gm.status = 'published' AND gm.type = 'image'
                ORDER BY gm.published_at DESC NULLS LAST
                LIMIT 1
            )`,
            newestAlt: sql<string | null>`(
                SELECT gm.alt FROM gallery_media_group gmg
                INNER JOIN gallery_media gm ON gm.id = gmg.media_id
                WHERE gmg.group_id = gallery_group.id
                AND gm.status = 'published' AND gm.type = 'image'
                ORDER BY gm.published_at DESC NULLS LAST
                LIMIT 1
            )`,
            photoCount: sql<number>`(
                SELECT COUNT(*)::int FROM gallery_media_group gmg
                INNER JOIN gallery_media gm ON gm.id = gmg.media_id
                WHERE gmg.group_id = gallery_group.id
                AND gm.status = 'published' AND gm.type = 'image'
            )`,
            videoCount: sql<number>`(
                SELECT COUNT(*)::int FROM gallery_media_group gmg
                INNER JOIN gallery_media gm ON gm.id = gmg.media_id
                WHERE gmg.group_id = gallery_group.id
                AND gm.status = 'published' AND gm.type = 'video'
            )`,
        })
        .from(galleryGroup)
        .where(eq(galleryGroup.isVisible, true))
        .orderBy(asc(galleryGroup.displayOrder))

    // Deepest collections first: a visitor scanning the list meets the
    // procedures with the most results before the ones with three photos
    return rows
        .filter((r) => r.photoCount + r.videoCount > 0)
        .sort(
            (a, b) =>
                b.photoCount + b.videoCount - (a.photoCount + a.videoCount) ||
                a.displayOrder - b.displayOrder
        )
        .map((r) => {
            const url = r.coverUrl ?? r.newestUrl
            return {
                slug: r.slug,
                name: r.name,
                description: r.description,
                photoCount: r.photoCount,
                videoCount: r.videoCount,
                cover: url
                    ? {
                          url,
                          alt:
                              (r.coverUrl ? r.coverAlt : r.newestAlt) ??
                              `${r.name} before and after`,
                      }
                    : null,
            }
        })
}

/**
 * Newest published media, each with the first collection it belongs to.
 * A media item can sit in several groups (a combination procedure); the
 * card links to the one with the lowest display order.
 */
async function fetchNewestMedia(
    type: 'image' | 'video' | null,
    limit: number
): Promise<GalleryOverviewMedia[]> {
    const rows = await db
        .selectDistinctOn([galleryMedia.publishedAt, galleryMedia.id], {
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
            groupSlug: galleryGroup.slug,
            groupName: galleryGroup.name,
        })
        .from(galleryMedia)
        .innerJoin(
            galleryMediaGroup,
            eq(galleryMediaGroup.mediaId, galleryMedia.id)
        )
        .innerJoin(
            galleryGroup,
            and(
                eq(galleryGroup.id, galleryMediaGroup.groupId),
                eq(galleryGroup.isVisible, true)
            )
        )
        .where(
            and(
                eq(galleryMedia.status, 'published'),
                type ? eq(galleryMedia.type, type) : undefined
            )
        )
        .orderBy(
            desc(galleryMedia.publishedAt),
            galleryMedia.id,
            asc(galleryGroup.displayOrder)
        )
        .limit(limit)

    return rows.map((r) => ({ ...r, alt: r.alt ?? r.title }))
}

async function fetchGalleryOverview(): Promise<GalleryOverview> {
    const [procedures, latest, videos] = await Promise.all([
        fetchProcedures(),
        fetchNewestMedia(null, LATEST_LIMIT),
        fetchNewestMedia('video', VIDEO_LIMIT),
    ])

    const [totals] = await db
        .select({
            photos: sql<number>`COUNT(*) FILTER (WHERE ${galleryMedia.type} = 'image')::int`,
            videos: sql<number>`COUNT(*) FILTER (WHERE ${galleryMedia.type} = 'video')::int`,
        })
        .from(galleryMedia)
        .where(eq(galleryMedia.status, 'published'))

    return {
        procedures,
        totals: totals ?? { photos: 0, videos: 0 },
        latest,
        videos,
    }
}

/**
 * Everything the gallery index and the per-procedure switcher need, in one
 * cached read: the collections with photo and video counts, site totals,
 * the newest results and the newest videos.
 */
export const getGalleryOverview = (): Promise<GalleryOverview> =>
    unstable_cache(fetchGalleryOverview, ['gallery-overview'], {
        tags: [CACHE_TAGS.GALLERY_GROUPS, CACHE_TAGS.GALLERY_MEDIA],
        revalidate: CACHE_TTL,
    })()
