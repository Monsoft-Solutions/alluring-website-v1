/**
 * Social Media Queries
 *
 * Database queries for social media management in admin panel.
 *
 * @module lib/queries/social-media
 */
import { db } from '@workspace/db/client'
import {
    socialMediaSettings,
    instagramPost,
    instagramPostMedia,
    galleryMedia,
} from '@workspace/db/schema'
import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'

// ============================================================================
// Types
// ============================================================================

export type InstagramAnalysisStatus =
    | 'pending'
    | 'analyzed'
    | 'reviewed'
    | 'applied'

export type InstagramPostListItem = {
    id: string
    instagramId: string
    code: string
    mediaType: 'image' | 'video' | 'carousel'
    caption: string | null
    permalink: string
    takenAt: Date
    likeCount: number
    commentCount: number
    playCount: number | null
    isPublished: boolean
    isFeatured: boolean
    analysisStatus: InstagramAnalysisStatus
    createdAt: Date
    media: {
        id: string
        url: string
        thumbnailUrl: string | null
        type: 'image' | 'video'
        aiAnalysis?: GalleryMediaAIAnalysis | null
    }
    carouselCount?: number
    carouselMedia?: Array<{
        id: string
        url: string
        type: 'image' | 'video'
        displayOrder: number
        aiAnalysis?: GalleryMediaAIAnalysis | null
    }>
}

export type InstagramPostSortBy = 'date' | 'likes' | 'views'

export type InstagramPostSortDirection = 'asc' | 'desc'

export type InstagramMediaTypeFilter = 'all' | 'image' | 'video' | 'carousel'

export type InstagramAnalysisStatusFilter =
    | 'all'
    | 'pending'
    | 'analyzed'
    | 'reviewed'
    | 'applied'

export type InstagramPostWithMedia = InstagramPostListItem & {
    carouselMedia: Array<{
        id: string
        url: string
        type: 'image' | 'video'
        displayOrder: number
        aiAnalysis?: GalleryMediaAIAnalysis | null
    }>
}

export type SocialMediaStats = {
    totalPosts: number
    publishedPosts: number
    featuredPosts: number
    lastSyncAt: Date | null
}

// ============================================================================
// Settings Queries
// ============================================================================

/**
 * Get Instagram settings
 */
export async function getInstagramSettings() {
    const settings = await db
        .select()
        .from(socialMediaSettings)
        .where(eq(socialMediaSettings.platform, 'instagram'))
        .limit(1)

    return settings[0] ?? null
}

// ============================================================================
// Instagram Post Queries
// ============================================================================

/**
 * Get Instagram posts with pagination
 */
export async function getInstagramPosts(options: {
    page?: number
    pageSize?: number
    publishedOnly?: boolean
    featuredOnly?: boolean
    sortBy?: InstagramPostSortBy
    sortDirection?: InstagramPostSortDirection
    mediaType?: InstagramMediaTypeFilter
    analysisStatus?: InstagramAnalysisStatusFilter
}): Promise<{ posts: InstagramPostListItem[]; total: number }> {
    const {
        page = 1,
        pageSize = 20,
        publishedOnly = false,
        featuredOnly = false,
        sortBy = 'date',
        sortDirection = 'desc',
        mediaType = 'all',
        analysisStatus = 'all',
    } = options
    const offset = (page - 1) * pageSize

    // Build conditions
    const conditions = []
    if (publishedOnly) {
        conditions.push(eq(instagramPost.isPublished, true))
    }
    if (featuredOnly) {
        conditions.push(eq(instagramPost.isFeatured, true))
    }
    if (mediaType && mediaType !== 'all') {
        conditions.push(eq(instagramPost.mediaType, mediaType))
    }
    if (analysisStatus && analysisStatus !== 'all') {
        conditions.push(eq(instagramPost.analysisStatus, analysisStatus))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const orderByClause =
        sortBy === 'likes'
            ? sortDirection === 'asc'
                ? [
                      asc(instagramPost.likeCount),
                      desc(instagramPost.takenAt),
                      desc(instagramPost.id),
                  ]
                : [
                      desc(instagramPost.likeCount),
                      desc(instagramPost.takenAt),
                      desc(instagramPost.id),
                  ]
            : sortBy === 'views'
              ? sortDirection === 'asc'
                  ? [
                        asc(instagramPost.playCount),
                        desc(instagramPost.takenAt),
                        desc(instagramPost.id),
                    ]
                  : [
                        desc(instagramPost.playCount),
                        desc(instagramPost.takenAt),
                        desc(instagramPost.id),
                    ]
              : sortDirection === 'asc'
                ? [asc(instagramPost.takenAt), desc(instagramPost.id)]
                : [desc(instagramPost.takenAt), desc(instagramPost.id)]

    // Get posts with media
    const posts = await db
        .select({
            id: instagramPost.id,
            instagramId: instagramPost.instagramId,
            code: instagramPost.code,
            mediaType: instagramPost.mediaType,
            caption: instagramPost.caption,
            permalink: instagramPost.permalink,
            takenAt: instagramPost.takenAt,
            likeCount: instagramPost.likeCount,
            commentCount: instagramPost.commentCount,
            playCount: instagramPost.playCount,
            isPublished: instagramPost.isPublished,
            isFeatured: instagramPost.isFeatured,
            analysisStatus: instagramPost.analysisStatus,
            createdAt: instagramPost.createdAt,
            mediaId: instagramPost.mediaId,
            mediaUrl: galleryMedia.url,
            mediaThumbnailUrl: galleryMedia.thumbnailUrl,
            mediaTypeGallery: galleryMedia.type,
            mediaAiAnalysis: galleryMedia.aiAnalysis,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(pageSize)
        .offset(offset)

    // Get total count
    const [countResult] = await db
        .select({ count: count() })
        .from(instagramPost)
        .where(whereClause)

    // Get carousel counts for carousel posts
    const carouselPostIds = posts
        .filter((p) => p.mediaType === 'carousel')
        .map((p) => p.id)

    let carouselCounts: Record<string, number> = {}
    let carouselMediaMap: Record<
        string,
        Array<{
            id: string
            url: string
            type: 'image' | 'video'
            displayOrder: number
            aiAnalysis?: GalleryMediaAIAnalysis | null
        }>
    > = {}
    if (carouselPostIds.length > 0) {
        const counts = await db
            .select({
                postId: instagramPostMedia.postId,
                count: count(),
            })
            .from(instagramPostMedia)
            .where(inArray(instagramPostMedia.postId, carouselPostIds))
            .groupBy(instagramPostMedia.postId)

        carouselCounts = counts.reduce(
            (acc, item) => {
                acc[item.postId] = item.count
                return acc
            },
            {} as Record<string, number>
        )

        const carouselItems = await db
            .select({
                postId: instagramPostMedia.postId,
                mediaId: instagramPostMedia.mediaId,
                displayOrder: instagramPostMedia.displayOrder,
                url: galleryMedia.url,
                type: galleryMedia.type,
                aiAnalysis: galleryMedia.aiAnalysis,
            })
            .from(instagramPostMedia)
            .innerJoin(
                galleryMedia,
                eq(instagramPostMedia.mediaId, galleryMedia.id)
            )
            .where(inArray(instagramPostMedia.postId, carouselPostIds))
            .orderBy(instagramPostMedia.postId, instagramPostMedia.displayOrder)

        carouselMediaMap = carouselItems.reduce(
            (acc, item) => {
                if (!acc[item.postId]) {
                    acc[item.postId] = []
                }

                acc[item.postId]?.push({
                    id: item.mediaId,
                    url: item.url,
                    type: item.type,
                    displayOrder: item.displayOrder,
                    aiAnalysis: item.aiAnalysis,
                })

                return acc
            },
            {} as Record<
                string,
                Array<{
                    id: string
                    url: string
                    type: 'image' | 'video'
                    displayOrder: number
                    aiAnalysis?: GalleryMediaAIAnalysis | null
                }>
            >
        )
    }

    return {
        posts: posts.map((p) => ({
            id: p.id,
            instagramId: p.instagramId,
            code: p.code,
            mediaType: p.mediaType,
            caption: p.caption,
            permalink: p.permalink,
            takenAt: p.takenAt,
            likeCount: p.likeCount ?? 0,
            commentCount: p.commentCount ?? 0,
            playCount: p.playCount,
            isPublished: p.isPublished,
            isFeatured: p.isFeatured,
            analysisStatus: p.analysisStatus,
            createdAt: p.createdAt,
            media: {
                id: p.mediaId,
                url: p.mediaUrl,
                thumbnailUrl: p.mediaThumbnailUrl,
                type: p.mediaTypeGallery,
                aiAnalysis: p.mediaAiAnalysis,
            },
            carouselCount: carouselCounts[p.id],
            carouselMedia:
                carouselMediaMap[p.id]?.sort(
                    (a, b) => a.displayOrder - b.displayOrder
                ) ?? undefined,
        })),
        total: countResult?.count ?? 0,
    }
}

/**
 * Get single Instagram post with all media
 */
export async function getInstagramPostById(
    id: string
): Promise<InstagramPostWithMedia | null> {
    const posts = await db
        .select({
            id: instagramPost.id,
            instagramId: instagramPost.instagramId,
            code: instagramPost.code,
            mediaType: instagramPost.mediaType,
            caption: instagramPost.caption,
            permalink: instagramPost.permalink,
            takenAt: instagramPost.takenAt,
            likeCount: instagramPost.likeCount,
            commentCount: instagramPost.commentCount,
            playCount: instagramPost.playCount,
            isPublished: instagramPost.isPublished,
            isFeatured: instagramPost.isFeatured,
            analysisStatus: instagramPost.analysisStatus,
            createdAt: instagramPost.createdAt,
            mediaId: instagramPost.mediaId,
            mediaUrl: galleryMedia.url,
            mediaThumbnailUrl: galleryMedia.thumbnailUrl,
            mediaTypeGallery: galleryMedia.type,
            mediaAiAnalysis: galleryMedia.aiAnalysis,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .where(eq(instagramPost.id, id))
        .limit(1)

    if (posts.length === 0) return null

    const post = posts[0]!

    // Get carousel media if it's a carousel
    let carouselMedia: InstagramPostWithMedia['carouselMedia'] = []
    if (post.mediaType === 'carousel') {
        const carouselItems = await db
            .select({
                mediaId: instagramPostMedia.mediaId,
                displayOrder: instagramPostMedia.displayOrder,
                url: galleryMedia.url,
                type: galleryMedia.type,
                aiAnalysis: galleryMedia.aiAnalysis,
            })
            .from(instagramPostMedia)
            .innerJoin(
                galleryMedia,
                eq(instagramPostMedia.mediaId, galleryMedia.id)
            )
            .where(eq(instagramPostMedia.postId, id))
            .orderBy(instagramPostMedia.displayOrder)

        carouselMedia = carouselItems.map((item) => ({
            id: item.mediaId,
            url: item.url,
            type: item.type,
            displayOrder: item.displayOrder,
            aiAnalysis: item.aiAnalysis,
        }))
    }

    return {
        id: post.id,
        instagramId: post.instagramId,
        code: post.code,
        mediaType: post.mediaType,
        caption: post.caption,
        permalink: post.permalink,
        takenAt: post.takenAt,
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
        playCount: post.playCount,
        isPublished: post.isPublished,
        isFeatured: post.isFeatured,
        analysisStatus: post.analysisStatus,
        createdAt: post.createdAt,
        media: {
            id: post.mediaId,
            url: post.mediaUrl,
            thumbnailUrl: post.mediaThumbnailUrl,
            type: post.mediaTypeGallery,
            aiAnalysis: post.mediaAiAnalysis,
        },
        carouselMedia,
    }
}

/**
 * Get posts available for bulk analysis (pending status, images/carousels only)
 */
export async function getPostsForAnalysis(options: {
    page?: number
    pageSize?: number
}): Promise<{ posts: InstagramPostListItem[]; total: number }> {
    return getInstagramPosts({
        ...options,
        analysisStatus: 'pending',
        // Note: We filter videos in the analysis action, not here
        // This allows users to see all pending posts
    })
}

/**
 * Get analysis status counts for dashboard
 */
export async function getAnalysisStatusCounts(): Promise<{
    pending: number
    analyzed: number
    reviewed: number
    applied: number
}> {
    const [pendingResult] = await db
        .select({ count: count() })
        .from(instagramPost)
        .where(eq(instagramPost.analysisStatus, 'pending'))

    const [analyzedResult] = await db
        .select({ count: count() })
        .from(instagramPost)
        .where(eq(instagramPost.analysisStatus, 'analyzed'))

    const [reviewedResult] = await db
        .select({ count: count() })
        .from(instagramPost)
        .where(eq(instagramPost.analysisStatus, 'reviewed'))

    const [appliedResult] = await db
        .select({ count: count() })
        .from(instagramPost)
        .where(eq(instagramPost.analysisStatus, 'applied'))

    return {
        pending: pendingResult?.count ?? 0,
        analyzed: analyzedResult?.count ?? 0,
        reviewed: reviewedResult?.count ?? 0,
        applied: appliedResult?.count ?? 0,
    }
}

/**
 * Get social media dashboard stats
 */
export async function getSocialMediaStats(): Promise<SocialMediaStats> {
    // Get post counts
    const [totalResult] = await db
        .select({ count: count() })
        .from(instagramPost)

    const [publishedResult] = await db
        .select({ count: count() })
        .from(instagramPost)
        .where(eq(instagramPost.isPublished, true))

    const [featuredResult] = await db
        .select({ count: count() })
        .from(instagramPost)
        .where(eq(instagramPost.isFeatured, true))

    // Get last sync time
    const settings = await getInstagramSettings()

    return {
        totalPosts: totalResult?.count ?? 0,
        publishedPosts: publishedResult?.count ?? 0,
        featuredPosts: featuredResult?.count ?? 0,
        lastSyncAt: settings?.lastSyncAt ?? null,
    }
}
