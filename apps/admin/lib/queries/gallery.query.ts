import { db } from '@workspace/db/client'
import {
    beforeAfterPair,
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { and, asc, count, desc, eq, ilike, inArray, sql } from 'drizzle-orm'

// ============================================================================
// Gallery Media Queries
// ============================================================================

export type GalleryMediaListItem = {
    id: string
    type: 'image' | 'video'
    url: string
    thumbnailUrl: string | null
    title: string
    slug: string
    status: 'draft' | 'published' | 'archived'
    isFeatured: boolean
    isBeforeAfter: boolean
    displayOrder: number
    createdAt: Date
    publishedAt: Date | null
}

export type GalleryMediaSortBy = 'createdAt' | 'title' | 'displayOrder'
export type GalleryMediaSortOrder = 'asc' | 'desc'
export type GalleryMediaStatusFilter =
    | 'all'
    | 'draft'
    | 'published'
    | 'archived'
export type GalleryMediaTypeFilter = 'all' | 'image' | 'video'

export type GetGalleryMediaOptions = {
    page?: number
    pageSize?: number
    sortBy?: GalleryMediaSortBy
    sortOrder?: GalleryMediaSortOrder
    status?: GalleryMediaStatusFilter
    type?: GalleryMediaTypeFilter
    groupId?: string
    search?: string
}

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

    // Determine sort column and direction
    const sortColumn =
        sortBy === 'title'
            ? galleryMedia.title
            : sortBy === 'displayOrder'
              ? galleryMedia.displayOrder
              : galleryMedia.createdAt

    const orderDirection = sortOrder === 'asc' ? asc : desc

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
                status: galleryMedia.status,
                isFeatured: galleryMedia.isFeatured,
                isBeforeAfter: galleryMedia.isBeforeAfter,
                displayOrder: galleryMedia.displayOrder,
                createdAt: galleryMedia.createdAt,
                publishedAt: galleryMedia.publishedAt,
            })
            .from(galleryMedia)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(orderDirection(sortColumn))
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: count() })
            .from(galleryMedia)
            .where(conditions.length > 0 ? and(...conditions) : undefined),
    ])

    return {
        media,
        total: totalResult[0]?.count ?? 0,
    }
}

export type GalleryMediaDetail = {
    id: string
    type: 'image' | 'video'
    url: string
    thumbnailUrl: string | null
    title: string
    description: string | null
    alt: string | null
    seoTitle: string | null
    seoDescription: string | null
    slug: string
    width: number | null
    height: number | null
    duration: number | null
    fileSize: number | null
    mimeType: string | null
    originalFilename: string | null
    blurDataUrl: string | null
    isFeatured: boolean
    isBeforeAfter: boolean
    beforeAfterId: string | null
    displayOrder: number
    status: 'draft' | 'published' | 'archived'
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    groupIds: string[]
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

export type GalleryMediaOption = {
    id: string
    title: string
    url: string
    type: 'image' | 'video'
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

// ============================================================================
// Gallery Group Queries
// ============================================================================

export type GalleryGroupListItem = {
    id: string
    name: string
    slug: string
    description: string | null
    coverImageUrl: string | null
    displayOrder: number
    isVisible: boolean
    mediaCount: number
    createdAt: Date
}

export async function getGalleryGroups(): Promise<GalleryGroupListItem[]> {
    const groups = await db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
            slug: galleryGroup.slug,
            description: galleryGroup.description,
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
        .leftJoin(galleryMedia, eq(galleryGroup.coverImageId, galleryMedia.id))
        .orderBy(asc(galleryGroup.displayOrder))

    return groups
}

export type GalleryGroupDetail = {
    id: string
    name: string
    slug: string
    description: string | null
    coverImageId: string | null
    displayOrder: number
    isVisible: boolean
    createdAt: Date
    updatedAt: Date
}

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

export type GalleryGroupOption = {
    id: string
    name: string
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

// ============================================================================
// Before/After Pair Queries
// ============================================================================

export type BeforeAfterPairListItem = {
    id: string
    beforeMediaId: string
    beforeMediaUrl: string
    beforeMediaTitle: string
    afterMediaId: string
    afterMediaUrl: string
    afterMediaTitle: string
    procedureType: string | null
    timeframe: string | null
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
}

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

export type BeforeAfterPairDetail = {
    id: string
    beforeMediaId: string
    afterMediaId: string
    procedureType: string | null
    patientInfo: string | null
    timeframe: string | null
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
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

export type GalleryStats = {
    totalMedia: number
    totalImages: number
    totalVideos: number
    totalGroups: number
    totalBeforeAfterPairs: number
    publishedMedia: number
    draftMedia: number
    featuredMedia: number
}

export async function getGalleryStats(): Promise<GalleryStats> {
    const [
        totalMediaResult,
        imagesResult,
        videosResult,
        groupsResult,
        pairsResult,
        publishedResult,
        draftResult,
        featuredResult,
    ] = await Promise.all([
        db.select({ count: count() }).from(galleryMedia),
        db
            .select({ count: count() })
            .from(galleryMedia)
            .where(eq(galleryMedia.type, 'image')),
        db
            .select({ count: count() })
            .from(galleryMedia)
            .where(eq(galleryMedia.type, 'video')),
        db.select({ count: count() }).from(galleryGroup),
        db.select({ count: count() }).from(beforeAfterPair),
        db
            .select({ count: count() })
            .from(galleryMedia)
            .where(eq(galleryMedia.status, 'published')),
        db
            .select({ count: count() })
            .from(galleryMedia)
            .where(eq(galleryMedia.status, 'draft')),
        db
            .select({ count: count() })
            .from(galleryMedia)
            .where(eq(galleryMedia.isFeatured, true)),
    ])

    return {
        totalMedia: totalMediaResult[0]?.count ?? 0,
        totalImages: imagesResult[0]?.count ?? 0,
        totalVideos: videosResult[0]?.count ?? 0,
        totalGroups: groupsResult[0]?.count ?? 0,
        totalBeforeAfterPairs: pairsResult[0]?.count ?? 0,
        publishedMedia: publishedResult[0]?.count ?? 0,
        draftMedia: draftResult[0]?.count ?? 0,
        featuredMedia: featuredResult[0]?.count ?? 0,
    }
}

export type RecentMediaItem = {
    id: string
    type: 'image' | 'video'
    url: string
    title: string
    createdAt: Date
}

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
