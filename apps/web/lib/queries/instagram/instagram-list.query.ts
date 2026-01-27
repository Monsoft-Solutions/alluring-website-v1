/**
 * Instagram List Query
 *
 * Paginated query for Instagram posts on the public website.
 * Returns all synced posts ordered by publication date.
 *
 * @module lib/queries/instagram/instagram-list
 */
import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import {
    instagramPost,
    instagramPostMedia,
} from '@workspace/db/schema/social-media'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { count, desc, eq, inArray } from 'drizzle-orm'

import type {
    InstagramPostPublic,
    InstagramPostsResult,
} from '@/lib/types/instagram.type'

/** Cache revalidation time in seconds (1 hour) */
const CACHE_TTL = 3600

/** Default page size for pagination */
const DEFAULT_PAGE_SIZE = 24

/**
 * Internal function to fetch paginated Instagram posts
 */
async function fetchInstagramPosts(options: {
    page: number
    pageSize: number
}): Promise<InstagramPostsResult> {
    const { page, pageSize } = options
    const offset = (page - 1) * pageSize

    // Get posts with primary media
    const posts = await db
        .select({
            id: instagramPost.id,
            code: instagramPost.code,
            mediaType: instagramPost.mediaType,
            caption: instagramPost.caption,
            seoTitle: instagramPost.seoTitle,
            permalink: instagramPost.permalink,
            takenAt: instagramPost.takenAt,
            likeCount: instagramPost.likeCount,
            commentCount: instagramPost.commentCount,
            playCount: instagramPost.playCount,
            mediaId: instagramPost.mediaId,
            mediaUrl: galleryMedia.url,
            mediaThumbnailUrl: galleryMedia.thumbnailUrl,
            mediaType_gallery: galleryMedia.type,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .orderBy(desc(instagramPost.takenAt), desc(instagramPost.id))
        .limit(pageSize)
        .offset(offset)

    // Get total count
    const [countResult] = await db
        .select({ count: count() })
        .from(instagramPost)

    const total = countResult?.count ?? 0
    const totalPages = Math.ceil(total / pageSize)

    // Get carousel counts and media for carousel posts
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
        }>
    > = {}

    if (carouselPostIds.length > 0) {
        // Get carousel counts
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

        // Get carousel media
        const carouselItems = await db
            .select({
                postId: instagramPostMedia.postId,
                mediaId: instagramPostMedia.mediaId,
                displayOrder: instagramPostMedia.displayOrder,
                url: galleryMedia.url,
                type: galleryMedia.type,
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
                }>
            >
        )
    }

    // Map to public type
    const mappedPosts: InstagramPostPublic[] = posts.map((p) => ({
        id: p.id,
        code: p.code,
        mediaType: p.mediaType,
        caption: p.caption,
        seoTitle: p.seoTitle,
        permalink: p.permalink,
        takenAt: p.takenAt,
        likeCount: p.likeCount ?? 0,
        commentCount: p.commentCount ?? 0,
        playCount: p.playCount,
        media: {
            id: p.mediaId,
            url: p.mediaUrl,
            thumbnailUrl: p.mediaThumbnailUrl,
            type: p.mediaType_gallery,
        },
        carouselCount: carouselCounts[p.id],
        carouselMedia:
            carouselMediaMap[p.id]?.sort(
                (a, b) => a.displayOrder - b.displayOrder
            ) ?? undefined,
    }))

    return {
        posts: mappedPosts,
        total,
        page,
        pageSize,
        totalPages,
    }
}

/**
 * Get paginated Instagram posts with caching
 *
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of posts per page
 * @returns Paginated posts result
 */
export function getInstagramPosts(
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE
): Promise<InstagramPostsResult> {
    const cacheKey = `instagram-posts-${page}-${pageSize}`

    return unstable_cache(
        () => fetchInstagramPosts({ page, pageSize }),
        [cacheKey],
        {
            tags: [CACHE_TAGS.INSTAGRAM_POSTS],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get total count of Instagram posts
 */
export async function getInstagramPostCount(): Promise<number> {
    return unstable_cache(
        async () => {
            const [result] = await db
                .select({ count: count() })
                .from(instagramPost)
            return result?.count ?? 0
        },
        ['instagram-post-count'],
        {
            tags: [CACHE_TAGS.INSTAGRAM_POSTS],
            revalidate: CACHE_TTL,
        }
    )()
}
