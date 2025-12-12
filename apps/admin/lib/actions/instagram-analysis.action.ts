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
import { analyzeGalleryImage, suggestGalleryGroups } from '@workspace/ai'
import { eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

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

/**
 * Generate unique ID for detected pairs
 */
function generatePairId(): string {
    return `pair-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Calculate similarity score between two patient descriptions
 */
function calculatePatientSimilarity(
    a: GalleryMediaAIAnalysis['patientDescription'],
    b: GalleryMediaAIAnalysis['patientDescription']
): number {
    if (!a || !b) return 0.5 // Default if no patient info

    let score = 0
    let factors = 0

    // Gender match (most important)
    if (a.gender === b.gender) {
        score += 0.4
    }
    factors += 0.4

    // Body type match
    if (a.bodyType && b.bodyType && a.bodyType === b.bodyType) {
        score += 0.2
    }
    factors += 0.2

    // Skin tone match
    if (a.skinTone && b.skinTone && a.skinTone === b.skinTone) {
        score += 0.2
    }
    factors += 0.2

    // Age range match
    if (
        a.estimatedAgeRange &&
        b.estimatedAgeRange &&
        a.estimatedAgeRange === b.estimatedAgeRange
    ) {
        score += 0.2
    }
    factors += 0.2

    return score / factors
}

/**
 * Convert AI group suggestions to AISuggestedGroup format
 */
async function convertGroupSuggestions(
    analysis: GalleryMediaAIAnalysis,
    availableGroups: AvailableGroup[]
): Promise<AISuggestedGroup[]> {
    try {
        const suggestion = await suggestGalleryGroups({
            aiAnalysis: analysis,
            availableGroups,
        })

        if (
            !suggestion.suggestedGroups ||
            suggestion.suggestedGroups.length === 0
        ) {
            return []
        }

        // Map slug suggestions to group IDs with full details
        const suggestedGroups: AISuggestedGroup[] = []
        for (const item of suggestion.suggestedGroups) {
            const group = availableGroups.find((g) => g.slug === item.slug)
            if (group) {
                suggestedGroups.push({
                    groupId: group.id,
                    slug: group.slug,
                    name: group.name,
                    confidence: item.confidence,
                    reason: item.reason,
                })
            }
        }

        return suggestedGroups
    } catch (error) {
        console.error('Error getting group suggestions:', error)
        return []
    }
}

/**
 * Pair before/after images based on procedure, body area, and patient similarity
 */
function pairBeforeAfterImages(
    beforeImages: Array<{
        mediaId: string
        mediaUrl: string
        analysis: GalleryMediaAIAnalysis
        postId: string
        postCode: string
        aiSuggestedGroups: AISuggestedGroup[]
    }>,
    afterImages: Array<{
        mediaId: string
        mediaUrl: string
        analysis: GalleryMediaAIAnalysis
        postId: string
        postCode: string
        aiSuggestedGroups: AISuggestedGroup[]
    }>
): {
    pairs: DetectedPair[]
    unpairedBefore: UnpairedMedia[]
    unpairedAfter: UnpairedMedia[]
} {
    const pairs: DetectedPair[] = []
    const usedBeforeIds = new Set<string>()
    const usedAfterIds = new Set<string>()

    // Group images by procedure + bodyArea
    const beforeByKey = new Map<string, (typeof beforeImages)[number][]>()
    const afterByKey = new Map<string, (typeof afterImages)[number][]>()

    for (const img of beforeImages) {
        const key = `${img.analysis.detectedProcedure || 'unknown'}-${img.analysis.bodyArea}`
        if (!beforeByKey.has(key)) beforeByKey.set(key, [])
        beforeByKey.get(key)!.push(img)
    }

    for (const img of afterImages) {
        const key = `${img.analysis.detectedProcedure || 'unknown'}-${img.analysis.bodyArea}`
        if (!afterByKey.has(key)) afterByKey.set(key, [])
        afterByKey.get(key)!.push(img)
    }

    // Match within each procedure+bodyArea group
    for (const [key, befores] of beforeByKey) {
        const afters = afterByKey.get(key) || []

        for (const before of befores) {
            if (usedBeforeIds.has(before.mediaId)) continue

            let bestMatch: (typeof afterImages)[number] | null = null
            let bestScore = 0

            for (const after of afters) {
                if (usedAfterIds.has(after.mediaId)) continue

                const similarity = calculatePatientSimilarity(
                    before.analysis.patientDescription,
                    after.analysis.patientDescription
                )

                if (similarity > bestScore) {
                    bestScore = similarity
                    bestMatch = after
                }
            }

            // Require minimum similarity threshold
            if (bestMatch && bestScore >= 0.5) {
                // Use AI suggestions from before image (primary)
                const aiSuggestedGroups = before.aiSuggestedGroups
                const aiPrimaryGroup =
                    aiSuggestedGroups.length > 0 && aiSuggestedGroups[0]
                        ? aiSuggestedGroups[0].slug
                        : null

                pairs.push({
                    id: generatePairId(),
                    type: 'paired',
                    beforeMediaId: before.mediaId,
                    beforeMediaUrl: before.mediaUrl,
                    afterMediaId: bestMatch.mediaId,
                    afterMediaUrl: bestMatch.mediaUrl,
                    procedureSlug: before.analysis.detectedProcedure ?? null,
                    bodyArea: before.analysis.bodyArea,
                    confidence: bestScore,
                    aiSuggestedGroups,
                    aiPrimaryGroup,
                })

                usedBeforeIds.add(before.mediaId)
                usedAfterIds.add(bestMatch.mediaId)
            }
        }
    }

    // Collect unpaired images
    const unpairedBefore: UnpairedMedia[] = beforeImages
        .filter((img) => !usedBeforeIds.has(img.mediaId))
        .map((img) => ({
            mediaId: img.mediaId,
            mediaUrl: img.mediaUrl,
            beforeAfterType: 'before' as const,
            procedureSlug: img.analysis.detectedProcedure ?? null,
            bodyArea: img.analysis.bodyArea,
            postId: img.postId,
            postCode: img.postCode,
            aiSuggestedGroups: img.aiSuggestedGroups,
            aiAnalysis: img.analysis,
        }))

    const unpairedAfter: UnpairedMedia[] = afterImages
        .filter((img) => !usedAfterIds.has(img.mediaId))
        .map((img) => ({
            mediaId: img.mediaId,
            mediaUrl: img.mediaUrl,
            beforeAfterType: 'after' as const,
            procedureSlug: img.analysis.detectedProcedure ?? null,
            bodyArea: img.analysis.bodyArea,
            postId: img.postId,
            postCode: img.postCode,
            aiSuggestedGroups: img.aiSuggestedGroups,
            aiAnalysis: img.analysis,
        }))

    return { pairs, unpairedBefore, unpairedAfter }
}

// ============================================================================
// Main Analysis Action
// ============================================================================

/**
 * Analyze Instagram posts using AI vision
 *
 * This function:
 * 1. Fetches posts with all media (primary + carousel)
 * 2. Analyzes each image using GPT-4o vision
 * 3. Detects B&A pairs and content types
 * 4. Updates post analysis status
 * 5. Returns structured results for review
 */
export async function analyzeInstagramPosts(
    postIds: string[]
): Promise<BulkAnalysisResult> {
    const result: BulkAnalysisResult = {
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

    try {
        if (postIds.length === 0) {
            return { ...result, error: 'No posts selected for analysis' }
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

            result.stats.totalMedia += imagesToAnalyze.length

            // Analyze each image
            for (const img of imagesToAnalyze) {
                try {
                    const analysis = await analyzeGalleryImage({
                        imageUrl: img.url,
                    })

                    result.stats.analyzedMedia++

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
                    result.stats.failedMedia++

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

            result.analyzedPosts.push(postResult)

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
        result.detectedPairs = pairingResult.pairs

        result.unpairedMedia = [
            ...pairingResult.unpairedBefore,
            ...pairingResult.unpairedAfter,
        ]

        result.nonBAMedia = nonBAMedia

        // Update stats - count side-by-side from nonBAMedia
        const sideBySideCount = nonBAMedia.filter((m) => m.isSideBySide).length
        result.stats.sideBySideCount = sideBySideCount
        result.stats.pairedCount = pairingResult.pairs.length
        result.stats.unpairedCount = result.unpairedMedia.length

        result.success = true

        revalidatePath('/social-media/instagram')

        return result
    } catch (error) {
        console.error('Error in bulk analysis:', error)
        return {
            ...result,
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
