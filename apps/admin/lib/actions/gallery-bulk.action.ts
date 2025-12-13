'use server'

import { put } from '@vercel/blob'
import { db } from '@workspace/db/client'
import { galleryMedia, galleryMediaGroup } from '@workspace/db/schema/gallery'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { env } from '@/env'
import {
    analyzeGalleryMediaImage,
    generateSEOContentFromAnalysis,
    generateVisitorContentFromAnalysis,
} from '@/lib/actions/gallery-ai.action'
import { requireAuth } from '@/lib/utils/auth.util'
import {
    getAllGalleryTags,
    revalidateWebAppCache,
} from '@/lib/utils/revalidate-web.util'
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
        if (!groupId?.trim()) {
            return { success: false, error: 'Group ID is required' }
        }

        // Extract files from FormData
        const files: File[] = []
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('file-') && value instanceof File) {
                files.push(value)
            }
        }

        if (files.length === 0) {
            return { success: false, error: 'No files provided' }
        }

        if (files.length > MAX_BULK_UPLOAD_FILES) {
            return {
                success: false,
                error: `Maximum ${MAX_BULK_UPLOAD_FILES} files allowed per upload`,
            }
        }

        // Validate all files before processing
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

        const results: BulkUploadResult[] = []

        // Process each file
        for (const file of files) {
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
                        title: file.name
                            .replace(/\.[^/.]+$/, '')
                            .replace(/[_-]/g, ' '),
                        slug: `gallery-${timestamp}-${randomStr}`,
                        status: 'draft',
                        originalFilename: file.name,
                        fileSize: file.size,
                        mimeType: file.type,
                        displayOrder: 0,
                    })
                    .returning({ id: galleryMedia.id })

                if (!newMedia?.id) {
                    results.push({
                        url: blob.url,
                        error: 'Failed to create media record',
                        originalFilename: file.name,
                    })
                    continue
                }

                results.push({
                    url: blob.url,
                    mediaId: newMedia.id,
                    originalFilename: file.name,
                })
            } catch (error) {
                console.error('Error processing file:', file.name, error)
                results.push({
                    url: '',
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Upload failed',
                    originalFilename: file.name,
                })
            }
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

        // AI analysis in batches (concurrency limit)
        const analysisPromises: Promise<void>[] = []

        for (
            let i = 0;
            i < successfulUploads.length;
            i += MAX_CONCURRENT_ANALYSIS
        ) {
            const batch = successfulUploads.slice(
                i,
                i + MAX_CONCURRENT_ANALYSIS
            )

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
                                seoDescription:
                                    seoResult.content.seoDescription,
                                slug: uniqueSlug,
                            })
                            .where(eq(galleryMedia.id, result.mediaId!))
                    }
                } catch (error) {
                    console.error(
                        'Error analyzing media:',
                        result.mediaId,
                        error
                    )
                }
            })

            analysisPromises.push(...batchPromises)

            // Wait for current batch to complete before starting next batch
            await Promise.all(batchPromises)
        }

        // Revalidate cache
        revalidatePath('/gallery')
        revalidatePath('/gallery/media')
        revalidatePath('/gallery/groups')
        await revalidateWebAppCache(getAllGalleryTags())

        return {
            success: true,
            results,
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error in bulk upload:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to upload files',
        }
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

        if (!groupId?.trim()) {
            return { success: false, error: 'Group ID is required' }
        }

        if (!mediaIds || mediaIds.length === 0) {
            return { success: false, error: 'No media IDs provided' }
        }

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

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')
        revalidatePath('/gallery/groups')
        await revalidateWebAppCache(getAllGalleryTags())

        return { success: true }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error adding media to group:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to add media to group',
        }
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

        if (!groupId?.trim()) {
            return { success: false, error: 'Group ID is required' }
        }

        if (!mediaIds || mediaIds.length === 0) {
            return { success: false, error: 'No media IDs provided' }
        }

        // Delete records from junction table
        await db
            .delete(galleryMediaGroup)
            .where(
                and(
                    eq(galleryMediaGroup.groupId, groupId),
                    inArray(galleryMediaGroup.mediaId, mediaIds)
                )
            )

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')
        revalidatePath('/gallery/groups')
        await revalidateWebAppCache(getAllGalleryTags())

        return { success: true }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error removing media from group:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to remove media from group',
        }
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

        if (!groupId?.trim()) {
            return { success: false, error: 'Group ID is required' }
        }

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

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')
        revalidatePath('/gallery/groups')
        await revalidateWebAppCache(getAllGalleryTags())

        return { success: true }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error reordering group media:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to reorder media',
        }
    }
}
