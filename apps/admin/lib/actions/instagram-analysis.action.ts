/**
 * Instagram Analysis Actions
 *
 * Server actions for bulk AI analysis of Instagram posts.
 * Handles analyzing media, detecting B&A pairs, and applying results.
 *
 * @module lib/actions/instagram-analysis
 */
'use server'

import { db } from '@workspace/db/client'
import {
    instagramPost,
    instagramPostMedia,
    galleryMedia,
    galleryMediaGroup,
    beforeAfterPair,
    galleryGroup,
} from '@workspace/db/schema'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import type {
    GalleryMediaAIAnalysis,
    AvailableGroup,
} from '@workspace/shared/schemas/gallery'
import { analyzeGalleryImage } from '@workspace/ai'
import { eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createAnalysis, updateAnalysisResult } from './media-analysis.action'
import { generateAnalysisName } from '../utils/analysis.util'
import { pairBeforeAfterImages } from '../utils/pairing-algorithm.util'
import { convertGroupSuggestions } from '../utils/group-suggestion.util'
import { runWithConcurrency } from '@workspace/shared'
import { ANALYSIS_CONCURRENCY_LIMITS } from '../constants/analysis.constant'

// ============================================================================
// Types
// ============================================================================

type ActionResult = {
    success: boolean
    error?: string
}

/**
 * Analysis result for a single media item
 */
export type MediaAnalysisResult = {
    mediaId: string
    mediaUrl: string
    analysis: GalleryMediaAIAnalysis | null
    error?: string
}

/**
 * Analysis result for a single Instagram post
 */
export type PostAnalysisResult = {
    postId: string
    postCode: string
    mediaType: 'image' | 'video' | 'carousel'
    primaryMedia: MediaAnalysisResult
    carouselMedia: MediaAnalysisResult[]
}

/**
 * AI-suggested group for media assignment
 */
export type AISuggestedGroup = {
    groupId: string
    slug: string
    name: string
    confidence: number
    reason: string
}

/**
 * Detected B&A pair from analysis
 */
export type DetectedPair = {
    id: string
    type: 'side_by_side' | 'paired'
    beforeMediaId: string
    beforeMediaUrl: string
    afterMediaId: string
    afterMediaUrl: string
    procedureSlug: string | null
    bodyArea: string
    confidence: number
    aiSuggestedGroups: AISuggestedGroup[]
    aiPrimaryGroup: string | null
}

/**
 * Media item awaiting manual pairing
 */
export type UnpairedMedia = {
    mediaId: string
    mediaUrl: string
    beforeAfterType: 'before' | 'after'
    procedureSlug: string | null
    bodyArea: string
    postId: string
    postCode: string
    aiSuggestedGroups: AISuggestedGroup[]
    aiAnalysis: GalleryMediaAIAnalysis | null
}

/**
 * Result of bulk analysis
 */
export type BulkAnalysisResult = {
    success: boolean
    error?: string
    analyzedPosts: PostAnalysisResult[]
    detectedPairs: DetectedPair[]
    unpairedMedia: UnpairedMedia[]
    nonBAMedia: Array<{
        mediaId: string
        mediaUrl: string
        contentType: string
        procedureSlug: string | null
        postId: string
        isSideBySide?: boolean
        aiSuggestedGroups: AISuggestedGroup[]
        aiAnalysis: GalleryMediaAIAnalysis | null
    }>
    stats: {
        totalPosts: number
        totalMedia: number
        analyzedMedia: number
        failedMedia: number
        sideBySideCount: number
        pairedCount: number
        unpairedCount: number
    }
}

/**
 * Input for applying analysis results
 */
export type ApplyAnalysisInput = {
    /** Pairs to create (both detected and manually paired) */
    pairs: Array<{
        beforeMediaId: string
        afterMediaId: string
        procedureSlug: string | null
        isSideBySide: boolean
    }>
    /** Media to assign to groups (non-B&A content) */
    groupAssignments: Array<{
        mediaId: string
        groupId: string
    }>
    /** Post IDs that were analyzed */
    postIds: string[]
}

// ============================================================================
// Helper Functions
// ============================================================================
// (Extracted to pairing-algorithm.util.ts and group-suggestion.util.ts)

/**
 * Result of analyzing a single post
 */
type IndividualPostAnalysisResult = {
    postResult: PostAnalysisResult
    beforeImages: Array<{
        mediaId: string
        mediaUrl: string
        analysis: GalleryMediaAIAnalysis
        postId: string
        postCode: string
        aiSuggestedGroups: AISuggestedGroup[]
    }>
    afterImages: Array<{
        mediaId: string
        mediaUrl: string
        analysis: GalleryMediaAIAnalysis
        postId: string
        postCode: string
        aiSuggestedGroups: AISuggestedGroup[]
    }>
    nonBAMedia: BulkAnalysisResult['nonBAMedia']
    stats: {
        totalMedia: number
        analyzedMedia: number
        failedMedia: number
    }
}

/**
 * Collect all images from a post for analysis
 *
 * Gathers primary image and carousel items into a single array.
 *
 * @param post - Post data with media type and URLs
 * @param carouselMediaMap - Map of carousel media by post ID
 * @returns Array of images to analyze with metadata
 */
function collectImagesToAnalyze(
    post: {
        id: string
        code: string
        mediaType: 'image' | 'video' | 'carousel'
        mediaId: string
        mediaUrl: string
    },
    carouselMediaMap: Record<
        string,
        Array<{ mediaId: string; url: string; displayOrder: number }>
    >
): Array<{ mediaId: string; url: string; isPrimary: boolean }> {
    const imagesToAnalyze: Array<{
        mediaId: string
        url: string
        isPrimary: boolean
    }> = []

    if (post.mediaType === 'image') {
        imagesToAnalyze.push({
            mediaId: post.mediaId,
            url: post.mediaUrl,
            isPrimary: true,
        })
    } else if (post.mediaType === 'carousel') {
        const carouselItems = carouselMediaMap[post.id] || []
        for (const carouselItem of carouselItems) {
            imagesToAnalyze.push({
                mediaId: carouselItem.mediaId,
                url: carouselItem.url,
                isPrimary: carouselItem.displayOrder === 0,
            })
        }
    }

    return imagesToAnalyze
}

/**
 * Create media analysis result object
 *
 * @param imageToAnalyze - Image metadata
 * @param analysis - AI analysis result or null for errors
 * @param error - Error message if analysis failed
 * @returns MediaAnalysisResult object
 */
function createMediaAnalysisResult(
    imageToAnalyze: {
        mediaId: string
        url: string
        isPrimary: boolean
    },
    analysis: GalleryMediaAIAnalysis | null,
    error?: string
): MediaAnalysisResult {
    return {
        mediaId: imageToAnalyze.mediaId,
        mediaUrl: imageToAnalyze.url,
        analysis,
        ...(error && { error }),
    }
}

/**
 * Handle successful image analysis
 *
 * Saves analysis to database, generates AI group suggestions,
 * and categorizes media as before/after or non-BA content.
 *
 * @param imageToAnalyze - Image metadata
 * @param analysis - AI analysis result
 * @param post - Post data for context
 * @param availableGroups - Available gallery groups for suggestions
 * @param postAnalysisResult - Result object to populate
 */
async function handleSuccessfulImageAnalysis(
    imageToAnalyze: {
        mediaId: string
        url: string
        isPrimary: boolean
    },
    analysis: GalleryMediaAIAnalysis,
    post: {
        id: string
        code: string
        mediaType: 'image' | 'video' | 'carousel'
        mediaId: string
        mediaUrl: string
    },
    availableGroups: AvailableGroup[],
    postAnalysisResult: IndividualPostAnalysisResult
): Promise<void> {
    postAnalysisResult.stats.analyzedMedia++

    const mediaResult = createMediaAnalysisResult(imageToAnalyze, analysis)

    if (imageToAnalyze.isPrimary) {
        postAnalysisResult.postResult.primaryMedia = mediaResult
    } else {
        postAnalysisResult.postResult.carouselMedia.push(mediaResult)
    }

    // Save analysis to gallery_media
    // Mark side-by-side as NOT isBeforeAfter (they're composite images)
    const isSideBySide = analysis.beforeAfterType === 'side_by_side'
    await db
        .update(galleryMedia)
        .set({
            aiAnalysis: analysis,
            isBeforeAfter: analysis.isBeforeAfter && !isSideBySide,
        })
        .where(eq(galleryMedia.id, imageToAnalyze.mediaId))

    // Get AI group suggestions for this media
    const aiSuggestedGroups = await convertGroupSuggestions(
        analysis,
        availableGroups
    )

    // Categorize based on analysis
    if (analysis.isBeforeAfter) {
        if (analysis.beforeAfterType === 'side_by_side') {
            // Side-by-side image - treat as non-BA content, assign to group
            postAnalysisResult.nonBAMedia.push({
                mediaId: imageToAnalyze.mediaId,
                mediaUrl: imageToAnalyze.url,
                contentType: analysis.contentType,
                procedureSlug: analysis.detectedProcedure ?? null,
                postId: post.id,
                isSideBySide: true,
                aiSuggestedGroups,
                aiAnalysis: analysis,
            })
        } else if (analysis.beforeAfterType === 'before') {
            postAnalysisResult.beforeImages.push({
                mediaId: imageToAnalyze.mediaId,
                mediaUrl: imageToAnalyze.url,
                analysis,
                postId: post.id,
                postCode: post.code,
                aiSuggestedGroups,
            })
        } else if (analysis.beforeAfterType === 'after') {
            postAnalysisResult.afterImages.push({
                mediaId: imageToAnalyze.mediaId,
                mediaUrl: imageToAnalyze.url,
                analysis,
                postId: post.id,
                postCode: post.code,
                aiSuggestedGroups,
            })
        }
    } else {
        // Non-B&A content
        postAnalysisResult.nonBAMedia.push({
            mediaId: imageToAnalyze.mediaId,
            mediaUrl: imageToAnalyze.url,
            contentType: analysis.contentType,
            procedureSlug: analysis.detectedProcedure ?? null,
            postId: post.id,
            aiSuggestedGroups,
            aiAnalysis: analysis,
        })
    }
}

/**
 * Handle failed image analysis
 *
 * Records error and updates result with error state.
 *
 * @param imageToAnalyze - Image metadata
 * @param imageAnalysisError - Error that occurred during analysis
 * @param postAnalysisResult - Result object to populate
 */
function handleFailedImageAnalysis(
    imageToAnalyze: {
        mediaId: string
        url: string
        isPrimary: boolean
    },
    imageAnalysisError: unknown,
    postAnalysisResult: IndividualPostAnalysisResult
): void {
    console.error(
        `Error analyzing media ${imageToAnalyze.mediaId}:`,
        imageAnalysisError
    )
    postAnalysisResult.stats.failedMedia++

    const errorMessage =
        imageAnalysisError instanceof Error
            ? imageAnalysisError.message
            : 'Analysis failed'

    const errorResult = createMediaAnalysisResult(
        imageToAnalyze,
        null,
        errorMessage
    )

    if (imageToAnalyze.isPrimary) {
        postAnalysisResult.postResult.primaryMedia = errorResult
    } else {
        postAnalysisResult.postResult.carouselMedia.push(errorResult)
    }
}

/**
 * Process image analysis results and categorize media
 *
 * Categorizes analyzed images as before/after or non-BA content,
 * saves results to database, and generates AI group suggestions.
 *
 * @param imageResults - Analysis results from AI
 * @param imagesToAnalyze - Original images that were analyzed
 * @param post - Post data for context
 * @param availableGroups - Available gallery groups for suggestions
 * @param postAnalysisResult - Result object to populate
 * @returns Updated result with categorized images and stats
 */
async function processImageAnalysisResults(
    imageResults: Array<PromiseSettledResult<GalleryMediaAIAnalysis>>,
    imagesToAnalyze: Array<{
        mediaId: string
        url: string
        isPrimary: boolean
    }>,
    post: {
        id: string
        code: string
        mediaType: 'image' | 'video' | 'carousel'
        mediaId: string
        mediaUrl: string
    },
    availableGroups: AvailableGroup[],
    postAnalysisResult: IndividualPostAnalysisResult
): Promise<void> {
    for (let i = 0; i < imageResults.length; i++) {
        const imageResult = imageResults[i]!
        const imageToAnalyze = imagesToAnalyze[i]!

        if (imageResult.status === 'fulfilled') {
            await handleSuccessfulImageAnalysis(
                imageToAnalyze,
                imageResult.value,
                post,
                availableGroups,
                postAnalysisResult
            )
        } else {
            handleFailedImageAnalysis(
                imageToAnalyze,
                imageResult.reason,
                postAnalysisResult
            )
        }
    }
}

/**
 * Update post with analysis results
 *
 * Marks post as analyzed and saves primary media analysis.
 *
 * @param postId - ID of post to update
 * @param analysis - AI analysis result for primary media
 */
async function updatePostWithAnalysis(
    postId: string,
    analysis: GalleryMediaAIAnalysis | null
): Promise<void> {
    await db
        .update(instagramPost)
        .set({
            analysisStatus: 'analyzed',
            analyzedAt: new Date(),
            aiAnalysis: analysis,
        })
        .where(eq(instagramPost.id, postId))
}

/**
 * Analyze a single Instagram post with all its media
 *
 * Processes a post's primary image and carousel items in parallel,
 * categorizes them as before/after or non-BA content, and updates
 * the database with analysis results.
 *
 * @param post - Post data with media URLs
 * @param carouselMediaMap - Map of carousel media by post ID
 * @param availableGroups - Available gallery groups for AI suggestions
 * @returns Categorized analysis results for the post
 */
async function analyzeIndividualPost(
    post: {
        id: string
        code: string
        mediaType: 'image' | 'video' | 'carousel'
        mediaId: string
        mediaUrl: string
    },
    carouselMediaMap: Record<
        string,
        Array<{ mediaId: string; url: string; displayOrder: number }>
    >,
    availableGroups: AvailableGroup[]
): Promise<IndividualPostAnalysisResult> {
    const postAnalysisResult: IndividualPostAnalysisResult = {
        postResult: {
            postId: post.id,
            postCode: post.code,
            mediaType: post.mediaType,
            primaryMedia: {
                mediaId: post.mediaId,
                mediaUrl: post.mediaUrl,
                analysis: null,
            },
            carouselMedia: [],
        },
        beforeImages: [],
        afterImages: [],
        nonBAMedia: [],
        stats: {
            totalMedia: 0,
            analyzedMedia: 0,
            failedMedia: 0,
        },
    }

    // Collect all images for this post
    const imagesToAnalyze = collectImagesToAnalyze(post, carouselMediaMap)
    postAnalysisResult.stats.totalMedia = imagesToAnalyze.length

    // Analyze images in parallel
    const imageTasks = imagesToAnalyze.map(
        (imageToAnalyze) => () =>
            analyzeGalleryImage({
                imageUrl: imageToAnalyze.url,
            })
    )

    const imageResults = await runWithConcurrency(
        imageTasks,
        ANALYSIS_CONCURRENCY_LIMITS.IMAGES_PER_POST
    )

    // Process results and categorize media
    await processImageAnalysisResults(
        imageResults,
        imagesToAnalyze,
        post,
        availableGroups,
        postAnalysisResult
    )

    // Update post analysis status and save primary media analysis
    await updatePostWithAnalysis(
        post.id,
        postAnalysisResult.postResult.primaryMedia.analysis
    )

    return postAnalysisResult
}

// ============================================================================
// Main Analysis Action - Helper Functions
// ============================================================================

/**
 * Initialize analysis record in database
 *
 * Creates a new analysis record with pending status.
 *
 * @param source - Source of analysis (instagram, upload, etc)
 * @param type - Type of analysis (bulk, single)
 * @returns Analysis ID if successful, error otherwise
 */
async function initializeAnalysisRecord(
    source: 'instagram' | 'gallery',
    type: 'bulk' | 'single'
): Promise<{ success: boolean; analysisId?: string; error?: string }> {
    try {
        const analysisName = generateAnalysisName(source, type)
        const createAnalysisResult = await createAnalysis({
            name: analysisName,
            type,
            source,
            status: 'analyzing',
        })

        if (!createAnalysisResult.success || !createAnalysisResult.data) {
            return {
                success: false,
                error: 'Failed to create analysis record',
            }
        }

        return {
            success: true,
            analysisId: createAnalysisResult.data.id,
        }
    } catch (analysisError) {
        if (
            analysisError instanceof Error &&
            analysisError.message === 'Unauthorized'
        ) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error creating analysis record:', analysisError)
        return {
            success: false,
            error:
                analysisError instanceof Error
                    ? analysisError.message
                    : 'Failed to create analysis',
        }
    }
}

/**
 * Fetch posts and groups for analysis
 *
 * Retrieves post data with media URLs and available gallery groups.
 *
 * @param postIds - IDs of posts to fetch
 * @returns Posts, carousel media map, and available groups
 */
async function fetchPostsAndGroupsForAnalysis(postIds: string[]): Promise<{
    availableGroups: AvailableGroup[]
    posts: Array<{
        id: string
        code: string
        mediaType: 'image' | 'video' | 'carousel'
        mediaId: string
        mediaUrl: string
    }>
    carouselMediaMap: Record<
        string,
        Array<{ mediaId: string; url: string; displayOrder: number }>
    >
}> {
    // Fetch gallery groups for AI suggestions
    const availableGroups = await db
        .select({
            id: galleryGroup.id,
            name: galleryGroup.name,
            slug: galleryGroup.slug,
            description: galleryGroup.description,
        })
        .from(galleryGroup)
        .where(eq(galleryGroup.isVisible, true))

    // Fetch posts with media
    const posts = await db
        .select({
            id: instagramPost.id,
            code: instagramPost.code,
            mediaType: instagramPost.mediaType,
            mediaId: instagramPost.mediaId,
            mediaUrl: galleryMedia.url,
        })
        .from(instagramPost)
        .innerJoin(galleryMedia, eq(instagramPost.mediaId, galleryMedia.id))
        .where(inArray(instagramPost.id, postIds))

    // Fetch carousel media for carousel posts
    const carouselPostIds = posts
        .filter((p) => p.mediaType === 'carousel')
        .map((p) => p.id)

    let carouselMediaMap: Record<
        string,
        Array<{ mediaId: string; url: string; displayOrder: number }>
    > = {}

    if (carouselPostIds.length > 0) {
        const carouselItems = await db
            .select({
                postId: instagramPostMedia.postId,
                mediaId: instagramPostMedia.mediaId,
                url: galleryMedia.url,
                displayOrder: instagramPostMedia.displayOrder,
                type: galleryMedia.type,
            })
            .from(instagramPostMedia)
            .innerJoin(
                galleryMedia,
                eq(instagramPostMedia.mediaId, galleryMedia.id)
            )
            .where(inArray(instagramPostMedia.postId, carouselPostIds))

        // Filter to only images (skip videos in carousels)
        const imageItems = carouselItems.filter(
            (carouselItem) => carouselItem.type === 'image'
        )

        carouselMediaMap = imageItems.reduce(
            (acc, carouselItem) => {
                if (!acc[carouselItem.postId]) acc[carouselItem.postId] = []
                acc[carouselItem.postId]!.push({
                    mediaId: carouselItem.mediaId,
                    url: carouselItem.url,
                    displayOrder: carouselItem.displayOrder,
                })
                return acc
            },
            {} as typeof carouselMediaMap
        )
    }

    return { availableGroups, posts, carouselMediaMap }
}

/**
 * Aggregate analysis results from all posts
 *
 * Collects and combines results from individual post analyses.
 *
 * @param postResults - Results from parallel post processing
 * @param analysisResult - Result object to populate
 */
function aggregateAnalysisResults(
    postResults: Array<PromiseSettledResult<IndividualPostAnalysisResult>>,
    analysisResult: BulkAnalysisResult
): void {
    const beforeImages: Array<{
        mediaId: string
        mediaUrl: string
        analysis: GalleryMediaAIAnalysis
        postId: string
        postCode: string
        aiSuggestedGroups: AISuggestedGroup[]
    }> = []
    const afterImages: Array<{
        mediaId: string
        mediaUrl: string
        analysis: GalleryMediaAIAnalysis
        postId: string
        postCode: string
        aiSuggestedGroups: AISuggestedGroup[]
    }> = []
    const nonBAMedia: BulkAnalysisResult['nonBAMedia'] = []

    // Aggregate results from all posts
    for (const postResult of postResults) {
        if (postResult.status === 'fulfilled') {
            const individualResult = postResult.value

            // Add to analyzed posts
            analysisResult.analyzedPosts.push(individualResult.postResult)

            // Aggregate categorized media
            beforeImages.push(...individualResult.beforeImages)
            afterImages.push(...individualResult.afterImages)
            nonBAMedia.push(...individualResult.nonBAMedia)

            // Update stats
            analysisResult.stats.totalMedia += individualResult.stats.totalMedia
            analysisResult.stats.analyzedMedia +=
                individualResult.stats.analyzedMedia
            analysisResult.stats.failedMedia +=
                individualResult.stats.failedMedia
        } else {
            // Handle post-level error
            const postError = postResult.reason as unknown
            console.error('Error analyzing post:', postError)
            // Continue with other posts
        }
    }

    // Pair before/after images
    const pairingResult = pairBeforeAfterImages(beforeImages, afterImages)

    // Combine pairs (no longer including side-by-side)
    analysisResult.detectedPairs = pairingResult.pairs

    analysisResult.unpairedMedia = [
        ...pairingResult.unpairedBefore,
        ...pairingResult.unpairedAfter,
    ]

    analysisResult.nonBAMedia = nonBAMedia

    // Update stats - count side-by-side from nonBAMedia
    const sideBySideCount = nonBAMedia.filter((m) => m.isSideBySide).length
    analysisResult.stats.sideBySideCount = sideBySideCount
    analysisResult.stats.pairedCount = pairingResult.pairs.length
    analysisResult.stats.unpairedCount = analysisResult.unpairedMedia.length
}

/**
 * Finalize analysis record with results
 *
 * Updates analysis record to completed status and revalidates paths.
 *
 * @param analysisId - ID of analysis record
 * @param analysisResult - Final analysis results
 */
async function finalizeAnalysisRecord(
    analysisId: string,
    analysisResult: BulkAnalysisResult
): Promise<void> {
    await updateAnalysisResult({
        id: analysisId,
        status: 'completed',
        resultData: analysisResult,
    })

    revalidatePath('/social-media/instagram')
    revalidatePath('/analysis')
}

// ============================================================================
// Main Analysis Action
// ============================================================================

/**
 * Analyze Instagram posts using AI vision
 *
 * This function:
 * 1. Creates an analysis record in the database
 * 2. Fetches posts with all media (primary + carousel)
 * 3. Analyzes each image using GPT-4o vision
 * 4. Detects B&A pairs and content types
 * 5. Updates post analysis status and analysis record
 * 6. Returns structured results with analysis ID for viewing
 */
export async function analyzeInstagramPosts(
    postIds: string[]
): Promise<BulkAnalysisResult & { analysisId?: string }> {
    // Check authentication first
    try {
        await requireAuth()
    } catch {
        return {
            success: false,
            analyzedPosts: [],
            detectedPairs: [],
            unpairedMedia: [],
            nonBAMedia: [],
            stats: {
                totalPosts: 0,
                totalMedia: 0,
                analyzedMedia: 0,
                failedMedia: 0,
                sideBySideCount: 0,
                pairedCount: 0,
                unpairedCount: 0,
            },
            error: 'Unauthorized',
        }
    }

    const analysisResult: BulkAnalysisResult & { analysisId?: string } = {
        success: false,
        analyzedPosts: [],
        detectedPairs: [],
        unpairedMedia: [],
        nonBAMedia: [],
        stats: {
            totalPosts: postIds.length,
            totalMedia: 0,
            analyzedMedia: 0,
            failedMedia: 0,
            sideBySideCount: 0,
            pairedCount: 0,
            unpairedCount: 0,
        },
    }

    // Create analysis record
    const initResult = await initializeAnalysisRecord('instagram', 'bulk')
    if (!initResult.success) {
        return {
            ...analysisResult,
            error: initResult.error,
        }
    }

    const analysisId = initResult.analysisId!
    analysisResult.analysisId = analysisId

    try {
        if (postIds.length === 0) {
            await updateAnalysisResult({
                id: analysisId,
                status: 'failed',
                errorMessage: 'No posts selected for analysis',
            })
            return {
                ...analysisResult,
                error: 'No posts selected for analysis',
            }
        }

        // Fetch posts and groups
        const { availableGroups, posts, carouselMediaMap } =
            await fetchPostsAndGroupsForAnalysis(postIds)

        // Filter out videos (not yet supported)
        const postsToAnalyze = posts.filter((p) => p.mediaType !== 'video')

        // Process posts in parallel
        const postTasks = postsToAnalyze.map(
            (post) => () =>
                analyzeIndividualPost(post, carouselMediaMap, availableGroups)
        )

        const postResults = await runWithConcurrency(
            postTasks,
            ANALYSIS_CONCURRENCY_LIMITS.POSTS
        )

        // Aggregate all results
        aggregateAnalysisResults(postResults, analysisResult)

        analysisResult.success = true

        // Update analysis record with results
        await finalizeAnalysisRecord(analysisId, analysisResult)

        return analysisResult
    } catch (analysisError) {
        if (
            analysisError instanceof Error &&
            analysisError.message === 'Unauthorized'
        ) {
            return {
                ...analysisResult,
                error: 'Unauthorized',
            }
        }

        console.error('Error in bulk analysis:', analysisError)

        // Update analysis record as failed
        await updateAnalysisResult({
            id: analysisId,
            status: 'failed',
            errorMessage:
                analysisError instanceof Error
                    ? analysisError.message
                    : 'Failed to analyze posts',
        })

        return {
            ...analysisResult,
            error:
                analysisError instanceof Error
                    ? analysisError.message
                    : 'Failed to analyze posts',
        }
    }
}

// ============================================================================
// Apply Analysis Results Action - Helper Functions
// ============================================================================

/**
 * Create before & after pairs in database
 *
 * Creates B&A pair records and assigns media to appropriate groups.
 *
 * @param pairs - Array of pairs to create
 * @param slugToGroupId - Map of procedure slugs to group IDs
 */
async function createBeforeAfterPairs(
    pairs: Array<{
        beforeMediaId: string
        afterMediaId: string
        procedureSlug: string | null
        isSideBySide: boolean
    }>,
    slugToGroupId: Map<string, string>
): Promise<void> {
    for (const pair of pairs) {
        // Get max display order
        const maxOrderResult = await db
            .select({
                maxOrder: sql<number>`COALESCE(MAX(display_order), -1)`,
            })
            .from(beforeAfterPair)

        const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1

        // Create the pair
        await db.insert(beforeAfterPair).values({
            beforeMediaId: pair.beforeMediaId,
            afterMediaId: pair.afterMediaId,
            procedureSlug: pair.procedureSlug,
            procedureType: pair.procedureSlug, // Use slug as type for now
            isFeatured: false,
            displayOrder: nextOrder,
        })

        // Mark media as before/after
        const mediaIds = pair.isSideBySide
            ? [pair.beforeMediaId]
            : [pair.beforeMediaId, pair.afterMediaId]

        await db
            .update(galleryMedia)
            .set({ isBeforeAfter: true })
            .where(inArray(galleryMedia.id, mediaIds))

        // Assign to gallery group based on procedure slug
        if (pair.procedureSlug && slugToGroupId.has(pair.procedureSlug)) {
            const groupId = slugToGroupId.get(pair.procedureSlug)!

            for (const mediaId of mediaIds) {
                // Check if already assigned
                const existing = await db
                    .select({ id: galleryMediaGroup.mediaId })
                    .from(galleryMediaGroup)
                    .where(eq(galleryMediaGroup.mediaId, mediaId))
                    .limit(1)

                if (existing.length === 0) {
                    await db.insert(galleryMediaGroup).values({
                        mediaId,
                        groupId,
                        displayOrder: 0,
                    })
                }
            }
        }
    }
}

/**
 * Assign media to gallery groups
 *
 * Assigns non-B&A media to specified gallery groups.
 *
 * @param assignments - Array of media-to-group assignments
 */
async function assignMediaToGroups(
    assignments: Array<{
        mediaId: string
        groupId: string
    }>
): Promise<void> {
    for (const assignment of assignments) {
        // Check if already assigned to this group
        const existing = await db
            .select({ id: galleryMediaGroup.mediaId })
            .from(galleryMediaGroup)
            .where(eq(galleryMediaGroup.mediaId, assignment.mediaId))
            .limit(1)

        if (existing.length === 0) {
            await db.insert(galleryMediaGroup).values({
                mediaId: assignment.mediaId,
                groupId: assignment.groupId,
                displayOrder: 0,
            })
        }

        // Ensure side-by-side images are marked as NOT isBeforeAfter
        // (they're composite images, not individual before/after shots)
        await db
            .update(galleryMedia)
            .set({ isBeforeAfter: false })
            .where(eq(galleryMedia.id, assignment.mediaId))
    }
}

// ============================================================================
// Apply Analysis Results Action
// ============================================================================

/**
 * Apply analysis results - create B&A pairs and assign groups
 */
export async function applyAnalysisResults(
    input: ApplyAnalysisInput
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Get all visible gallery groups to map procedure slugs to group IDs
        const groups = await db
            .select({
                id: galleryGroup.id,
                slug: galleryGroup.slug,
            })
            .from(galleryGroup)
            .where(eq(galleryGroup.isVisible, true))

        const slugToGroupId = new Map(groups.map((g) => [g.slug, g.id]))

        // Create B&A pairs
        await createBeforeAfterPairs(input.pairs, slugToGroupId)

        // Apply group assignments for non-B&A content
        await assignMediaToGroups(input.groupAssignments)

        // Update post statuses to 'applied'
        if (input.postIds.length > 0) {
            await db
                .update(instagramPost)
                .set({ analysisStatus: 'applied' })
                .where(inArray(instagramPost.id, input.postIds))
        }

        revalidatePath('/social-media/instagram')
        revalidatePath('/gallery')
        revalidatePath('/gallery/before-after')
        revalidatePath('/gallery/media')

        return { success: true }
    } catch (applyError) {
        if (
            applyError instanceof Error &&
            applyError.message === 'Unauthorized'
        ) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error applying analysis results:', applyError)
        return {
            success: false,
            error:
                applyError instanceof Error
                    ? applyError.message
                    : 'Failed to apply results',
        }
    }
}

/**
 * Update analysis status for posts
 */
export async function updateAnalysisStatus(
    postIds: string[],
    status: 'pending' | 'analyzed' | 'reviewed' | 'applied'
): Promise<ActionResult> {
    try {
        await requireAuth()

        if (postIds.length === 0) {
            return { success: false, error: 'No posts specified' }
        }

        await db
            .update(instagramPost)
            .set({ analysisStatus: status })
            .where(inArray(instagramPost.id, postIds))

        revalidatePath('/social-media/instagram')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error updating analysis status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
        }
    }
}

/**
 * Input for updating media analysis
 */
export type UpdateAnalysisInput = {
    mediaId: string
    groupIds?: string[] | null
    procedureSlug?: string | null
    beforeAfterType?: 'before' | 'after' | 'side_by_side' | null
    bodyArea?: 'face' | 'breast' | 'body' | 'combined' | 'other'
    isBeforeAfter?: boolean
}

/**
 * Update media analysis result
 *
 * Allows editing AI-generated analysis for individual media items.
 * Updates gallery_media aiAnalysis JSONB field and related flags.
 */
export async function updateMediaAnalysis(
    input: UpdateAnalysisInput
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Get current media
        const [media] = await db
            .select()
            .from(galleryMedia)
            .where(eq(galleryMedia.id, input.mediaId))
            .limit(1)

        if (!media) {
            return { success: false, error: 'Media not found' }
        }

        // Merge updates into existing AI analysis
        const currentAnalysis = media.aiAnalysis
        const updatedAnalysis: GalleryMediaAIAnalysis | null = currentAnalysis
            ? {
                  ...currentAnalysis,
                  ...(input.procedureSlug !== undefined &&
                      input.procedureSlug !== null && {
                          detectedProcedure: input.procedureSlug,
                      }),
                  ...(input.beforeAfterType !== undefined &&
                      input.beforeAfterType !== null && {
                          beforeAfterType: input.beforeAfterType,
                      }),
                  ...(input.bodyArea !== undefined && {
                      bodyArea: input.bodyArea,
                  }),
              }
            : null

        // Update gallery_media
        await db
            .update(galleryMedia)
            .set({
                aiAnalysis: updatedAnalysis,
                ...(input.isBeforeAfter !== undefined && {
                    isBeforeAfter: input.isBeforeAfter,
                }),
            })
            .where(eq(galleryMedia.id, input.mediaId))

        // Handle group assignments (multiple groups)
        if (input.groupIds !== undefined) {
            // Remove all existing group assignments
            await db
                .delete(galleryMediaGroup)
                .where(eq(galleryMediaGroup.mediaId, input.mediaId))

            // Add new group assignments
            if (input.groupIds && input.groupIds.length > 0) {
                const newAssignments = input.groupIds.map((groupId, index) => ({
                    mediaId: input.mediaId,
                    groupId: groupId,
                    displayOrder: index,
                }))
                await db.insert(galleryMediaGroup).values(newAssignments)
            }
        }

        revalidatePath('/social-media/instagram')
        revalidatePath('/gallery')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error updating media analysis:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update analysis',
        }
    }
}
