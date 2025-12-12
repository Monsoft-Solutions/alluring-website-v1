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
    let analysisId: string | undefined
    try {
        const analysisName = generateAnalysisName('instagram', 'bulk')
        const createAnalysisResult = await createAnalysis({
            name: analysisName,
            type: 'bulk',
            source: 'instagram',
            status: 'analyzing',
        })

        if (!createAnalysisResult.success || !createAnalysisResult.data) {
            return {
                ...analysisResult,
                error: 'Failed to create analysis record',
            }
        }

        analysisId = createAnalysisResult.data.id
        analysisResult.analysisId = analysisId
    } catch (error) {
        console.error('Error creating analysis record:', error)
        return {
            ...analysisResult,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create analysis',
        }
    }

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
                (item) => item.type === 'image'
            )

            carouselMediaMap = imageItems.reduce(
                (acc, item) => {
                    if (!acc[item.postId]) acc[item.postId] = []
                    acc[item.postId]!.push({
                        mediaId: item.mediaId,
                        url: item.url,
                        displayOrder: item.displayOrder,
                    })
                    return acc
                },
                {} as typeof carouselMediaMap
            )
        }

        // Collect all images to analyze
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

        // Process each post
        for (const post of posts) {
            // Skip videos for now
            if (post.mediaType === 'video') {
                continue
            }

            const postResult: PostAnalysisResult = {
                postId: post.id,
                postCode: post.code,
                mediaType: post.mediaType,
                primaryMedia: {
                    mediaId: post.mediaId,
                    mediaUrl: post.mediaUrl,
                    analysis: null,
                },
                carouselMedia: [],
            }

            // Collect all images for this post
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
                for (const item of carouselItems) {
                    imagesToAnalyze.push({
                        mediaId: item.mediaId,
                        url: item.url,
                        isPrimary: item.displayOrder === 0,
                    })
                }
            }

            analysisResult.stats.totalMedia += imagesToAnalyze.length

            // Analyze each image
            for (const img of imagesToAnalyze) {
                try {
                    const analysis = await analyzeGalleryImage({
                        imageUrl: img.url,
                    })

                    analysisResult.stats.analyzedMedia++

                    const mediaResult: MediaAnalysisResult = {
                        mediaId: img.mediaId,
                        mediaUrl: img.url,
                        analysis,
                    }

                    if (img.isPrimary) {
                        postResult.primaryMedia = mediaResult
                    } else {
                        postResult.carouselMedia.push(mediaResult)
                    }

                    // Save analysis to gallery_media
                    // Mark side-by-side as NOT isBeforeAfter (they're composite images)
                    const isSideBySide =
                        analysis.beforeAfterType === 'side_by_side'
                    await db
                        .update(galleryMedia)
                        .set({
                            aiAnalysis: analysis,
                            isBeforeAfter:
                                analysis.isBeforeAfter && !isSideBySide,
                        })
                        .where(eq(galleryMedia.id, img.mediaId))

                    // Get AI group suggestions for this media
                    const aiSuggestedGroups = await convertGroupSuggestions(
                        analysis,
                        availableGroups
                    )

                    // Categorize based on analysis
                    if (analysis.isBeforeAfter) {
                        if (analysis.beforeAfterType === 'side_by_side') {
                            // Side-by-side image - treat as non-BA content, assign to group
                            nonBAMedia.push({
                                mediaId: img.mediaId,
                                mediaUrl: img.url,
                                contentType: analysis.contentType,
                                procedureSlug:
                                    analysis.detectedProcedure ?? null,
                                postId: post.id,
                                isSideBySide: true,
                                aiSuggestedGroups,
                                aiAnalysis: analysis,
                            })
                        } else if (analysis.beforeAfterType === 'before') {
                            beforeImages.push({
                                mediaId: img.mediaId,
                                mediaUrl: img.url,
                                analysis,
                                postId: post.id,
                                postCode: post.code,
                                aiSuggestedGroups,
                            })
                        } else if (analysis.beforeAfterType === 'after') {
                            afterImages.push({
                                mediaId: img.mediaId,
                                mediaUrl: img.url,
                                analysis,
                                postId: post.id,
                                postCode: post.code,
                                aiSuggestedGroups,
                            })
                        }
                    } else {
                        // Non-B&A content
                        nonBAMedia.push({
                            mediaId: img.mediaId,
                            mediaUrl: img.url,
                            contentType: analysis.contentType,
                            procedureSlug: analysis.detectedProcedure ?? null,
                            postId: post.id,
                            aiSuggestedGroups,
                            aiAnalysis: analysis,
                        })
                    }
                } catch (error) {
                    console.error(
                        `Error analyzing media ${img.mediaId}:`,
                        error
                    )
                    analysisResult.stats.failedMedia++

                    const errorResult: MediaAnalysisResult = {
                        mediaId: img.mediaId,
                        mediaUrl: img.url,
                        analysis: null,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Analysis failed',
                    }

                    if (img.isPrimary) {
                        postResult.primaryMedia = errorResult
                    } else {
                        postResult.carouselMedia.push(errorResult)
                    }
                }
            }

            analysisResult.analyzedPosts.push(postResult)

            // Update post analysis status and save primary media analysis
            await db
                .update(instagramPost)
                .set({
                    analysisStatus: 'analyzed',
                    analyzedAt: new Date(),
                    aiAnalysis: postResult.primaryMedia.analysis,
                })
                .where(eq(instagramPost.id, post.id))
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

        analysisResult.success = true

        // Update analysis record with results
        if (analysisId) {
            await updateAnalysisResult({
                id: analysisId,
                status: 'completed',
                resultData: analysisResult,
            })
        }

        revalidatePath('/social-media/instagram')
        revalidatePath('/analysis')

        return analysisResult
    } catch (error) {
        console.error('Error in bulk analysis:', error)

        // Update analysis record as failed
        if (analysisId) {
            await updateAnalysisResult({
                id: analysisId,
                status: 'failed',
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : 'Failed to analyze posts',
            })
        }

        return {
            ...analysisResult,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to analyze posts',
        }
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
        for (const pair of input.pairs) {
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

        // Apply group assignments for non-B&A content
        for (const assignment of input.groupAssignments) {
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
    } catch (error) {
        console.error('Error applying analysis results:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
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
        const currentAnalysis =
            media.aiAnalysis as GalleryMediaAIAnalysis | null
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
