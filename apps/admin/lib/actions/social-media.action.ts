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
import { eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
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
import { runWithConcurrency } from '@workspace/shared'
import { SYNC_CONCURRENCY_LIMIT } from '../constants/analysis.constant'

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

// ============================================================================
// Settings Actions
// ============================================================================

/**
 * Get or create Instagram settings
 */
export async function getInstagramSettings() {
    await requireAuth()

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
        await requireAuth()

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
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
        await requireAuth()

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
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
 * Get existing Instagram post IDs from the database
 *
 * Performs a bulk query to find which Instagram IDs already exist in the database.
 * Used to pre-filter posts before downloading media, avoiding unnecessary network operations.
 *
 * @param instagramIds - Array of Instagram post IDs to check
 * @returns Set of Instagram IDs that already exist in the database
 */
async function getExistingInstagramIds(
    instagramIds: string[]
): Promise<Set<string>> {
    if (instagramIds.length === 0) {
        return new Set()
    }

    const existing = await db
        .select({ instagramId: instagramPost.instagramId })
        .from(instagramPost)
        .where(inArray(instagramPost.instagramId, instagramIds))

    return new Set(existing.map((row) => row.instagramId))
}

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
 * Download all media for a post (primary, thumbnail, carousel items)
 *
 * Downloads are done outside transaction since they're idempotent and
 * we don't want to hold database connections during network operations.
 */
async function downloadPostMedia(post: ParsedInstagramPost): Promise<{
    primaryMedia: Awaited<ReturnType<typeof downloadAndUploadMedia>>
    thumbnailBlobUrl: string | null
    carouselMedia: Array<{
        order: number
        mediaType: 'image' | 'video'
        media: Awaited<ReturnType<typeof downloadAndUploadMedia>>
    }>
}> {
    // Download primary media
    const primaryMedia = await downloadAndUploadMedia(
        post.primaryMediaUrl,
        `${post.code}-primary`
    )

    // Download thumbnail for videos
    let thumbnailBlobUrl: string | null = null
    if (post.mediaType === 'video' && post.thumbnailUrl) {
        try {
            const thumbnailMedia = await downloadAndUploadMedia(
                post.thumbnailUrl,
                `${post.code}-thumb`
            )
            thumbnailBlobUrl = thumbnailMedia.url
        } catch (thumbError) {
            if (thumbError instanceof UnauthorizedError) {
                throw thumbError
            }

            console.error(
                `Failed to upload thumbnail for ${post.code}:`,
                thumbError
            )
            // Continue without thumbnail
        }
    }

    // Download carousel items
    const carouselMedia: Array<{
        order: number
        mediaType: 'image' | 'video'
        media: Awaited<ReturnType<typeof downloadAndUploadMedia>>
    }> = []

    if (post.mediaType === 'carousel' && post.carouselItems.length > 0) {
        // Download carousel items with concurrency limit
        const carouselTasks = post.carouselItems.map((item) => async () => {
            const media = await downloadAndUploadMedia(
                item.mediaUrl,
                `${post.code}-carousel-${item.order}`
            )
            return { order: item.order, mediaType: item.mediaType, media }
        })

        const carouselDownloadResults = await runWithConcurrency(
            carouselTasks,
            SYNC_CONCURRENCY_LIMIT
        )
        for (const carouselDownloadResult of carouselDownloadResults) {
            if (carouselDownloadResult.status === 'fulfilled') {
                carouselMedia.push(carouselDownloadResult.value)
            }
        }
    }

    return { primaryMedia, thumbnailBlobUrl, carouselMedia }
}

/**
 * Create primary gallery media record
 *
 * Inserts primary media into gallery_media table with metadata.
 *
 * @param post - Parsed Instagram post data
 * @param primaryMedia - Uploaded media info (URL, mimeType, fileSize)
 * @param thumbnailBlobUrl - Thumbnail URL for videos (optional)
 * @param handle - Instagram handle for alt text
 * @param tx - Database transaction
 * @returns Gallery media ID
 */
async function createPrimaryGalleryMedia(
    post: ParsedInstagramPost,
    primaryMedia: Awaited<ReturnType<typeof downloadAndUploadMedia>>,
    thumbnailBlobUrl: string | null,
    handle: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
): Promise<string> {
    const [primaryGalleryMedia] = await tx
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
            duration: post.mediaType === 'video' ? post.videoDuration : null,
            status: 'draft',
        })
        .returning({ id: galleryMedia.id })

    return primaryGalleryMedia!.id
}

/**
 * Insert post with upsert pattern
 *
 * Attempts to insert post, handling conflicts gracefully.
 * Returns whether post was newly inserted or already existed.
 *
 * @param post - Parsed Instagram post data
 * @param primaryMediaId - Gallery media ID for primary media
 * @param tx - Database transaction
 * @returns Insert result with post ID if successful
 */
async function insertPostWithUpsert(
    post: ParsedInstagramPost,
    primaryMediaId: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
): Promise<{ inserted: boolean; postId?: string }> {
    const [insertedPost] = await tx
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
            mediaId: primaryMediaId,
            isPublished: false,
        })
        .onConflictDoNothing({ target: instagramPost.instagramId })
        .returning({ id: instagramPost.id })

    if (!insertedPost) {
        return { inserted: false }
    }

    return { inserted: true, postId: insertedPost.id }
}

/**
 * Process carousel items for a post
 *
 * Creates gallery_media records and junction table entries for carousel items.
 *
 * @param postId - Instagram post ID
 * @param post - Parsed Instagram post data
 * @param carouselMedia - Downloaded carousel media items
 * @param handle - Instagram handle for alt text
 * @param tx - Database transaction
 */
async function processCarouselItems(
    postId: string,
    post: ParsedInstagramPost,
    carouselMedia: Array<{
        order: number
        mediaType: 'image' | 'video'
        media: Awaited<ReturnType<typeof downloadAndUploadMedia>>
    }>,
    handle: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
): Promise<void> {
    for (const carouselItem of carouselMedia) {
        const [itemGalleryMedia] = await tx
            .insert(galleryMedia)
            .values({
                type: carouselItem.mediaType,
                url: carouselItem.media.url,
                title: generateMediaTitle(
                    post.caption,
                    post.code,
                    carouselItem.order
                ),
                slug: generateMediaSlug(post.code, carouselItem.order),
                description: post.caption,
                alt: `Instagram carousel item from ${handle}`,
                mimeType: carouselItem.media.mimeType,
                fileSize: carouselItem.media.fileSize,
                status: 'draft',
            })
            .returning({ id: galleryMedia.id })

        // Create junction record
        await tx.insert(instagramPostMedia).values({
            postId: postId,
            mediaId: itemGalleryMedia!.id,
            displayOrder: carouselItem.order,
        })
    }
}

/**
 * Process a single Instagram post
 *
 * Downloads media, creates gallery entries, and stores post data.
 * Uses database transaction for atomicity and upsert pattern to prevent duplicates.
 * Returns result indicating if post was new, skipped, or had an error.
 */
async function processIndividualPost(
    post: ParsedInstagramPost,
    handle: string
): Promise<PostProcessResult> {
    try {
        // Skip if no primary media URL
        if (!post.primaryMediaUrl) {
            return {
                status: 'error',
                code: post.code,
                error: `No media URL for post ${post.code}`,
            }
        }

        // Download all media OUTSIDE transaction (idempotent, shouldn't hold DB connection)
        const { primaryMedia, thumbnailBlobUrl, carouselMedia } =
            await downloadPostMedia(post)

        // Wrap all database operations in a transaction for atomicity
        const processResult = await db.transaction(async (tx) => {
            // Create gallery_media record for primary media
            const primaryMediaId = await createPrimaryGalleryMedia(
                post,
                primaryMedia,
                thumbnailBlobUrl,
                handle,
                tx
            )

            // Use upsert pattern: insert with onConflictDoNothing to handle race conditions
            const upsertResult = await insertPostWithUpsert(
                post,
                primaryMediaId,
                tx
            )

            // If no row returned, post already existed (conflict occurred)
            if (!upsertResult.inserted) {
                // Delete the orphaned primaryGalleryMedia record
                try {
                    await tx
                        .delete(galleryMedia)
                        .where(eq(galleryMedia.id, primaryMediaId))
                } catch (deleteError) {
                    // Log but don't fail - continue with skipped status
                    console.error(
                        `Failed to delete orphaned gallery_media for post ${post.code}:`,
                        deleteError
                    )
                }
                return { status: 'skipped' as const, code: post.code }
            }

            // Insert carousel items within the same transaction
            await processCarouselItems(
                upsertResult.postId!,
                post,
                carouselMedia,
                handle,
                tx
            )

            return { status: 'new' as const, code: post.code }
        })

        return processResult
    } catch (processError) {
        // Transaction auto-rolls back on error
        console.error(`Error processing post ${post.code}:`, processError)
        return {
            status: 'error',
            code: post.code,
            error:
                processError instanceof Error
                    ? processError.message
                    : 'Unknown error',
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

    const postProcessResults = await runWithConcurrency(
        tasks,
        SYNC_CONCURRENCY_LIMIT
    )

    let newPostsCount = 0
    let skippedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const postProcessResult of postProcessResults) {
        if (postProcessResult.status === 'fulfilled') {
            const postResult = postProcessResult.value
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
            const rejectionError = postProcessResult.reason as unknown
            errors.push(
                `Unexpected error: ${rejectionError instanceof Error ? rejectionError.message : 'Unknown error'}`
            )
        }
    }

    return { newPostsCount, skippedCount, errorCount, errors }
}

/**
 * Validate sync settings and API key
 *
 * Checks that Instagram settings are properly configured.
 *
 * @returns Validation result with settings and API key if valid
 */
async function validateSyncSettings(): Promise<{
    valid: boolean
    settings?: Awaited<ReturnType<typeof getInstagramSettings>>
    apiKey?: string
    errors?: string[]
}> {
    // Get settings
    const settings = await getInstagramSettings()

    if (!settings) {
        return {
            valid: false,
            errors: ['Instagram settings not configured'],
        }
    }

    if (!settings.handle) {
        return {
            valid: false,
            errors: ['Instagram handle not configured'],
        }
    }

    if (!settings.isEnabled) {
        return {
            valid: false,
            errors: ['Instagram integration is disabled'],
        }
    }

    const apiKey = getApiKey(settings.apiKey)
    if (!apiKey) {
        return {
            valid: false,
            errors: ['API key not configured'],
        }
    }

    return {
        valid: true,
        settings,
        apiKey,
    }
}

/**
 * Ensure profile data is fetched
 *
 * Syncs profile if postsCount is missing, which is needed for progress tracking.
 *
 * @param settings - Current Instagram settings
 * @returns Updated settings with profile data
 */
async function ensureProfileData(
    settings: NonNullable<Awaited<ReturnType<typeof getInstagramSettings>>>
): Promise<NonNullable<Awaited<ReturnType<typeof getInstagramSettings>>>> {
    if (!settings.postsCount) {
        const profileResult = await syncInstagramProfile()
        if (profileResult.success) {
            // Refetch settings to get updated postsCount
            const updatedSettings = await getInstagramSettings()
            if (updatedSettings) {
                return updatedSettings
            }
        }
        // Continue even if profile sync fails - don't block post sync
    }
    return settings
}

/**
 * Fetch and filter Instagram posts
 *
 * Fetches posts from API, parses them, and filters out existing posts.
 *
 * @param handle - Instagram handle
 * @param apiKey - API key for Instagram service
 * @param cursor - Optional cursor for pagination
 * @returns Filtered posts and pagination info
 */
async function fetchAndFilterPosts(
    handle: string,
    apiKey: string,
    cursor?: string
): Promise<{
    newPosts: ParsedInstagramPost[]
    preFilteredSkippedCount: number
    nextCursor: string | null
    hasMore: boolean
}> {
    // Fetch posts from API
    const apiResponse = await fetchInstagramPosts(handle, apiKey, cursor)

    const parsedPosts = parseInstagramPosts(apiResponse)

    // Pre-filter: Check which posts already exist in the database
    // This avoids expensive media downloads for posts we already have
    const allInstagramIds = parsedPosts.map((p) => p.instagramId)
    const existingIds = await getExistingInstagramIds(allInstagramIds)

    // Filter out posts that already exist - only process new ones
    const newPosts = parsedPosts.filter((p) => !existingIds.has(p.instagramId))
    const preFilteredSkippedCount = parsedPosts.length - newPosts.length

    return {
        newPosts,
        preFilteredSkippedCount,
        nextCursor: apiResponse.next_max_id ?? null,
        hasMore: apiResponse.more_available,
    }
}

/**
 * Update sync cursor in database
 *
 * Saves sync timestamp and optional pagination cursor.
 *
 * @param nextMaxId - Next cursor for pagination (optional)
 */
async function updateSyncCursor(nextMaxId: string | null): Promise<void> {
    await db
        .update(socialMediaSettings)
        .set({
            lastSyncAt: new Date(),
            lastSyncCursor: nextMaxId,
        })
        .where(eq(socialMediaSettings.platform, 'instagram'))
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

    const syncResult: SyncResult = {
        success: false,
        newPostsCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: [],
        nextCursor: null,
        hasMore: false,
    }

    try {
        await requireAuth()

        // Validate settings and API key
        const validation = await validateSyncSettings()
        if (!validation.valid || !validation.settings || !validation.apiKey) {
            return {
                ...syncResult,
                errors: validation.errors ?? ['Validation failed'],
            }
        }

        let settings = validation.settings
        const apiKey = validation.apiKey

        // Ensure profile is fetched (needed for posts count and progress tracking)
        settings = await ensureProfileData(settings)

        // Verify settings still exists (TypeScript safety after potential reassignment)
        if (!settings || !settings.handle) {
            return {
                ...syncResult,
                errors: ['Settings became invalid during profile sync'],
            }
        }

        // Include total posts count in result
        syncResult.totalPostsCount = settings.postsCount ?? undefined

        // Determine cursor: use null if resetCursor is true, otherwise use stored cursor
        const cursor = resetCursor
            ? undefined
            : (settings.lastSyncCursor ?? undefined)

        // Fetch and filter posts
        const { newPosts, preFilteredSkippedCount, nextCursor, hasMore } =
            await fetchAndFilterPosts(settings.handle, apiKey, cursor)

        // Process only new posts in parallel with concurrency limit
        // This skips all media downloads for existing posts
        const batchResult =
            newPosts.length > 0
                ? await processPostsBatch(newPosts, settings.handle)
                : {
                      newPostsCount: 0,
                      skippedCount: 0,
                      errorCount: 0,
                      errors: [],
                  }

        syncResult.newPostsCount = batchResult.newPostsCount
        // Include pre-filtered skipped posts in the total skipped count
        syncResult.skippedCount =
            preFilteredSkippedCount + batchResult.skippedCount
        syncResult.errorCount = batchResult.errorCount
        syncResult.errors = batchResult.errors

        // Update sync cursor
        await updateSyncCursor(nextCursor)

        syncResult.success = true
        syncResult.nextCursor = nextCursor
        syncResult.hasMore = hasMore

        revalidatePath('/social-media')
        revalidatePath('/social-media/instagram')

        return syncResult
    } catch (syncError) {
        if (syncError instanceof UnauthorizedError) {
            return {
                ...syncResult,
                errors: ['Unauthorized'],
            }
        }

        console.error('Error syncing Instagram posts:', syncError)
        return {
            ...syncResult,
            errors: [
                syncError instanceof Error
                    ? syncError.message
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
        await requireAuth()

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
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
        await requireAuth()

        await db
            .update(instagramPost)
            .set({ isPublished })
            .where(eq(instagramPost.id, postId))

        revalidatePath('/social-media/instagram')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
        await requireAuth()

        await db
            .update(instagramPost)
            .set({ isFeatured })
            .where(eq(instagramPost.id, postId))

        revalidatePath('/social-media/instagram')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
