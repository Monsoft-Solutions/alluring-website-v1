/**
 * Social Media Admin Actions
 *
 * Server actions for social media management in admin panel.
 *
 * @module lib/actions/social-media
 */
'use server'

import { db } from '@workspace/db/client'
import {
    socialMediaSettings,
    instagramPost,
    instagramPostMedia,
    galleryMedia,
} from '@workspace/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import {
    fetchInstagramPosts,
    parseInstagramPosts,
    downloadAndUploadMedia,
    getApiKey,
    type SyncResult,
} from '@/lib/services/instagram-scraper.service'

// Re-export SyncResult type for use in components
export type { SyncResult } from '@/lib/services/instagram-scraper.service'

// ============================================================================
// Types
// ============================================================================

type ActionResult = {
    success: boolean
    error?: string
}

export type InstagramSettingsInput = {
    handle: string
    apiKey?: string
    isEnabled: boolean
}

// ============================================================================
// Settings Actions
// ============================================================================

/**
 * Get or create Instagram settings
 */
export async function getInstagramSettings() {
    const settings = await db
        .select()
        .from(socialMediaSettings)
        .where(eq(socialMediaSettings.platform, 'instagram'))
        .limit(1)

    return settings[0] ?? null
}

/**
 * Update Instagram settings
 */
export async function updateInstagramSettings(
    data: InstagramSettingsInput
): Promise<ActionResult> {
    try {
        const existing = await db
            .select()
            .from(socialMediaSettings)
            .where(eq(socialMediaSettings.platform, 'instagram'))
            .limit(1)

        if (existing.length > 0 && existing[0]) {
            await db
                .update(socialMediaSettings)
                .set({
                    handle: data.handle || null,
                    apiKey: data.apiKey || null,
                    isEnabled: data.isEnabled,
                })
                .where(eq(socialMediaSettings.id, existing[0].id))
        } else {
            await db.insert(socialMediaSettings).values({
                platform: 'instagram',
                handle: data.handle || null,
                apiKey: data.apiKey || null,
                isEnabled: data.isEnabled,
            })
        }

        revalidatePath('/social-media')
        revalidatePath('/social-media/settings')

        return { success: true }
    } catch (error) {
        console.error('Error updating Instagram settings:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update settings',
        }
    }
}

// ============================================================================
// Sync Actions
// ============================================================================

/**
 * Generate a unique slug for gallery media
 */
function generateMediaSlug(code: string, index?: number): string {
    const suffix = index !== undefined ? `-${index}` : ''
    const timestamp = Date.now()
    return `ig-${code}${suffix}-${timestamp}`
}

/**
 * Generate a title from the caption or code
 */
function generateMediaTitle(
    caption: string | null,
    code: string,
    index?: number
): string {
    const suffix = index !== undefined ? ` (${index + 1})` : ''
    if (caption) {
        // Take first 50 chars of caption for title
        const shortCaption = caption.substring(0, 50).trim()
        return shortCaption + (caption.length > 50 ? '...' : '') + suffix
    }
    return `Instagram Post ${code}${suffix}`
}

/**
 * Options for syncing Instagram posts
 */
export type SyncInstagramPostsOptions = {
    /**
     * If true, resets the cursor and starts syncing from the beginning.
     * Use this for "Sync All" functionality.
     */
    resetCursor?: boolean
}

/**
 * Sync Instagram posts from the configured profile
 *
 * @param options - Optional configuration for sync behavior
 * @param options.resetCursor - If true, starts from the beginning instead of continuing from last cursor
 */
export async function syncInstagramPosts(
    options?: SyncInstagramPostsOptions
): Promise<SyncResult> {
    const { resetCursor = false } = options ?? {}

    const result: SyncResult = {
        success: false,
        newPostsCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: [],
        nextCursor: null,
        hasMore: false,
    }

    try {
        // Get settings
        const settings = await getInstagramSettings()

        if (!settings) {
            return {
                ...result,
                errors: ['Instagram settings not configured'],
            }
        }

        if (!settings.handle) {
            return {
                ...result,
                errors: ['Instagram handle not configured'],
            }
        }

        if (!settings.isEnabled) {
            return {
                ...result,
                errors: ['Instagram integration is disabled'],
            }
        }

        const apiKey = getApiKey(settings.apiKey)
        if (!apiKey) {
            return {
                ...result,
                errors: ['API key not configured'],
            }
        }

        // Determine cursor: use null if resetCursor is true, otherwise use stored cursor
        const cursor = resetCursor
            ? undefined
            : (settings.lastSyncCursor ?? undefined)

        // Fetch posts from API
        const apiResponse = await fetchInstagramPosts(
            settings.handle,
            apiKey,
            cursor
        )

        const parsedPosts = parseInstagramPosts(apiResponse)

        // Process each post
        for (const post of parsedPosts) {
            try {
                // Check if post already exists
                const existing = await db
                    .select({ id: instagramPost.id })
                    .from(instagramPost)
                    .where(eq(instagramPost.instagramId, post.instagramId))
                    .limit(1)

                if (existing.length > 0) {
                    result.skippedCount++
                    continue
                }

                // Skip if no primary media URL
                if (!post.primaryMediaUrl) {
                    result.errorCount++
                    result.errors.push(`No media URL for post ${post.code}`)
                    continue
                }

                // Download and upload primary media
                const primaryMedia = await downloadAndUploadMedia(
                    post.primaryMediaUrl,
                    `${post.code}-primary`
                )

                // For videos: download and upload thumbnail first
                let thumbnailBlobUrl: string | null = null
                if (post.mediaType === 'video' && post.thumbnailUrl) {
                    try {
                        const thumbnailMedia = await downloadAndUploadMedia(
                            post.thumbnailUrl,
                            `${post.code}-thumb`
                        )
                        thumbnailBlobUrl = thumbnailMedia.url
                    } catch (thumbError) {
                        console.error(
                            `Failed to upload thumbnail for ${post.code}:`,
                            thumbError
                        )
                        // Continue without thumbnail
                    }
                }

                // Create gallery_media record for primary media (with thumbnailUrl for videos)
                const [primaryGalleryMedia] = await db
                    .insert(galleryMedia)
                    .values({
                        type: post.mediaType === 'video' ? 'video' : 'image',
                        url: primaryMedia.url,
                        thumbnailUrl: thumbnailBlobUrl,
                        title: generateMediaTitle(post.caption, post.code),
                        slug: generateMediaSlug(post.code),
                        description: post.caption,
                        alt: `Instagram post from ${settings.handle}`,
                        mimeType: primaryMedia.mimeType,
                        fileSize: primaryMedia.fileSize,
                        duration:
                            post.mediaType === 'video'
                                ? post.videoDuration
                                : null,
                        status: 'draft',
                    })
                    .returning({ id: galleryMedia.id })

                // Create instagram_post record
                const [newPost] = await db
                    .insert(instagramPost)
                    .values({
                        instagramId: post.instagramId,
                        code: post.code,
                        mediaType: post.mediaType,
                        caption: post.caption,
                        permalink: post.permalink,
                        takenAt: post.takenAt,
                        likeCount: post.likeCount,
                        commentCount: post.commentCount,
                        playCount: post.playCount,
                        videoDuration: post.videoDuration,
                        mediaId: primaryGalleryMedia!.id,
                        isPublished: false,
                    })
                    .returning({ id: instagramPost.id })

                // Handle carousel items
                if (
                    post.mediaType === 'carousel' &&
                    post.carouselItems.length > 0
                ) {
                    for (const item of post.carouselItems) {
                        try {
                            const itemMedia = await downloadAndUploadMedia(
                                item.mediaUrl,
                                `${post.code}-carousel-${item.order}`
                            )

                            const [itemGalleryMedia] = await db
                                .insert(galleryMedia)
                                .values({
                                    type: item.mediaType,
                                    url: itemMedia.url,
                                    title: generateMediaTitle(
                                        post.caption,
                                        post.code,
                                        item.order
                                    ),
                                    slug: generateMediaSlug(
                                        post.code,
                                        item.order
                                    ),
                                    description: post.caption,
                                    alt: `Instagram carousel item from ${settings.handle}`,
                                    mimeType: itemMedia.mimeType,
                                    fileSize: itemMedia.fileSize,
                                    status: 'draft',
                                })
                                .returning({ id: galleryMedia.id })

                            // Create junction record
                            await db.insert(instagramPostMedia).values({
                                postId: newPost!.id,
                                mediaId: itemGalleryMedia!.id,
                                displayOrder: item.order,
                            })
                        } catch (itemError) {
                            console.error(
                                `Failed to upload carousel item ${item.order} for ${post.code}:`,
                                itemError
                            )
                            // Continue with other items
                        }
                    }
                }

                result.newPostsCount++
            } catch (postError) {
                console.error(`Error processing post ${post.code}:`, postError)
                result.errorCount++
                result.errors.push(
                    `Failed to process post ${post.code}: ${postError instanceof Error ? postError.message : 'Unknown error'}`
                )
            }
        }

        // Update sync cursor
        if (apiResponse.next_max_id) {
            await db
                .update(socialMediaSettings)
                .set({
                    lastSyncAt: new Date(),
                    lastSyncCursor: apiResponse.next_max_id,
                })
                .where(eq(socialMediaSettings.platform, 'instagram'))
        } else {
            await db
                .update(socialMediaSettings)
                .set({
                    lastSyncAt: new Date(),
                })
                .where(eq(socialMediaSettings.platform, 'instagram'))
        }

        result.success = true
        result.nextCursor = apiResponse.next_max_id ?? null
        result.hasMore = apiResponse.more_available

        revalidatePath('/social-media')
        revalidatePath('/social-media/instagram')

        return result
    } catch (error) {
        console.error('Error syncing Instagram posts:', error)
        return {
            ...result,
            errors: [
                error instanceof Error
                    ? error.message
                    : 'Unknown error during sync',
            ],
        }
    }
}

/**
 * Reset sync cursor to fetch posts from the beginning
 */
export async function resetInstagramSyncCursor(): Promise<ActionResult> {
    try {
        await db
            .update(socialMediaSettings)
            .set({
                lastSyncCursor: null,
            })
            .where(eq(socialMediaSettings.platform, 'instagram'))

        revalidatePath('/social-media')
        revalidatePath('/social-media/settings')

        return { success: true }
    } catch (error) {
        console.error('Error resetting sync cursor:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to reset cursor',
        }
    }
}

/**
 * Toggle Instagram post published status
 */
export async function toggleInstagramPostPublished(
    postId: string,
    isPublished: boolean
): Promise<ActionResult> {
    try {
        await db
            .update(instagramPost)
            .set({ isPublished })
            .where(eq(instagramPost.id, postId))

        revalidatePath('/social-media/instagram')

        return { success: true }
    } catch (error) {
        console.error('Error toggling post published status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update post',
        }
    }
}

/**
 * Toggle Instagram post featured status
 */
export async function toggleInstagramPostFeatured(
    postId: string,
    isFeatured: boolean
): Promise<ActionResult> {
    try {
        await db
            .update(instagramPost)
            .set({ isFeatured })
            .where(eq(instagramPost.id, postId))

        revalidatePath('/social-media/instagram')

        return { success: true }
    } catch (error) {
        console.error('Error toggling post featured status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update post',
        }
    }
}
