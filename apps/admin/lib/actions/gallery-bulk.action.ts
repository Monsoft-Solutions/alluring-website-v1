'use server'

import { del, put } from '@vercel/blob'
import { db } from '@workspace/db/client'
import { galleryMedia, galleryMediaGroup } from '@workspace/db/schema/gallery'
import { and, eq, inArray, sql } from 'drizzle-orm'

import { env } from '@/env'
import {
    analyzeGalleryMediaImage,
    generateSEOContentFromAnalysis,
    generateVisitorContentFromAnalysis,
} from '@/lib/actions/gallery-ai.action'
import { requireAuth } from '@/lib/utils/auth.util'
import {
    revalidateGalleryPaths,
    revalidateGalleryCacheWithSlugs,
    revalidateGalleryCache,
    handleActionError,
    validateMediaIds,
    validateGroupId,
} from '@/lib/utils/gallery-action.util'
import { ensureUniqueSlug } from '@/lib/utils/slug.util'

// ============================================================================
// Types
// ============================================================================

type ActionResult = {
    success: boolean
    error?: string
}

type BulkUploadResult = {
    url: string
    mediaId?: string
    error?: string
    originalFilename: string
}

type BulkUploadResponse = {
    success: boolean
    error?: string
    results?: BulkUploadResult[]
}

type BulkAnalyzeItem = {
    mediaId: string
    success: boolean
    error?: string
}

type BulkAnalyzeResult = {
    success: boolean
    error?: string
    results?: BulkAnalyzeItem[]
    processedCount?: number
    failedCount?: number
}

type BulkRefreshItem = {
    mediaId: string
    success: boolean
    error?: string
}

type BulkRefreshResult = {
    success: boolean
    error?: string
    results?: BulkRefreshItem[]
    processedCount?: number
    failedCount?: number
}

// ============================================================================
// Constants
// ============================================================================

const MAX_BULK_UPLOAD_FILES = 20
const MAX_CONCURRENT_ANALYSIS = 10

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract files from FormData
 */
function extractFilesFromFormData(formData: FormData): File[] {
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('file-') && value instanceof File) {
            files.push(value)
        }
    }
    return files
}

/**
 * Validate uploaded files
 */
function validateUploadedFiles(
    files: File[]
): { success: true } | { success: false; error: string } {
    if (files.length === 0) {
        return { success: false, error: 'No files provided' }
    }

    if (files.length > MAX_BULK_UPLOAD_FILES) {
        return {
            success: false,
            error: `Maximum ${MAX_BULK_UPLOAD_FILES} files allowed per upload`,
        }
    }

    for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return {
                success: false,
                error: `Invalid file type: ${file.name}. Only images are allowed.`,
            }
        }

        if (file.size > MAX_IMAGE_SIZE) {
            return {
                success: false,
                error: `File too large: ${file.name}. Maximum size is 5MB.`,
            }
        }
    }

    return { success: true }
}

/**
 * Process a single file upload to Vercel Blob and create database record
 */
async function processFileUpload(file: File): Promise<BulkUploadResult> {
    try {
        // Generate unique filename
        const extension = file.name.split('.').pop() || 'jpg'
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const sanitizedName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .substring(0, 50)
        const filename = `gallery/${sanitizedName}-${timestamp}-${randomStr}.${extension}`

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            token: env.BLOB_READ_WRITE_TOKEN,
        })

        // Create initial gallery_media record
        const [newMedia] = await db
            .insert(galleryMedia)
            .values({
                type: 'image',
                url: blob.url,
                title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
                slug: `gallery-${timestamp}-${randomStr}`,
                status: 'draft',
                originalFilename: file.name,
                fileSize: file.size,
                mimeType: file.type,
                displayOrder: 0,
            })
            .returning({ id: galleryMedia.id })

        if (!newMedia?.id) {
            return {
                url: blob.url,
                error: 'Failed to create media record',
                originalFilename: file.name,
            }
        }

        return {
            url: blob.url,
            mediaId: newMedia.id,
            originalFilename: file.name,
        }
    } catch (error) {
        console.error('Error processing file:', file.name, error)
        return {
            url: '',
            error: error instanceof Error ? error.message : 'Upload failed',
            originalFilename: file.name,
        }
    }
}

/**
 * Run AI analysis on uploaded files in batches
 */
async function runBatchAIAnalysis(
    successfulUploads: BulkUploadResult[]
): Promise<void> {
    for (
        let i = 0;
        i < successfulUploads.length;
        i += MAX_CONCURRENT_ANALYSIS
    ) {
        const batch = successfulUploads.slice(i, i + MAX_CONCURRENT_ANALYSIS)

        const batchPromises = batch.map(async (result) => {
            try {
                // Analyze image
                const analysisResult = await analyzeGalleryMediaImage(
                    result.url,
                    result.mediaId
                )

                if (!analysisResult.success || !analysisResult.analysis) {
                    return
                }

                // Generate SEO and visitor content
                const [seoResult, visitorResult] = await Promise.all([
                    generateSEOContentFromAnalysis(
                        analysisResult.analysis,
                        result.originalFilename
                            .replace(/\.[^/.]+$/, '')
                            .replace(/[_-]/g, ' ')
                    ),
                    generateVisitorContentFromAnalysis(
                        analysisResult.analysis,
                        result.originalFilename
                            .replace(/\.[^/.]+$/, '')
                            .replace(/[_-]/g, ' ')
                    ),
                ])

                // Update media with AI-generated content
                if (
                    seoResult.success &&
                    seoResult.content &&
                    visitorResult.success &&
                    visitorResult.content
                ) {
                    // Ensure slug uniqueness before update
                    const uniqueSlug = await ensureUniqueSlug(
                        seoResult.content.slug,
                        result.mediaId
                    )

                    await db
                        .update(galleryMedia)
                        .set({
                            title: visitorResult.content.title,
                            description: visitorResult.content.description,
                            alt: visitorResult.content.alt,
                            seoTitle: seoResult.content.seoTitle,
                            seoDescription: seoResult.content.seoDescription,
                            slug: uniqueSlug,
                        })
                        .where(eq(galleryMedia.id, result.mediaId!))
                }
            } catch (error) {
                console.error('Error analyzing media:', result.mediaId, error)
            }
        })

        // Wait for current batch to complete before starting next batch
        await Promise.all(batchPromises)
    }
}

// ============================================================================
// Bulk Upload Action
// ============================================================================

/**
 * Upload multiple images, analyze them with AI, and assign to a group
 *
 * Process:
 * 1. Validate files (type, size, count)
 * 2. Upload each file to Vercel Blob
 * 3. Create gallery_media records
 * 4. Analyze with AI in batches (concurrency limit)
 * 5. Generate SEO content from analysis
 * 6. Assign to group via gallery_media_group
 * 7. Return results (success/failure per file)
 */
export async function bulkUploadAndAssignToGroup(
    groupId: string,
    formData: FormData
): Promise<BulkUploadResponse> {
    try {
        await requireAuth()

        // Validate groupId
        const groupValidation = validateGroupId(groupId)
        if (groupValidation) return groupValidation

        // Extract and validate files
        const files = extractFilesFromFormData(formData)
        const validation = validateUploadedFiles(files)
        if (!validation.success) {
            return { success: false, error: validation.error }
        }

        // Process each file
        const results: BulkUploadResult[] = []
        for (const file of files) {
            const uploadResult = await processFileUpload(file)
            results.push(uploadResult)
        }

        // Get max display order for this group
        const maxOrderResult = await db
            .select({
                maxOrder: sql<number>`COALESCE(MAX(display_order), -1)`,
            })
            .from(galleryMediaGroup)
            .where(eq(galleryMediaGroup.groupId, groupId))

        const startOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1

        // Assign successful uploads to group
        const successfulUploads = results.filter((r) => r.mediaId && !r.error)

        if (successfulUploads.length > 0) {
            await db.insert(galleryMediaGroup).values(
                successfulUploads.map((result, index) => ({
                    mediaId: result.mediaId!,
                    groupId,
                    displayOrder: startOrder + index,
                }))
            )
        }

        // Run AI analysis in batches
        await runBatchAIAnalysis(successfulUploads)

        // Revalidate cache
        await revalidateGalleryCache()

        return {
            success: true,
            results,
        }
    } catch (error) {
        return handleActionError<BulkUploadResponse>(
            error,
            'Failed to upload files',
            'Error in bulk upload:'
        )
    }
}

/**
 * Upload multiple images and analyze them with AI (without group assignment)
 *
 * Process:
 * 1. Validate files (type, size, count)
 * 2. Upload each file to Vercel Blob
 * 3. Create gallery_media records
 * 4. Analyze with AI in batches (concurrency limit)
 * 5. Generate SEO content from analysis
 * 6. Return results (success/failure per file)
 */
export async function bulkUploadMedia(
    formData: FormData
): Promise<BulkUploadResponse> {
    try {
        await requireAuth()

        // Extract and validate files
        const files = extractFilesFromFormData(formData)
        const validation = validateUploadedFiles(files)
        if (!validation.success) {
            return { success: false, error: validation.error }
        }

        // Process each file
        const results: BulkUploadResult[] = []
        for (const file of files) {
            const uploadResult = await processFileUpload(file)
            results.push(uploadResult)
        }

        // Get successful uploads for AI analysis
        const successfulUploads = results.filter((r) => r.mediaId && !r.error)

        // Run AI analysis in batches
        await runBatchAIAnalysis(successfulUploads)

        // Revalidate cache
        await revalidateGalleryCache()

        return {
            success: true,
            results,
        }
    } catch (error) {
        return handleActionError<BulkUploadResponse>(
            error,
            'Failed to upload files',
            'Error in bulk upload:'
        )
    }
}

// ============================================================================
// Add Media to Group Action
// ============================================================================

/**
 * Add existing media items to a group
 *
 * Process:
 * 1. Validate group exists
 * 2. Get max display_order in group
 * 3. Insert records into gallery_media_group table
 * 4. Revalidate cache
 */
export async function addMediaToGroup(
    groupId: string,
    mediaIds: string[],
    displayOrders?: number[]
): Promise<ActionResult> {
    try {
        await requireAuth()

        const groupValidation = validateGroupId(groupId)
        if (groupValidation) return groupValidation

        const mediaValidation = validateMediaIds(mediaIds, 1000)
        if (mediaValidation) return mediaValidation

        // Get max display order for this group
        const maxOrderResult = await db
            .select({
                maxOrder: sql<number>`COALESCE(MAX(display_order), -1)`,
            })
            .from(galleryMediaGroup)
            .where(eq(galleryMediaGroup.groupId, groupId))

        const startOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1

        // Insert records (skip duplicates silently)
        const values = mediaIds.map((mediaId, index) => ({
            mediaId,
            groupId,
            displayOrder: displayOrders
                ? (displayOrders[index] ?? startOrder + index)
                : startOrder + index,
        }))

        await db.insert(galleryMediaGroup).values(values).onConflictDoNothing() // Skip if already in group

        await revalidateGalleryCache()

        return { success: true }
    } catch (error) {
        return handleActionError(
            error,
            'Failed to add media to group',
            'Error adding media to group:'
        )
    }
}

// ============================================================================
// Remove Media from Group Action
// ============================================================================

/**
 * Remove media items from a group
 */
export async function removeMediaFromGroup(
    groupId: string,
    mediaIds: string[]
): Promise<ActionResult> {
    try {
        await requireAuth()

        const groupValidation = validateGroupId(groupId)
        if (groupValidation) return groupValidation

        const mediaValidation = validateMediaIds(mediaIds, 1000)
        if (mediaValidation) return mediaValidation

        // Delete records from junction table
        await db
            .delete(galleryMediaGroup)
            .where(
                and(
                    eq(galleryMediaGroup.groupId, groupId),
                    inArray(galleryMediaGroup.mediaId, mediaIds)
                )
            )

        await revalidateGalleryCache()

        return { success: true }
    } catch (error) {
        return handleActionError(
            error,
            'Failed to remove media from group',
            'Error removing media from group:'
        )
    }
}

// ============================================================================
// Reorder Group Media Action
// ============================================================================

/**
 * Update display order of media items in a group
 *
 * Uses transaction to ensure atomicity
 */
export async function reorderGroupMedia(
    groupId: string,
    mediaOrders: Array<{ mediaId: string; displayOrder: number }>
): Promise<ActionResult> {
    try {
        await requireAuth()

        const groupValidation = validateGroupId(groupId)
        if (groupValidation) return groupValidation

        if (!mediaOrders || mediaOrders.length === 0) {
            return { success: false, error: 'No media orders provided' }
        }

        // Update display orders in transaction
        await db.transaction(async (tx) => {
            for (const { mediaId, displayOrder } of mediaOrders) {
                await tx
                    .update(galleryMediaGroup)
                    .set({ displayOrder })
                    .where(
                        and(
                            eq(galleryMediaGroup.groupId, groupId),
                            eq(galleryMediaGroup.mediaId, mediaId)
                        )
                    )
            }
        })

        await revalidateGalleryCache()

        return { success: true }
    } catch (error) {
        return handleActionError(
            error,
            'Failed to reorder media',
            'Error reordering group media:'
        )
    }
}

// ============================================================================
// Bulk Update Media Status Action
// ============================================================================

/**
 * Update status for multiple media items at once
 *
 * @param mediaIds - Array of media IDs to update
 * @param status - New status to apply
 * @returns ActionResult
 */
export async function bulkUpdateMediaStatus(
    mediaIds: string[],
    status: 'draft' | 'published' | 'archived'
): Promise<ActionResult> {
    try {
        await requireAuth()

        const validation = validateMediaIds(mediaIds, 100)
        if (validation) return validation

        // Get current status of all media for publishedAt logic and slug for cache
        const currentMedia = await db
            .select({
                id: galleryMedia.id,
                status: galleryMedia.status,
                slug: galleryMedia.slug,
            })
            .from(galleryMedia)
            .where(inArray(galleryMedia.id, mediaIds))

        if (currentMedia.length === 0) {
            return { success: false, error: 'No media found' }
        }

        // Determine which items need publishedAt updated
        const now = new Date()
        await db.transaction(async (tx) => {
            for (const media of currentMedia) {
                const wasPublished = media.status === 'published'
                const isNowPublished = status === 'published'

                await tx
                    .update(galleryMedia)
                    .set({
                        status,
                        ...(!wasPublished && isNowPublished
                            ? { publishedAt: now }
                            : {}),
                    })
                    .where(eq(galleryMedia.id, media.id))
            }
        })

        revalidateGalleryPaths()
        await revalidateGalleryCacheWithSlugs(currentMedia.map((m) => m.slug))

        return { success: true }
    } catch (error) {
        return handleActionError(
            error,
            'Failed to update status',
            'Error updating media status:'
        )
    }
}

// ============================================================================
// Bulk Delete Media Action
// ============================================================================

/**
 * Permanently delete multiple media items
 * Removes from groups, deletes from database, and attempts blob deletion
 *
 * @param mediaIds - Array of media IDs to delete
 * @returns ActionResult
 */
export async function bulkDeleteMedia(
    mediaIds: string[]
): Promise<ActionResult> {
    try {
        await requireAuth()

        const validation = validateMediaIds(mediaIds, 100)
        if (validation) return validation

        // Get media URLs and slugs for blob deletion and cache invalidation
        const mediaToDelete = await db
            .select({
                id: galleryMedia.id,
                url: galleryMedia.url,
                slug: galleryMedia.slug,
            })
            .from(galleryMedia)
            .where(inArray(galleryMedia.id, mediaIds))

        if (mediaToDelete.length === 0) {
            return { success: false, error: 'No media found' }
        }

        // Delete the media records (cascade will handle junction table)
        await db.delete(galleryMedia).where(inArray(galleryMedia.id, mediaIds))

        // Try to delete from blob storage (fire and forget for failures)
        const blobDeletions = mediaToDelete.map(async (media) => {
            if (media.url?.includes('blob.vercel-storage.com')) {
                try {
                    await del(media.url, { token: env.BLOB_READ_WRITE_TOKEN })
                } catch (error) {
                    console.error(
                        'Failed to delete blob for media:',
                        media.id,
                        error
                    )
                }
            }
        })

        // Don't wait for blob deletions
        Promise.all(blobDeletions).catch(() => {
            // Ignore errors
        })

        revalidateGalleryPaths()
        await revalidateGalleryCacheWithSlugs(mediaToDelete.map((m) => m.slug))

        return { success: true }
    } catch (error) {
        return handleActionError(
            error,
            'Failed to delete media',
            'Error deleting media:'
        )
    }
}

// ============================================================================
// Bulk AI Analysis Action
// ============================================================================

/**
 * Analyze multiple media items with AI
 * Updates aiAnalysis field and auto-sets isBeforeAfter if detected
 *
 * @param mediaIds - Array of media IDs to analyze
 * @returns BulkAnalyzeResult with per-item results
 */
export async function bulkAnalyzeMedia(
    mediaIds: string[]
): Promise<BulkAnalyzeResult> {
    try {
        await requireAuth()

        const validation = validateMediaIds(mediaIds, 50)
        if (validation) return validation as BulkAnalyzeResult

        // Get media URLs
        const mediaItems = await db
            .select({
                id: galleryMedia.id,
                url: galleryMedia.url,
                type: galleryMedia.type,
            })
            .from(galleryMedia)
            .where(inArray(galleryMedia.id, mediaIds))

        if (mediaItems.length === 0) {
            return { success: false, error: 'No media found' }
        }

        // Only analyze images
        const imagesToAnalyze = mediaItems.filter((m) => m.type === 'image')

        if (imagesToAnalyze.length === 0) {
            return {
                success: false,
                error: 'No images found to analyze (videos not supported)',
            }
        }

        const results: BulkAnalyzeItem[] = []
        let processedCount = 0
        let failedCount = 0

        // Process in batches with concurrency limit
        for (
            let i = 0;
            i < imagesToAnalyze.length;
            i += MAX_CONCURRENT_ANALYSIS
        ) {
            const batch = imagesToAnalyze.slice(i, i + MAX_CONCURRENT_ANALYSIS)

            const batchResults = await Promise.all(
                batch.map(async (media) => {
                    try {
                        const analysisResult = await analyzeGalleryMediaImage(
                            media.url,
                            media.id
                        )

                        if (analysisResult.success) {
                            processedCount++
                            return {
                                mediaId: media.id,
                                success: true,
                            }
                        } else {
                            failedCount++
                            return {
                                mediaId: media.id,
                                success: false,
                                error:
                                    analysisResult.error || 'Analysis failed',
                            }
                        }
                    } catch (error) {
                        failedCount++
                        return {
                            mediaId: media.id,
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'Analysis failed',
                        }
                    }
                })
            )

            results.push(...batchResults)
        }

        revalidateGalleryPaths()

        return {
            success: true,
            results,
            processedCount,
            failedCount,
        }
    } catch (error) {
        return handleActionError<BulkAnalyzeResult>(
            error,
            'Failed to analyze media',
            'Error analyzing media:'
        )
    }
}

// ============================================================================
// Bulk Refresh Content Action
// ============================================================================

/**
 * Regenerate SEO and visitor content for multiple media items
 * Requires existing AI analysis
 *
 * @param mediaIds - Array of media IDs to refresh content for
 * @returns BulkRefreshResult with per-item results
 */
export async function bulkRefreshContent(
    mediaIds: string[]
): Promise<BulkRefreshResult> {
    try {
        await requireAuth()

        const validation = validateMediaIds(mediaIds, 100)
        if (validation) return validation as BulkRefreshResult

        // Get media with AI analysis
        const mediaItems = await db
            .select({
                id: galleryMedia.id,
                title: galleryMedia.title,
                slug: galleryMedia.slug,
                aiAnalysis: galleryMedia.aiAnalysis,
            })
            .from(galleryMedia)
            .where(inArray(galleryMedia.id, mediaIds))

        if (mediaItems.length === 0) {
            return { success: false, error: 'No media found' }
        }

        // Filter items with AI analysis
        const itemsWithAnalysis = mediaItems.filter((m) => m.aiAnalysis)

        if (itemsWithAnalysis.length === 0) {
            return {
                success: false,
                error: 'No media with AI analysis found. Please analyze images first.',
            }
        }

        const results: BulkRefreshItem[] = []
        let processedCount = 0
        let failedCount = 0

        // Process in batches to avoid overwhelming the AI API
        for (
            let i = 0;
            i < itemsWithAnalysis.length;
            i += MAX_CONCURRENT_ANALYSIS
        ) {
            const batch = itemsWithAnalysis.slice(
                i,
                i + MAX_CONCURRENT_ANALYSIS
            )

            const batchResults = await Promise.all(
                batch.map(async (media) => {
                    try {
                        // Generate new SEO and visitor content
                        const [seoResult, visitorResult] = await Promise.all([
                            generateSEOContentFromAnalysis(
                                media.aiAnalysis!,
                                media.title
                            ),
                            generateVisitorContentFromAnalysis(
                                media.aiAnalysis!,
                                media.title
                            ),
                        ])

                        if (
                            seoResult.success &&
                            seoResult.content &&
                            visitorResult.success &&
                            visitorResult.content
                        ) {
                            // Ensure slug uniqueness
                            const uniqueSlug = await ensureUniqueSlug(
                                seoResult.content.slug,
                                media.id
                            )

                            // Update media
                            await db
                                .update(galleryMedia)
                                .set({
                                    title: visitorResult.content.title,
                                    description:
                                        visitorResult.content.description,
                                    alt: visitorResult.content.alt,
                                    seoTitle: seoResult.content.seoTitle,
                                    seoDescription:
                                        seoResult.content.seoDescription,
                                    slug: uniqueSlug,
                                })
                                .where(eq(galleryMedia.id, media.id))

                            processedCount++
                            return {
                                mediaId: media.id,
                                success: true,
                            }
                        } else {
                            failedCount++
                            return {
                                mediaId: media.id,
                                success: false,
                                error: 'Failed to generate content',
                            }
                        }
                    } catch (error) {
                        failedCount++
                        return {
                            mediaId: media.id,
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'Content generation failed',
                        }
                    }
                })
            )

            results.push(...batchResults)
        }

        revalidateGalleryPaths()
        await revalidateGalleryCacheWithSlugs(mediaItems.map((m) => m.slug))

        return {
            success: true,
            results,
            processedCount,
            failedCount,
        }
    } catch (error) {
        return handleActionError<BulkRefreshResult>(
            error,
            'Failed to refresh content',
            'Error refreshing content:'
        )
    }
}

// ============================================================================
// Bulk Generate SEO Content Action
// ============================================================================

/**
 * Generate only SEO content for multiple media items
 * Requires existing AI analysis
 *
 * @param mediaIds - Array of media IDs to generate SEO content for
 * @returns BulkRefreshResult with per-item results
 */
export async function bulkGenerateSEOContent(
    mediaIds: string[]
): Promise<BulkRefreshResult> {
    try {
        await requireAuth()

        const validation = validateMediaIds(mediaIds, 100)
        if (validation) return validation as BulkRefreshResult

        // Get media with AI analysis
        const mediaItems = await db
            .select({
                id: galleryMedia.id,
                title: galleryMedia.title,
                slug: galleryMedia.slug,
                aiAnalysis: galleryMedia.aiAnalysis,
            })
            .from(galleryMedia)
            .where(inArray(galleryMedia.id, mediaIds))

        if (mediaItems.length === 0) {
            return { success: false, error: 'No media found' }
        }

        // Filter items with AI analysis
        const itemsWithAnalysis = mediaItems.filter((m) => m.aiAnalysis)

        if (itemsWithAnalysis.length === 0) {
            return {
                success: false,
                error: 'No media with AI analysis found. Please analyze images first.',
            }
        }

        const results: BulkRefreshItem[] = []
        let processedCount = 0
        let failedCount = 0

        // Process in batches to avoid overwhelming the AI API
        for (
            let i = 0;
            i < itemsWithAnalysis.length;
            i += MAX_CONCURRENT_ANALYSIS
        ) {
            const batch = itemsWithAnalysis.slice(
                i,
                i + MAX_CONCURRENT_ANALYSIS
            )

            const batchResults = await Promise.all(
                batch.map(async (media) => {
                    try {
                        // Generate SEO content only
                        const seoResult = await generateSEOContentFromAnalysis(
                            media.aiAnalysis!,
                            media.title
                        )

                        if (seoResult.success && seoResult.content) {
                            // Ensure slug uniqueness
                            const uniqueSlug = await ensureUniqueSlug(
                                seoResult.content.slug,
                                media.id
                            )

                            // Update only SEO fields
                            await db
                                .update(galleryMedia)
                                .set({
                                    seoTitle: seoResult.content.seoTitle,
                                    seoDescription:
                                        seoResult.content.seoDescription,
                                    slug: uniqueSlug,
                                })
                                .where(eq(galleryMedia.id, media.id))

                            processedCount++
                            return {
                                mediaId: media.id,
                                success: true,
                            }
                        } else {
                            failedCount++
                            return {
                                mediaId: media.id,
                                success: false,
                                error: 'Failed to generate SEO content',
                            }
                        }
                    } catch (error) {
                        failedCount++
                        return {
                            mediaId: media.id,
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'SEO content generation failed',
                        }
                    }
                })
            )

            results.push(...batchResults)
        }

        revalidateGalleryPaths()
        await revalidateGalleryCacheWithSlugs(mediaItems.map((m) => m.slug))

        return {
            success: true,
            results,
            processedCount,
            failedCount,
        }
    } catch (error) {
        return handleActionError<BulkRefreshResult>(
            error,
            'Failed to generate SEO content',
            'Error generating SEO content:'
        )
    }
}

// ============================================================================
// Bulk Generate Visitor Content Action
// ============================================================================

/**
 * Generate only visitor-facing content for multiple media items
 * Requires existing AI analysis
 *
 * @param mediaIds - Array of media IDs to generate visitor content for
 * @returns BulkRefreshResult with per-item results
 */
export async function bulkGenerateVisitorContent(
    mediaIds: string[]
): Promise<BulkRefreshResult> {
    try {
        await requireAuth()

        const validation = validateMediaIds(mediaIds, 100)
        if (validation) return validation as BulkRefreshResult

        // Get media with AI analysis
        const mediaItems = await db
            .select({
                id: galleryMedia.id,
                title: galleryMedia.title,
                aiAnalysis: galleryMedia.aiAnalysis,
            })
            .from(galleryMedia)
            .where(inArray(galleryMedia.id, mediaIds))

        if (mediaItems.length === 0) {
            return { success: false, error: 'No media found' }
        }

        // Filter items with AI analysis
        const itemsWithAnalysis = mediaItems.filter((m) => m.aiAnalysis)

        if (itemsWithAnalysis.length === 0) {
            return {
                success: false,
                error: 'No media with AI analysis found. Please analyze images first.',
            }
        }

        const results: BulkRefreshItem[] = []
        let processedCount = 0
        let failedCount = 0

        // Process in batches to avoid overwhelming the AI API
        for (
            let i = 0;
            i < itemsWithAnalysis.length;
            i += MAX_CONCURRENT_ANALYSIS
        ) {
            const batch = itemsWithAnalysis.slice(
                i,
                i + MAX_CONCURRENT_ANALYSIS
            )

            const batchResults = await Promise.all(
                batch.map(async (media) => {
                    try {
                        // Generate visitor content only
                        const visitorResult =
                            await generateVisitorContentFromAnalysis(
                                media.aiAnalysis!,
                                media.title
                            )

                        if (visitorResult.success && visitorResult.content) {
                            // Update only visitor-facing fields
                            await db
                                .update(galleryMedia)
                                .set({
                                    title: visitorResult.content.title,
                                    description:
                                        visitorResult.content.description,
                                    alt: visitorResult.content.alt,
                                })
                                .where(eq(galleryMedia.id, media.id))

                            processedCount++
                            return {
                                mediaId: media.id,
                                success: true,
                            }
                        } else {
                            failedCount++
                            return {
                                mediaId: media.id,
                                success: false,
                                error: 'Failed to generate visitor content',
                            }
                        }
                    } catch (error) {
                        failedCount++
                        return {
                            mediaId: media.id,
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'Visitor content generation failed',
                        }
                    }
                })
            )

            results.push(...batchResults)
        }

        revalidateGalleryPaths()
        await revalidateGalleryCache()

        return {
            success: true,
            results,
            processedCount,
            failedCount,
        }
    } catch (error) {
        return handleActionError<BulkRefreshResult>(
            error,
            'Failed to generate visitor content',
            'Error generating visitor content:'
        )
    }
}
