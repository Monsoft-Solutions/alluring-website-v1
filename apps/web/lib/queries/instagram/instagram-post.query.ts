/**
 * Instagram Post Query
 *
 * Query for individual Instagram posts by code.
 * Used for individual post pages and SEO.
 *
 * @module lib/queries/instagram/instagram-post
 */
import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { CACHE_TAGS } from '@workspace/shared/cache'
import {
    instagramPost,
    instagramPostMedia,
} from '@workspace/db/schema/social-media'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { desc, eq, ne } from 'drizzle-orm'

import type { InstagramPostPublic } from '@/lib/types/instagram.type'

/** Cache revalidation time in seconds (1 hour) */
const CACHE_TTL = 3600

/**
 * Internal function to fetch a single Instagram post by code
 */
async function fetchInstagramPostByCode(
    code: string
): Promise<InstagramPostPublic | null> {
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
            // Video metadata for SEO
            mediaWidth: galleryMedia.width,
            mediaHeight: galleryMedia.height,
            videoDuration: instagramPost.videoDuration,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .where(eq(instagramPost.code, code))
        .limit(1)

    if (posts.length === 0) return null

    const post = posts[0]!

    // Get carousel media if it's a carousel
    let carouselMedia: InstagramPostPublic['carouselMedia'] = undefined
    let carouselCount: number | undefined = undefined

    if (post.mediaType === 'carousel') {
        const carouselItems = await db
            .select({
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
            .where(eq(instagramPostMedia.postId, post.id))
            .orderBy(instagramPostMedia.displayOrder)

        carouselMedia = carouselItems.map((item) => ({
            id: item.mediaId,
            url: item.url,
            type: item.type,
            displayOrder: item.displayOrder,
        }))
        carouselCount = carouselItems.length
    }

    return {
        id: post.id,
        code: post.code,
        mediaType: post.mediaType,
        caption: post.caption,
        seoTitle: post.seoTitle,
        permalink: post.permalink,
        takenAt: post.takenAt,
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
        playCount: post.playCount,
        media: {
            id: post.mediaId,
            url: post.mediaUrl,
            thumbnailUrl: post.mediaThumbnailUrl,
            type: post.mediaType_gallery,
            // Video metadata for SEO
            width: post.mediaWidth,
            height: post.mediaHeight,
            duration: post.videoDuration,
        },
        carouselCount,
        carouselMedia,
    }
}

/**
 * Get a single Instagram post by code with caching
 *
 * @param code - Instagram post shortcode
 * @returns Post or null if not found
 */
export function getInstagramPostByCode(
    code: string
): Promise<InstagramPostPublic | null> {
    return unstable_cache(
        () => fetchInstagramPostByCode(code),
        [`instagram-post-${code}`],
        {
            tags: [
                CACHE_TAGS.INSTAGRAM_POSTS,
                CACHE_TAGS.instagramPostByCode(code),
            ],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get all Instagram post codes for static generation
 *
 * @returns Array of post codes
 */
export async function getAllInstagramPostCodes(): Promise<string[]> {
    return unstable_cache(
        async () => {
            const posts = await db
                .select({ code: instagramPost.code })
                .from(instagramPost)
                .orderBy(desc(instagramPost.takenAt))

            return posts.map((p) => p.code)
        },
        ['instagram-all-codes'],
        {
            tags: [CACHE_TAGS.INSTAGRAM_POSTS],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get more Instagram posts for related content
 * Excludes the specified post ID and returns most recent posts
 *
 * @param excludeId - Post ID to exclude from results
 * @param limit - Number of posts to return (default 6)
 * @returns Array of Instagram posts
 */
export async function getMoreInstagramPosts(
    excludeId: string,
    limit = 6
): Promise<InstagramPostPublic[]> {
    return unstable_cache(
        async () => {
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
                    // Video metadata for SEO
                    mediaWidth: galleryMedia.width,
                    mediaHeight: galleryMedia.height,
                    videoDuration: instagramPost.videoDuration,
                })
                .from(instagramPost)
                .innerJoin(
                    galleryMedia,
                    eq(instagramPost.mediaId, galleryMedia.id)
                )
                .where(ne(instagramPost.id, excludeId))
                .orderBy(desc(instagramPost.takenAt), desc(instagramPost.id))
                .limit(limit)

            return posts.map((p) => ({
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
                    // Video metadata for SEO
                    width: p.mediaWidth,
                    height: p.mediaHeight,
                    duration: p.videoDuration,
                },
                carouselCount: undefined,
                carouselMedia: undefined,
            }))
        },
        [`instagram-more-posts-${excludeId}-${limit}`],
        {
            tags: [CACHE_TAGS.INSTAGRAM_POSTS],
            revalidate: CACHE_TTL,
        }
    )()
}
