import { cache } from 'react'
import { db } from '@workspace/db/client'
import {
    beforeAfterPair,
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, count, desc, eq, ilike, notInArray, sql } from 'drizzle-orm'

import type {
    GalleryMediaListItem,
    GetGalleryMediaOptions,
    GalleryMediaDetail,
    GalleryMediaOption,
    RecentMediaItem,
} from '@/lib/types/gallery/gallery-media.type'
import type {
    GalleryGroupListItem,
    GalleryGroupDetail,
    GalleryGroupOption,
    GalleryGroupWithSlug,
    GalleryGroupForAI,
} from '@/lib/types/gallery/gallery-group.type'
import type {
    BeforeAfterPairListItem,
    BeforeAfterPairDetail,
} from '@/lib/types/gallery/before-after.type'
import type { GalleryStats } from '@/lib/types/gallery/gallery-stats.type'

// ============================================================================
// Gallery Media Queries
// ============================================================================

export async function getGalleryMedia(
    options: GetGalleryMediaOptions = {}
): Promise<{ media: GalleryMediaListItem[]; total: number }> {
    const {
        page = 1,
        pageSize = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status = 'all',
        type = 'all',
        groupId,
        hasGroup,
        excludeMediaIds,
        search,
    } = options
    const offset = (page - 1) * pageSize

    // Build conditions
    const conditions = []

    if (status !== 'all') {
        conditions.push(eq(galleryMedia.status, status))
    }

    if (type !== 'all') {
        conditions.push(eq(galleryMedia.type, type))
    }

    if (search) {
        conditions.push(ilike(galleryMedia.title, `%${search}%`))
    }

    if (excludeMediaIds && excludeMediaIds.length > 0) {
        conditions.push(notInArray(galleryMedia.id, excludeMediaIds))
    }

    // Determine sort column and direction
    const sortColumn =
        sortBy === 'title'
            ? galleryMedia.title
            : sortBy === 'displayOrder'
              ? galleryMedia.displayOrder
              : sortBy === 'qualityScore'
                ? sql<number>`COALESCE((${galleryMedia.aiAnalysis}->>'qualityScore')::numeric, 0)`
                : galleryMedia.createdAt

    const orderDirection = sortOrder === 'asc' ? asc : desc

    // If filtering by specific group (takes precedence over hasGroup)
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
                    status: galleryMedia.status,
                    isFeatured: galleryMedia.isFeatured,
                    isBeforeAfter: galleryMedia.isBeforeAfter,
                    displayOrder: galleryMedia.displayOrder,
                    createdAt: galleryMedia.createdAt,
                    publishedAt: galleryMedia.publishedAt,
                })
                .from(galleryMedia)
                .innerJoin(
                    galleryMediaGroup,
                    eq(galleryMedia.id, galleryMediaGroup.mediaId)
                )
                .where(
                    and(eq(galleryMediaGroup.groupId, groupId), ...conditions)
                )
                .orderBy(orderDirection(sortColumn))
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
            media,
            total: totalResult[0]?.count ?? 0,
        }
    }

    // Handle hasGroup filter (requires subquery)
    if (hasGroup !== null && hasGroup !== undefined) {
        if (hasGroup) {
            // Media that has at least one group
            conditions.push(
                sql`EXISTS (SELECT 1 FROM ${galleryMediaGroup} WHERE ${galleryMediaGroup.mediaId} = ${galleryMedia.id})`
            )
        } else {
            // Media that has no groups
            conditions.push(
                sql`NOT EXISTS (SELECT 1 FROM ${galleryMediaGroup} WHERE ${galleryMediaGroup.mediaId} = ${galleryMedia.id})`
            )
        }
    }

    // Regular query without group filter
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [media, totalResult] = await Promise.all([
        db
            .select({
                id: galleryMedia.id,
                type: galleryMedia.type,
                url: galleryMedia.url,
                thumbnailUrl: galleryMedia.thumbnailUrl,
                title: galleryMedia.title,
                slug: galleryMedia.slug,
                status: galleryMedia.status,
                isFeatured: galleryMedia.isFeatured,
                isBeforeAfter: galleryMedia.isBeforeAfter,
                displayOrder: galleryMedia.displayOrder,
                createdAt: galleryMedia.createdAt,
                publishedAt: galleryMedia.publishedAt,
            })
            .from(galleryMedia)
            .where(whereClause)
            .orderBy(orderDirection(sortColumn))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(galleryMedia).where(whereClause),
    ])

    return {
        media,
        total: totalResult[0]?.count ?? 0,
    }
}

export async function getGalleryMediaById(
    id: string
): Promise<GalleryMediaDetail | null> {
    const [mediaResult, groupsResult] = await Promise.all([
        db.select().from(galleryMedia).where(eq(galleryMedia.id, id)).limit(1),
        db
            .select({ groupId: galleryMediaGroup.groupId })
            .from(galleryMediaGroup)
            .where(eq(galleryMediaGroup.mediaId, id)),
    ])

    if (!mediaResult[0]) {
        return null
    }

    return {
        ...mediaResult[0],
        groupIds: groupsResult.map((g) => g.groupId),
    }
}

export async function getGalleryMediaForSelect(): Promise<
    GalleryMediaOption[]
> {
    return db
        .select({
            id: galleryMedia.id,
            title: galleryMedia.title,
            url: galleryMedia.url,
            type: galleryMedia.type,
        })
        .from(galleryMedia)
        .where(eq(galleryMedia.status, 'published'))
        .orderBy(desc(galleryMedia.createdAt))
}

/**
 * Get media items that belong to a specific group
 * Used in group edit page to display current group media
 */
export async function getMediaByGroupId(
    groupId: string,
    options?: {
        sortBy?: 'displayOrder' | 'createdAt'
        sortOrder?: 'asc' | 'desc'
    }
): Promise<GalleryMediaListItem[]> {
    const { sortBy = 'displayOrder', sortOrder = 'asc' } = options ?? {}

    const sortColumn =
        sortBy === 'createdAt'
            ? galleryMedia.createdAt
            : galleryMediaGroup.displayOrder
    const orderDirection = sortOrder === 'asc' ? asc : desc

    const media = await db
        .select({
            id: galleryMedia.id,
            type: galleryMedia.type,
            url: galleryMedia.url,
            thumbnailUrl: galleryMedia.thumbnailUrl,
            title: galleryMedia.title,
            slug: galleryMedia.slug,
            status: galleryMedia.status,
            isFeatured: galleryMedia.isFeatured,
            isBeforeAfter: galleryMedia.isBeforeAfter,
            displayOrder: galleryMedia.displayOrder,
            createdAt: galleryMedia.createdAt,
            publishedAt: galleryMedia.publishedAt,
        })
        .from(galleryMedia)
        .innerJoin(
            galleryMediaGroup,
            eq(galleryMedia.id, galleryMediaGroup.mediaId)
        )
        .where(eq(galleryMediaGroup.groupId, groupId))
        .orderBy(orderDirection(sortColumn))

    return media
}

/**
 * @deprecated Use getGalleryMedia() instead - now supports all filtering options
 * Get gallery media for selection dialog with advanced filtering
 * Supports filtering by group status, excluding specific media, and searching
 */
export async function getGalleryMediaForSelection(
    options: GetGalleryMediaOptions
): Promise<{ media: GalleryMediaListItem[]; total: number }> {
    return getGalleryMedia(options)
}

// ============================================================================
// Gallery Group Queries
// ============================================================================

export const getGalleryGroups = cache(
    async (): Promise<GalleryGroupListItem[]> => {
        const groups = await db
            .select({
                id: galleryGroup.id,
                name: galleryGroup.name,
                slug: galleryGroup.slug,
                description: galleryGroup.description,
                procedureSlug: galleryGroup.procedureSlug,
                coverImageId: galleryGroup.coverImageId,
                coverImageUrl: galleryMedia.url,
                displayOrder: galleryGroup.displayOrder,
                isVisible: galleryGroup.isVisible,
                createdAt: galleryGroup.createdAt,
                mediaCount: sql<number>`(
                SELECT COUNT(*)::int 
                FROM gallery_media_group 
                WHERE gallery_media_group.group_id = ${galleryGroup.id}
            )`,
            })
            .from(galleryGroup)
            .leftJoin(
                galleryMedia,
                eq(galleryGroup.coverImageId, galleryMedia.id)
            )
            .orderBy(asc(galleryGroup.displayOrder))

        return groups
    }
)

export async function getGalleryGroupById(
    id: string
): Promise<GalleryGroupDetail | null> {
    const result = await db
        .select()
        .from(galleryGroup)
        .where(eq(galleryGroup.id, id))
        .limit(1)

    return result[0] ?? null
}

export async function getGalleryGroupsForSelect(): Promise<
    GalleryGroupOption[]
> {
    return db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
        })
        .from(galleryGroup)
        .where(eq(galleryGroup.isVisible, true))
        .orderBy(asc(galleryGroup.displayOrder))
}

/**
 * Get gallery groups with slug for media form
 */
export async function getGalleryGroupsWithSlug(): Promise<
    GalleryGroupWithSlug[]
> {
    return db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
            slug: galleryGroup.slug,
        })
        .from(galleryGroup)
        .where(eq(galleryGroup.isVisible, true))
        .orderBy(asc(galleryGroup.displayOrder))
}

/**
 * Get gallery groups with full details for AI group suggestion
 */
export async function getGalleryGroupsForAI(): Promise<GalleryGroupForAI[]> {
    return db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
            slug: galleryGroup.slug,
            description: galleryGroup.description,
        })
        .from(galleryGroup)
        .where(eq(galleryGroup.isVisible, true))
        .orderBy(asc(galleryGroup.displayOrder))
}

// ============================================================================
// Before/After Pair Queries
// ============================================================================

export async function getBeforeAfterPairs(): Promise<
    BeforeAfterPairListItem[]
> {
    const beforeMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            title: galleryMedia.title,
        })
        .from(galleryMedia)
        .as('before_media')

    const afterMedia = db
        .select({
            id: galleryMedia.id,
            url: galleryMedia.url,
            title: galleryMedia.title,
        })
        .from(galleryMedia)
        .as('after_media')

    const pairs = await db
        .select({
            id: beforeAfterPair.id,
            beforeMediaId: beforeAfterPair.beforeMediaId,
            beforeMediaUrl: beforeMedia.url,
            beforeMediaTitle: beforeMedia.title,
            afterMediaId: beforeAfterPair.afterMediaId,
            afterMediaUrl: afterMedia.url,
            afterMediaTitle: afterMedia.title,
            procedureType: beforeAfterPair.procedureType,
            procedureSlug: beforeAfterPair.procedureSlug,
            patientInfo: beforeAfterPair.patientInfo,
            timeframe: beforeAfterPair.timeframe,
            isFeatured: beforeAfterPair.isFeatured,
            displayOrder: beforeAfterPair.displayOrder,
            createdAt: beforeAfterPair.createdAt,
        })
        .from(beforeAfterPair)
        .innerJoin(
            beforeMedia,
            eq(beforeAfterPair.beforeMediaId, beforeMedia.id)
        )
        .innerJoin(afterMedia, eq(beforeAfterPair.afterMediaId, afterMedia.id))
        .orderBy(asc(beforeAfterPair.displayOrder))

    return pairs
}

export async function getBeforeAfterPairById(
    id: string
): Promise<BeforeAfterPairDetail | null> {
    const result = await db
        .select()
        .from(beforeAfterPair)
        .where(eq(beforeAfterPair.id, id))
        .limit(1)

    return result[0] ?? null
}

// ============================================================================
// Gallery Statistics Queries
// ============================================================================

export const getGalleryStats = cache(async (): Promise<GalleryStats> => {
    // Optimized: Single query instead of 8 concurrent queries
    const result = await db.execute<{
        total_media: number
        total_images: number
        total_videos: number
        published_media: number
        draft_media: number
        featured_media: number
        total_groups: number
        total_before_after_pairs: number
    }>(sql`
        SELECT
            COUNT(*)::int AS total_media,
            COUNT(*) FILTER (WHERE type = 'image')::int AS total_images,
            COUNT(*) FILTER (WHERE type = 'video')::int AS total_videos,
            COUNT(*) FILTER (WHERE status = 'published')::int AS published_media,
            COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_media,
            COUNT(*) FILTER (WHERE is_featured = true)::int AS featured_media,
            (SELECT COUNT(*)::int FROM gallery_group) AS total_groups,
            (SELECT COUNT(*)::int FROM before_after_pair) AS total_before_after_pairs
        FROM gallery_media
    `)

    const stats = result[0]

    return {
        totalMedia: stats?.total_media ?? 0,
        totalImages: stats?.total_images ?? 0,
        totalVideos: stats?.total_videos ?? 0,
        totalGroups: stats?.total_groups ?? 0,
        totalBeforeAfterPairs: stats?.total_before_after_pairs ?? 0,
        publishedMedia: stats?.published_media ?? 0,
        draftMedia: stats?.draft_media ?? 0,
        featuredMedia: stats?.featured_media ?? 0,
    }
})

export async function getRecentMedia(limit = 8): Promise<RecentMediaItem[]> {
    return db
        .select({
            id: galleryMedia.id,
            type: galleryMedia.type,
            url: galleryMedia.url,
            title: galleryMedia.title,
            createdAt: galleryMedia.createdAt,
        })
        .from(galleryMedia)
        .orderBy(desc(galleryMedia.createdAt))
        .limit(limit)
}
