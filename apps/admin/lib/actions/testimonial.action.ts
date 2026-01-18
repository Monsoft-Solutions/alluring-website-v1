'use server'

import { db } from '@workspace/db/client'
import { patientTestimonial } from '@workspace/db/schema/testimonials'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { instagramPost } from '@workspace/db/schema/social-media'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import {
    revalidateWebAppCache,
    getAllTestimonialTags,
    CACHE_TAGS,
} from '@/lib/utils/revalidate-web.util'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import type { TestimonialFormData } from '@/lib/types/testimonials/testimonial.type'

// ============================================================================
// Types
// ============================================================================

type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

// ============================================================================
// Testimonial Actions
// ============================================================================

/**
 * Create a new testimonial
 */
export async function createTestimonial(
    data: TestimonialFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.patientName?.trim()) {
            return { success: false, error: 'Patient name is required' }
        }
        if (!data.procedure?.trim()) {
            return { success: false, error: 'Procedure is required' }
        }
        if (!data.quote?.trim()) {
            return { success: false, error: 'Quote is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        // Validate source-specific requirements
        if (data.sourceType === 'instagram' && !data.instagramPostId) {
            return {
                success: false,
                error: 'Instagram post is required for Instagram source type',
            }
        }
        if (
            data.sourceType === 'direct' &&
            !data.mediaId &&
            !data.directMediaUrl
        ) {
            return {
                success: false,
                error: 'Media is required for direct upload source type',
            }
        }

        // Handle direct media upload - create gallery_media record if needed
        let mediaId = data.mediaId ?? null
        if (data.sourceType === 'direct' && data.directMediaUrl && !mediaId) {
            const mediaType = data.directMediaType ?? 'video'
            const mediaSlug = `testimonial-${data.slug}-${Date.now()}`

            const [newMedia] = await db
                .insert(galleryMedia)
                .values({
                    type: mediaType,
                    url: data.directMediaUrl,
                    title: `Testimonial - ${data.patientName}`,
                    slug: mediaSlug,
                    status: 'published',
                    publishedAt: new Date(),
                })
                .returning({ id: galleryMedia.id })

            if (newMedia?.id) {
                mediaId = newMedia.id
            }
        }

        // Check if slug already exists
        const existingTestimonial = await db
            .select({ id: patientTestimonial.id })
            .from(patientTestimonial)
            .where(eq(patientTestimonial.slug, data.slug))
            .limit(1)

        if (existingTestimonial.length > 0) {
            return {
                success: false,
                error: 'A testimonial with this slug already exists',
            }
        }

        // Get next display order if featured
        let displayOrder = data.displayOrder ?? 0
        if (data.isFeatured && displayOrder === 0) {
            const maxOrderResult = await db
                .select({
                    maxOrder: sql<number>`COALESCE(MAX(display_order), -1)`,
                })
                .from(patientTestimonial)
                .where(eq(patientTestimonial.isFeatured, true))

            displayOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1
        }

        // Build metadata from Instagram post if applicable
        let metadata = data.metadata ?? {}
        if (data.sourceType === 'instagram' && data.instagramPostId) {
            const igPost = await db
                .select({
                    likeCount: instagramPost.likeCount,
                    commentCount: instagramPost.commentCount,
                    playCount: instagramPost.playCount,
                })
                .from(instagramPost)
                .where(eq(instagramPost.id, data.instagramPostId))
                .limit(1)

            if (igPost[0]) {
                metadata = {
                    ...metadata,
                    instagramEngagement: {
                        likeCount: igPost[0].likeCount ?? undefined,
                        commentCount: igPost[0].commentCount ?? undefined,
                        playCount: igPost[0].playCount ?? undefined,
                    },
                }
            }
        }

        // Create the testimonial
        const [newTestimonial] = await db
            .insert(patientTestimonial)
            .values({
                sourceType: data.sourceType,
                instagramPostId: data.instagramPostId ?? null,
                mediaId: mediaId,
                thumbnailMediaId: data.thumbnailMediaId ?? null,
                patientName: data.patientName,
                procedure: data.procedure,
                procedureSlug: data.procedureSlug ?? null,
                timeframe: data.timeframe ?? null,
                quote: data.quote,
                longDescription: data.longDescription ?? null,
                rating: data.rating,
                isFeatured: data.isFeatured ?? false,
                displayOrder,
                status: data.status,
                slug: data.slug,
                metadata: Object.keys(metadata).length > 0 ? metadata : null,
                publishedAt: data.status === 'published' ? new Date() : null,
            })
            .returning({ id: patientTestimonial.id })

        revalidatePath('/testimonials')

        // Revalidate web app cache
        await revalidateWebAppCache(getAllTestimonialTags())

        return { success: true, id: newTestimonial?.id }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error creating testimonial:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create testimonial',
        }
    }
}

/**
 * Update an existing testimonial
 */
export async function updateTestimonial(
    id: string,
    data: TestimonialFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.patientName?.trim()) {
            return { success: false, error: 'Patient name is required' }
        }
        if (!data.procedure?.trim()) {
            return { success: false, error: 'Procedure is required' }
        }
        if (!data.quote?.trim()) {
            return { success: false, error: 'Quote is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        // Check if slug already exists for another item
        const existingTestimonial = await db
            .select({ id: patientTestimonial.id })
            .from(patientTestimonial)
            .where(eq(patientTestimonial.slug, data.slug))
            .limit(1)

        if (
            existingTestimonial.length > 0 &&
            existingTestimonial[0]?.id !== id
        ) {
            return {
                success: false,
                error: 'A testimonial with this slug already exists',
            }
        }

        // Get current testimonial for comparison
        const currentTestimonial = await db
            .select({
                status: patientTestimonial.status,
                slug: patientTestimonial.slug,
                isFeatured: patientTestimonial.isFeatured,
            })
            .from(patientTestimonial)
            .where(eq(patientTestimonial.id, id))
            .limit(1)

        if (!currentTestimonial.length) {
            return { success: false, error: 'Testimonial not found' }
        }

        const oldSlug = currentTestimonial[0]?.slug

        // Determine if we need to update publishedAt
        const wasPublished = currentTestimonial[0]?.status === 'published'
        const isNowPublished = data.status === 'published'
        const publishedAt =
            !wasPublished && isNowPublished ? new Date() : undefined

        // Handle display order for newly featured items
        let displayOrder = data.displayOrder
        if (
            data.isFeatured &&
            !currentTestimonial[0]?.isFeatured &&
            !displayOrder
        ) {
            const maxOrderResult = await db
                .select({
                    maxOrder: sql<number>`COALESCE(MAX(display_order), -1)`,
                })
                .from(patientTestimonial)
                .where(eq(patientTestimonial.isFeatured, true))

            displayOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1
        }

        // Update the testimonial
        await db
            .update(patientTestimonial)
            .set({
                sourceType: data.sourceType,
                instagramPostId: data.instagramPostId ?? null,
                mediaId: data.mediaId ?? null,
                thumbnailMediaId: data.thumbnailMediaId ?? null,
                patientName: data.patientName,
                procedure: data.procedure,
                procedureSlug: data.procedureSlug ?? null,
                timeframe: data.timeframe ?? null,
                quote: data.quote,
                longDescription: data.longDescription ?? null,
                rating: data.rating,
                isFeatured: data.isFeatured ?? false,
                ...(displayOrder !== undefined ? { displayOrder } : {}),
                status: data.status,
                slug: data.slug,
                metadata: data.metadata ?? null,
                ...(publishedAt ? { publishedAt } : {}),
            })
            .where(eq(patientTestimonial.id, id))

        revalidatePath('/testimonials')
        revalidatePath(`/testimonials/${id}/edit`)

        // Revalidate web app cache - include slug-specific tags
        const cacheTags = getAllTestimonialTags()
        if (oldSlug) {
            cacheTags.push(CACHE_TAGS.testimonialBySlug(oldSlug))
        }
        if (data.slug !== oldSlug) {
            cacheTags.push(CACHE_TAGS.testimonialBySlug(data.slug))
        }
        await revalidateWebAppCache(cacheTags)

        return { success: true, id }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error updating testimonial:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update testimonial',
        }
    }
}

/**
 * Delete a testimonial
 */
export async function deleteTestimonial(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        // Get the testimonial slug for cache invalidation
        const [testimonial] = await db
            .select({ slug: patientTestimonial.slug })
            .from(patientTestimonial)
            .where(eq(patientTestimonial.id, id))
            .limit(1)

        if (!testimonial) {
            return { success: false, error: 'Testimonial not found' }
        }

        const slug = testimonial.slug

        // Delete the testimonial
        await db.delete(patientTestimonial).where(eq(patientTestimonial.id, id))

        revalidatePath('/testimonials')

        // Revalidate web app cache - include slug-specific tag
        const cacheTags = getAllTestimonialTags()
        if (slug) {
            cacheTags.push(CACHE_TAGS.testimonialBySlug(slug))
        }
        await revalidateWebAppCache(cacheTags)

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error deleting testimonial:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete testimonial',
        }
    }
}

/**
 * Toggle testimonial featured status
 */
export async function toggleTestimonialFeatured(
    id: string,
    isFeatured: boolean
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Get slug for cache invalidation
        const [testimonial] = await db
            .select({ slug: patientTestimonial.slug })
            .from(patientTestimonial)
            .where(eq(patientTestimonial.id, id))
            .limit(1)

        // Get next display order if becoming featured
        let displayOrder: number | undefined
        if (isFeatured) {
            const maxOrderResult = await db
                .select({
                    maxOrder: sql<number>`COALESCE(MAX(display_order), -1)`,
                })
                .from(patientTestimonial)
                .where(eq(patientTestimonial.isFeatured, true))

            displayOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1
        }

        await db
            .update(patientTestimonial)
            .set({
                isFeatured,
                ...(displayOrder !== undefined ? { displayOrder } : {}),
            })
            .where(eq(patientTestimonial.id, id))

        revalidatePath('/testimonials')

        // Revalidate web app cache
        const cacheTags = getAllTestimonialTags()
        if (testimonial?.slug) {
            cacheTags.push(CACHE_TAGS.testimonialBySlug(testimonial.slug))
        }
        await revalidateWebAppCache(cacheTags)

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error toggling testimonial featured status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update featured status',
        }
    }
}

/**
 * Update testimonial status
 */
export async function updateTestimonialStatus(
    id: string,
    status: 'draft' | 'published' | 'archived'
): Promise<ActionResult> {
    try {
        await requireAuth()

        const currentTestimonial = await db
            .select({
                status: patientTestimonial.status,
                slug: patientTestimonial.slug,
            })
            .from(patientTestimonial)
            .where(eq(patientTestimonial.id, id))
            .limit(1)

        if (!currentTestimonial.length) {
            return { success: false, error: 'Testimonial not found' }
        }

        const slug = currentTestimonial[0]?.slug
        const wasPublished = currentTestimonial[0]?.status === 'published'
        const isNowPublished = status === 'published'
        const publishedAt =
            !wasPublished && isNowPublished ? new Date() : undefined

        await db
            .update(patientTestimonial)
            .set({
                status,
                ...(publishedAt ? { publishedAt } : {}),
            })
            .where(eq(patientTestimonial.id, id))

        revalidatePath('/testimonials')

        // Revalidate web app cache
        const cacheTags = getAllTestimonialTags()
        if (slug) {
            cacheTags.push(CACHE_TAGS.testimonialBySlug(slug))
        }
        await revalidateWebAppCache(cacheTags)

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error updating testimonial status:', error)
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
 * Reorder featured testimonials
 */
export async function reorderFeaturedTestimonials(
    orders: { id: string; displayOrder: number }[]
): Promise<ActionResult> {
    try {
        await requireAuth()

        await db.transaction(async (tx) => {
            for (const { id, displayOrder } of orders) {
                await tx
                    .update(patientTestimonial)
                    .set({ displayOrder })
                    .where(eq(patientTestimonial.id, id))
            }
        })

        revalidatePath('/testimonials')

        // Revalidate web app cache
        await revalidateWebAppCache(getAllTestimonialTags())

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error reordering testimonials:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to reorder testimonials',
        }
    }
}

// ============================================================================
// Video Analysis Actions
// ============================================================================

type VideoAnalysisActionResult = {
    success: boolean
    error?: string
    analysis?: {
        transcript: string
        keyQuote: string
        patientName: string | null
        procedure: string | null
        longDescription: string
        language?: string
    }
}

/**
 * Analyze a testimonial video using AI
 * Extracts transcript, key quote, patient name, procedure, and marketing description
 */
export async function analyzeTestimonialVideoAction(
    testimonialId: string
): Promise<VideoAnalysisActionResult> {
    try {
        await requireAuth()

        // Dynamically import to avoid bundling issues
        const { analyzeTestimonialVideo, isGeminiConfigured } = await import(
            '@workspace/ai'
        )

        // Check if Gemini is configured
        if (!isGeminiConfigured()) {
            return {
                success: false,
                error: 'Google Gemini API is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY.',
            }
        }

        // Fetch testimonial with media
        const testimonial = await db
            .select({
                id: patientTestimonial.id,
                sourceType: patientTestimonial.sourceType,
                mediaId: patientTestimonial.mediaId,
                instagramPostId: patientTestimonial.instagramPostId,
                metadata: patientTestimonial.metadata,
                slug: patientTestimonial.slug,
            })
            .from(patientTestimonial)
            .where(eq(patientTestimonial.id, testimonialId))
            .limit(1)

        if (!testimonial.length) {
            return { success: false, error: 'Testimonial not found' }
        }

        const testimonialData = testimonial[0]!

        // Get video URL and Instagram caption based on source type
        let videoUrl: string | null = null
        let instagramCaption: string | null = null

        if (testimonialData.mediaId) {
            // Direct upload - get URL from gallery_media
            const media = await db
                .select({ url: galleryMedia.url, type: galleryMedia.type })
                .from(galleryMedia)
                .where(eq(galleryMedia.id, testimonialData.mediaId))
                .limit(1)

            if (media.length && media[0]?.type === 'video') {
                videoUrl = media[0].url
            }
        } else if (testimonialData.instagramPostId) {
            // Instagram - get video URL and caption from instagram_post
            const igPost = await db
                .select({
                    mediaType: instagramPost.mediaType,
                    mediaId: instagramPost.mediaId,
                    caption: instagramPost.caption,
                })
                .from(instagramPost)
                .where(eq(instagramPost.id, testimonialData.instagramPostId))
                .limit(1)

            if (igPost.length && igPost[0]) {
                // Store the caption for context
                instagramCaption = igPost[0].caption

                if (igPost[0].mediaType === 'video' && igPost[0].mediaId) {
                    const igMedia = await db
                        .select({ url: galleryMedia.url })
                        .from(galleryMedia)
                        .where(eq(galleryMedia.id, igPost[0].mediaId))
                        .limit(1)

                    if (igMedia.length) {
                        videoUrl = igMedia[0]!.url
                    }
                }
            }
        }

        if (!videoUrl) {
            return {
                success: false,
                error: 'No video found for this testimonial. Please ensure the testimonial has a video attached.',
            }
        }

        // Analyze the video with Instagram caption context if available
        const analysis = await analyzeTestimonialVideo({
            videoUrl,
            instagramCaption,
        })

        // Update testimonial metadata with analysis results
        const updatedMetadata = {
            ...(testimonialData.metadata || {}),
            videoAnalysis: {
                transcript: analysis.transcript,
                keyQuote: analysis.keyQuote,
                patientName: analysis.patientName,
                procedure: analysis.procedure,
                longDescription: analysis.longDescription,
                analyzedAt: analysis.analyzedAt,
                duration: analysis.duration,
                language: analysis.language,
            },
        }

        await db
            .update(patientTestimonial)
            .set({ metadata: updatedMetadata })
            .where(eq(patientTestimonial.id, testimonialId))

        revalidatePath('/testimonials')
        revalidatePath(`/testimonials/${testimonialId}/edit`)

        // Revalidate web app cache
        const cacheTags = getAllTestimonialTags()
        if (testimonialData.slug) {
            cacheTags.push(CACHE_TAGS.testimonialBySlug(testimonialData.slug))
        }
        await revalidateWebAppCache(cacheTags)

        return {
            success: true,
            analysis: {
                transcript: analysis.transcript,
                keyQuote: analysis.keyQuote,
                patientName: analysis.patientName,
                procedure: analysis.procedure,
                longDescription: analysis.longDescription,
                language: analysis.language,
            },
        }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error analyzing testimonial video:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to analyze video',
        }
    }
}
