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
    type ParsedInstagramPost,
} from '@/lib/services/instagram-scraper.service'
import {
    fetchInstagramProfile,
    parseInstagramProfile,
    uploadProfilePicture,
    type InstagramProfileData,
} from '@/lib/services/instagram-profile.service'

// Re-export SyncResult type for use in components
export type { SyncResult } from '@/lib/services/instagram-scraper.service'

/**
 * Result of profile sync operation
 */
export type ProfileSyncResult = {
    success: boolean
    error?: string
    postsCount?: number
    profileData?: InstagramProfileData
}

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

/**
 * Result of processing a single Instagram post
 */
type PostProcessResult = {
    status: 'new' | 'skipped' | 'error'
    code: string
    error?: string
}

/**
 * Concurrency limit for parallel post processing
 */
const CONCURRENT_LIMIT = 5

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
 * Sync Instagram profile metadata
 *
 * Fetches profile data from Instagram, uploads profile picture to Vercel Blob,
 * and stores metadata in social_media_settings.
 */
export async function syncInstagramProfile(): Promise<ProfileSyncResult> {
    try {
        // Get settings
        const settings = await getInstagramSettings()

        if (!settings) {
            return {
                success: false,
                error: 'Instagram settings not configured',
            }
        }

        if (!settings.handle) {
            return {
                success: false,
                error: 'Instagram handle not configured',
            }
        }

        if (!settings.isEnabled) {
            return {
                success: false,
                error: 'Instagram integration is disabled',
            }
        }

        const apiKey = getApiKey(settings.apiKey)
        if (!apiKey) {
            return {
                success: false,
                error: 'API key not configured',
            }
        }

        // Fetch profile data from API
        const profileResponse = await fetchInstagramProfile(
            settings.handle,
            apiKey
        )

        // Upload profile picture to Vercel Blob
        const profilePicHdUrl = profileResponse.data.user.profile_pic_url_hd
        const uploadedPicture = await uploadProfilePicture(
            profilePicHdUrl,
            settings.handle
        )

        // Parse profile data
        const profileData = parseInstagramProfile(
            profileResponse,
            uploadedPicture.url
        )

        // Update settings with profile data
        await db
            .update(socialMediaSettings)
            .set({
                fullName: profileData.fullName,
                biography: profileData.biography,
                profilePictureUrl: profileData.profilePictureUrl,
                externalUrl: profileData.externalUrl,
                followersCount: profileData.followersCount,
                followingCount: profileData.followingCount,
                postsCount: profileData.postsCount,
                isBusinessAccount: profileData.isBusinessAccount,
                isProfessionalAccount: profileData.isProfessionalAccount,
                isPrivate: profileData.isPrivate,
                isVerified: profileData.isVerified,
                categoryName: profileData.categoryName,
                businessAddress: profileData.businessAddress,
                profileLastFetchedAt: new Date(),
            })
            .where(eq(socialMediaSettings.platform, 'instagram'))

        return {
            success: true,
            postsCount: profileData.postsCount,
            profileData,
        }
    } catch (error) {
        console.error('Error syncing Instagram profile:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to sync profile',
        }
    }
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

        const existingRecord = existing[0]
        const handleChanged =
            data.handle && data.handle !== existingRecord?.handle
        const isFirstTimeSetup = !existingRecord && data.handle

        if (existingRecord) {
            await db
                .update(socialMediaSettings)
                .set({
                    handle: data.handle || null,
                    apiKey: data.apiKey || null,
                    isEnabled: data.isEnabled,
                })
                .where(eq(socialMediaSettings.id, existingRecord.id))
        } else {
            await db.insert(socialMediaSettings).values({
                platform: 'instagram',
                handle: data.handle || null,
                apiKey: data.apiKey || null,
                isEnabled: data.isEnabled,
            })
        }

        // If handle was set for the first time or changed, sync profile
        if ((isFirstTimeSetup || handleChanged) && data.isEnabled) {
            // Sync profile in background (don't block settings save)
            syncInstagramProfile().catch((error) => {
                console.error('Background profile sync failed:', error)
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
 * Simple concurrency limiter for parallel processing
 *
 * @param tasks - Array of async functions to execute
 * @param limit - Maximum number of concurrent tasks
 * @returns Array of results in the same order as input tasks
 */
async function runWithConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
): Promise<Array<PromiseSettledResult<T>>> {
    const results: Array<PromiseSettledResult<T>> = []
    const executing: Array<Promise<void>> = []

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]!
        const resultIndex = i

        const promise = task()
            .then((value) => {
                results[resultIndex] = { status: 'fulfilled', value }
            })
            .catch((reason) => {
                results[resultIndex] = { status: 'rejected', reason }
            })
            .then(() => {
                // Remove from executing array when done
                const idx = executing.indexOf(promise as Promise<void>)
                if (idx > -1) executing.splice(idx, 1)
            })

        executing.push(promise as Promise<void>)

        // If we've reached the concurrency limit, wait for one to finish
        if (executing.length >= limit) {
            await Promise.race(executing)
        }
    }

    // Wait for all remaining tasks to complete
    await Promise.all(executing)

    return results
}

/**
 * Process a single Instagram post
 *
 * Downloads media, creates gallery entries, and stores post data.
 * Returns result indicating if post was new, skipped, or had an error.
 */
async function processIndividualPost(
    post: ParsedInstagramPost,
    handle: string
): Promise<PostProcessResult> {
    try {
        // Check if post already exists
        const existing = await db
            .select({ id: instagramPost.id })
            .from(instagramPost)
            .where(eq(instagramPost.instagramId, post.instagramId))
            .limit(1)

        if (existing.length > 0) {
            return { status: 'skipped', code: post.code }
        }

        // Skip if no primary media URL
        if (!post.primaryMediaUrl) {
            return {
                status: 'error',
                code: post.code,
                error: `No media URL for post ${post.code}`,
            }
        }

        // Download and upload primary media
        const primaryMedia = await downloadAndUploadMedia(
            post.primaryMediaUrl,
            `${post.code}-primary`
        )

        // For videos: download and upload thumbnail
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

        // Create gallery_media record for primary media
        const [primaryGalleryMedia] = await db
            .insert(galleryMedia)
            .values({
                type: post.mediaType === 'video' ? 'video' : 'image',
                url: primaryMedia.url,
                thumbnailUrl: thumbnailBlobUrl,
                title: generateMediaTitle(post.caption, post.code),
                slug: generateMediaSlug(post.code),
                description: post.caption,
                alt: `Instagram post from ${handle}`,
                mimeType: primaryMedia.mimeType,
                fileSize: primaryMedia.fileSize,
                duration:
                    post.mediaType === 'video' ? post.videoDuration : null,
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

        // Handle carousel items (process in parallel within this post)
        if (post.mediaType === 'carousel' && post.carouselItems.length > 0) {
            const carouselTasks = post.carouselItems.map((item) => async () => {
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
                        slug: generateMediaSlug(post.code, item.order),
                        description: post.caption,
                        alt: `Instagram carousel item from ${handle}`,
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
            })

            // Process carousel items with concurrency limit
            const carouselResults = await runWithConcurrency(carouselTasks, 3)
            const carouselErrors = carouselResults.filter(
                (r) => r.status === 'rejected'
            )
            if (carouselErrors.length > 0) {
                console.error(
                    `${carouselErrors.length} carousel items failed for ${post.code}`
                )
            }
        }

        return { status: 'new', code: post.code }
    } catch (error) {
        console.error(`Error processing post ${post.code}:`, error)
        return {
            status: 'error',
            code: post.code,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Process a batch of Instagram posts in parallel
 *
 * @param posts - Array of parsed posts to process
 * @param handle - Instagram handle for metadata
 * @returns Aggregated results for all posts
 */
async function processPostsBatch(
    posts: ParsedInstagramPost[],
    handle: string
): Promise<{
    newPostsCount: number
    skippedCount: number
    errorCount: number
    errors: string[]
}> {
    const tasks = posts.map((post) => () => processIndividualPost(post, handle))

    const results = await runWithConcurrency(tasks, CONCURRENT_LIMIT)

    let newPostsCount = 0
    let skippedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const result of results) {
        if (result.status === 'fulfilled') {
            const postResult = result.value
            switch (postResult.status) {
                case 'new':
                    newPostsCount++
                    break
                case 'skipped':
                    skippedCount++
                    break
                case 'error':
                    errorCount++
                    if (postResult.error) {
                        errors.push(
                            `Failed to process post ${postResult.code}: ${postResult.error}`
                        )
                    }
                    break
            }
        } else {
            // Promise rejected - unexpected error
            errorCount++
            const error = result.reason
            errors.push(
                `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    return { newPostsCount, skippedCount, errorCount, errors }
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
        let settings = await getInstagramSettings()

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

        // Ensure profile is fetched (needed for posts count and progress tracking)
        if (!settings.postsCount) {
            const profileResult = await syncInstagramProfile()
            if (profileResult.success) {
                // Refetch settings to get updated postsCount
                const updatedSettings = await getInstagramSettings()
                if (updatedSettings) {
                    settings = updatedSettings
                }
            }
            // Continue even if profile sync fails - don't block post sync
        }

        // Verify settings still exists (TypeScript safety after potential reassignment)
        if (!settings || !settings.handle) {
            return {
                ...result,
                errors: ['Settings became invalid during profile sync'],
            }
        }

        // Include total posts count in result
        result.totalPostsCount = settings.postsCount ?? undefined

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

        // Process posts in parallel with concurrency limit
        const batchResult = await processPostsBatch(
            parsedPosts,
            settings.handle
        )

        result.newPostsCount = batchResult.newPostsCount
        result.skippedCount = batchResult.skippedCount
        result.errorCount = batchResult.errorCount
        result.errors = batchResult.errors

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
