'use server'

import { db } from '@workspace/db/client'
import {
    beforeAfterPair,
    galleryGroup,
    galleryMedia,
    galleryMediaGroup,
} from '@workspace/db/schema/gallery'
import { del } from '@vercel/blob'
import { eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { env } from '@/env'

// ============================================================================
// Types
// ============================================================================

type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

export type GalleryMediaFormData = {
    type: 'image' | 'video'
    url: string
    thumbnailUrl?: string | null
    title: string
    description?: string | null
    alt?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
    slug: string
    width?: number | null
    height?: number | null
    duration?: number | null
    fileSize?: number | null
    mimeType?: string | null
    originalFilename?: string | null
    blurDataUrl?: string | null
    isFeatured?: boolean
    isBeforeAfter?: boolean
    displayOrder?: number
    status: 'draft' | 'published' | 'archived'
    groupIds?: string[]
}

export type GalleryGroupFormData = {
    name: string
    slug: string
    description?: string | null
    coverImageId?: string | null
    displayOrder?: number
    isVisible?: boolean
}

export type BeforeAfterPairFormData = {
    beforeMediaId: string
    afterMediaId: string
    procedureType?: string | null
    procedureSlug?: string | null
    patientInfo?: string | null
    timeframe?: string | null
    isFeatured?: boolean
    displayOrder?: number
}

// ============================================================================
// Gallery Media Actions
// ============================================================================

export async function createGalleryMedia(
    data: GalleryMediaFormData
): Promise<ActionResult> {
    try {
        // Validate required fields
        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }
        if (!data.url?.trim()) {
            return { success: false, error: 'URL is required' }
        }

        // Check if slug already exists
        const existingMedia = await db
            .select({ id: galleryMedia.id })
            .from(galleryMedia)
            .where(eq(galleryMedia.slug, data.slug))
            .limit(1)

        if (existingMedia.length > 0) {
            return {
                success: false,
                error: 'A media item with this slug already exists',
            }
        }

        // Create the media record
        const [newMedia] = await db
            .insert(galleryMedia)
            .values({
                type: data.type,
                url: data.url,
                thumbnailUrl: data.thumbnailUrl ?? null,
                title: data.title,
                description: data.description ?? null,
                alt: data.alt ?? null,
                seoTitle: data.seoTitle ?? null,
                seoDescription: data.seoDescription ?? null,
                slug: data.slug,
                width: data.width ?? null,
                height: data.height ?? null,
                duration: data.duration ?? null,
                fileSize: data.fileSize ?? null,
                mimeType: data.mimeType ?? null,
                originalFilename: data.originalFilename ?? null,
                blurDataUrl: data.blurDataUrl ?? null,
                isFeatured: data.isFeatured ?? false,
                isBeforeAfter: data.isBeforeAfter ?? false,
                displayOrder: data.displayOrder ?? 0,
                status: data.status,
                publishedAt: data.status === 'published' ? new Date() : null,
            })
            .returning({ id: galleryMedia.id })

        // Add to groups if specified
        if (data.groupIds && data.groupIds.length > 0 && newMedia?.id) {
            await db.insert(galleryMediaGroup).values(
                data.groupIds.map((groupId) => ({
                    mediaId: newMedia.id,
                    groupId,
                    displayOrder: 0,
                }))
            )
        }

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')

        return { success: true, id: newMedia?.id }
    } catch (error) {
        console.error('Error creating gallery media:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create media',
        }
    }
}

export async function updateGalleryMedia(
    id: string,
    data: GalleryMediaFormData
): Promise<ActionResult> {
    try {
        // Validate required fields
        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        // Check if slug already exists for another item
        const existingMedia = await db
            .select({ id: galleryMedia.id })
            .from(galleryMedia)
            .where(eq(galleryMedia.slug, data.slug))
            .limit(1)

        if (existingMedia.length > 0 && existingMedia[0]?.id !== id) {
            return {
                success: false,
                error: 'A media item with this slug already exists',
            }
        }

        // Get current media to check status change
        const currentMedia = await db
            .select({
                status: galleryMedia.status,
                url: galleryMedia.url,
            })
            .from(galleryMedia)
            .where(eq(galleryMedia.id, id))
            .limit(1)

        if (!currentMedia.length) {
            return { success: false, error: 'Media not found' }
        }

        // Determine if we need to update publishedAt
        const wasPublished = currentMedia[0]?.status === 'published'
        const isNowPublished = data.status === 'published'
        const publishedAt =
            !wasPublished && isNowPublished ? new Date() : undefined

        // Update the media
        await db
            .update(galleryMedia)
            .set({
                type: data.type,
                url: data.url,
                thumbnailUrl: data.thumbnailUrl ?? null,
                title: data.title,
                description: data.description ?? null,
                alt: data.alt ?? null,
                seoTitle: data.seoTitle ?? null,
                seoDescription: data.seoDescription ?? null,
                slug: data.slug,
                width: data.width ?? null,
                height: data.height ?? null,
                duration: data.duration ?? null,
                fileSize: data.fileSize ?? null,
                mimeType: data.mimeType ?? null,
                originalFilename: data.originalFilename ?? null,
                blurDataUrl: data.blurDataUrl ?? null,
                isFeatured: data.isFeatured ?? false,
                isBeforeAfter: data.isBeforeAfter ?? false,
                displayOrder: data.displayOrder ?? 0,
                status: data.status,
                ...(publishedAt ? { publishedAt } : {}),
            })
            .where(eq(galleryMedia.id, id))

        // Update group associations
        if (data.groupIds !== undefined) {
            // Remove existing associations
            await db
                .delete(galleryMediaGroup)
                .where(eq(galleryMediaGroup.mediaId, id))

            // Add new associations
            if (data.groupIds.length > 0) {
                await db.insert(galleryMediaGroup).values(
                    data.groupIds.map((groupId) => ({
                        mediaId: id,
                        groupId,
                        displayOrder: 0,
                    }))
                )
            }
        }

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')
        revalidatePath(`/gallery/media/${id}/edit`)

        return { success: true, id }
    } catch (error) {
        console.error('Error updating gallery media:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update media',
        }
    }
}

export async function deleteGalleryMedia(id: string): Promise<ActionResult> {
    try {
        // Get the media to retrieve the URL for blob deletion
        const [media] = await db
            .select({ url: galleryMedia.url })
            .from(galleryMedia)
            .where(eq(galleryMedia.id, id))
            .limit(1)

        if (!media) {
            return { success: false, error: 'Media not found' }
        }

        // Delete the media record (cascade will handle junction table)
        await db.delete(galleryMedia).where(eq(galleryMedia.id, id))

        // Try to delete from blob storage
        if (media.url?.includes('blob.vercel-storage.com')) {
            try {
                await del(media.url, { token: env.BLOB_READ_WRITE_TOKEN })
            } catch {
                // Ignore blob deletion errors
            }
        }

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')

        return { success: true }
    } catch (error) {
        console.error('Error deleting gallery media:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete media',
        }
    }
}

export async function updateMediaStatus(
    id: string,
    status: 'draft' | 'published' | 'archived'
): Promise<ActionResult> {
    try {
        const currentMedia = await db
            .select({ status: galleryMedia.status })
            .from(galleryMedia)
            .where(eq(galleryMedia.id, id))
            .limit(1)

        if (!currentMedia.length) {
            return { success: false, error: 'Media not found' }
        }

        const wasPublished = currentMedia[0]?.status === 'published'
        const isNowPublished = status === 'published'
        const publishedAt =
            !wasPublished && isNowPublished ? new Date() : undefined

        await db
            .update(galleryMedia)
            .set({
                status,
                ...(publishedAt ? { publishedAt } : {}),
            })
            .where(eq(galleryMedia.id, id))

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')

        return { success: true }
    } catch (error) {
        console.error('Error updating media status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
        }
    }
}

export async function toggleMediaFeatured(
    id: string,
    isFeatured: boolean
): Promise<ActionResult> {
    try {
        await db
            .update(galleryMedia)
            .set({ isFeatured })
            .where(eq(galleryMedia.id, id))

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')

        return { success: true }
    } catch (error) {
        console.error('Error toggling featured status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update featured status',
        }
    }
}

export async function reorderMedia(
    mediaOrders: { id: string; displayOrder: number }[]
): Promise<ActionResult> {
    try {
        await db.transaction(async (tx) => {
            for (const { id, displayOrder } of mediaOrders) {
                await tx
                    .update(galleryMedia)
                    .set({ displayOrder })
                    .where(eq(galleryMedia.id, id))
            }
        })

        revalidatePath('/gallery')
        revalidatePath('/gallery/media')

        return { success: true }
    } catch (error) {
        console.error('Error reordering media:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to reorder media',
        }
    }
}

// ============================================================================
// Gallery Group Actions
// ============================================================================

export async function createGalleryGroup(
    data: GalleryGroupFormData
): Promise<ActionResult> {
    try {
        // Validate required fields
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        // Check if slug already exists
        const existingGroup = await db
            .select({ id: galleryGroup.id })
            .from(galleryGroup)
            .where(eq(galleryGroup.slug, data.slug))
            .limit(1)

        if (existingGroup.length > 0) {
            return {
                success: false,
                error: 'A group with this slug already exists',
            }
        }

        // Get max display order
        const maxOrderResult = await db
            .select({ maxOrder: sql<number>`COALESCE(MAX(display_order), -1)` })
            .from(galleryGroup)

        const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1

        // Create the group
        const [newGroup] = await db
            .insert(galleryGroup)
            .values({
                name: data.name,
                slug: data.slug,
                description: data.description ?? null,
                coverImageId: data.coverImageId ?? null,
                displayOrder: data.displayOrder ?? nextOrder,
                isVisible: data.isVisible ?? true,
            })
            .returning({ id: galleryGroup.id })

        revalidatePath('/gallery')
        revalidatePath('/gallery/groups')

        return { success: true, id: newGroup?.id }
    } catch (error) {
        console.error('Error creating gallery group:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create group',
        }
    }
}

export async function updateGalleryGroup(
    id: string,
    data: GalleryGroupFormData
): Promise<ActionResult> {
    try {
        // Validate required fields
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        // Check if slug already exists for another group
        const existingGroup = await db
            .select({ id: galleryGroup.id })
            .from(galleryGroup)
            .where(eq(galleryGroup.slug, data.slug))
            .limit(1)

        if (existingGroup.length > 0 && existingGroup[0]?.id !== id) {
            return {
                success: false,
                error: 'A group with this slug already exists',
            }
        }

        // Update the group
        await db
            .update(galleryGroup)
            .set({
                name: data.name,
                slug: data.slug,
                description: data.description ?? null,
                coverImageId: data.coverImageId ?? null,
                displayOrder: data.displayOrder,
                isVisible: data.isVisible,
            })
            .where(eq(galleryGroup.id, id))

        revalidatePath('/gallery')
        revalidatePath('/gallery/groups')

        return { success: true, id }
    } catch (error) {
        console.error('Error updating gallery group:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update group',
        }
    }
}

export async function deleteGalleryGroup(id: string): Promise<ActionResult> {
    try {
        // Delete the group (cascade will handle junction table)
        await db.delete(galleryGroup).where(eq(galleryGroup.id, id))

        revalidatePath('/gallery')
        revalidatePath('/gallery/groups')

        return { success: true }
    } catch (error) {
        console.error('Error deleting gallery group:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete group',
        }
    }
}

export async function toggleGroupVisibility(
    id: string,
    isVisible: boolean
): Promise<ActionResult> {
    try {
        await db
            .update(galleryGroup)
            .set({ isVisible })
            .where(eq(galleryGroup.id, id))

        revalidatePath('/gallery')
        revalidatePath('/gallery/groups')

        return { success: true }
    } catch (error) {
        console.error('Error toggling group visibility:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update visibility',
        }
    }
}

export async function reorderGroups(
    groupOrders: { id: string; displayOrder: number }[]
): Promise<ActionResult> {
    try {
        await db.transaction(async (tx) => {
            for (const { id, displayOrder } of groupOrders) {
                await tx
                    .update(galleryGroup)
                    .set({ displayOrder })
                    .where(eq(galleryGroup.id, id))
            }
        })

        revalidatePath('/gallery')
        revalidatePath('/gallery/groups')

        return { success: true }
    } catch (error) {
        console.error('Error reordering groups:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to reorder groups',
        }
    }
}

// ============================================================================
// Before/After Pair Actions
// ============================================================================

export async function createBeforeAfterPair(
    data: BeforeAfterPairFormData
): Promise<ActionResult> {
    try {
        // Validate required fields
        if (!data.beforeMediaId?.trim()) {
            return { success: false, error: 'Before image is required' }
        }
        if (!data.afterMediaId?.trim()) {
            return { success: false, error: 'After image is required' }
        }

        // Get max display order
        const maxOrderResult = await db
            .select({ maxOrder: sql<number>`COALESCE(MAX(display_order), -1)` })
            .from(beforeAfterPair)

        const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1

        // Create the pair
        const [newPair] = await db
            .insert(beforeAfterPair)
            .values({
                beforeMediaId: data.beforeMediaId,
                afterMediaId: data.afterMediaId,
                procedureType: data.procedureType ?? null,
                procedureSlug: data.procedureSlug ?? null,
                patientInfo: data.patientInfo ?? null,
                timeframe: data.timeframe ?? null,
                isFeatured: data.isFeatured ?? false,
                displayOrder: data.displayOrder ?? nextOrder,
            })
            .returning({ id: beforeAfterPair.id })

        // Mark media as before/after
        await db
            .update(galleryMedia)
            .set({
                isBeforeAfter: true,
                beforeAfterId: newPair?.id,
            })
            .where(
                inArray(galleryMedia.id, [
                    data.beforeMediaId,
                    data.afterMediaId,
                ])
            )

        revalidatePath('/gallery')
        revalidatePath('/gallery/before-after')

        return { success: true, id: newPair?.id }
    } catch (error) {
        console.error('Error creating before/after pair:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create pair',
        }
    }
}

export async function updateBeforeAfterPair(
    id: string,
    data: BeforeAfterPairFormData
): Promise<ActionResult> {
    try {
        // Validate required fields
        if (!data.beforeMediaId?.trim()) {
            return { success: false, error: 'Before image is required' }
        }
        if (!data.afterMediaId?.trim()) {
            return { success: false, error: 'After image is required' }
        }

        // Get current pair to clear old media associations
        const currentPair = await db
            .select({
                beforeMediaId: beforeAfterPair.beforeMediaId,
                afterMediaId: beforeAfterPair.afterMediaId,
            })
            .from(beforeAfterPair)
            .where(eq(beforeAfterPair.id, id))
            .limit(1)

        if (!currentPair.length) {
            return { success: false, error: 'Pair not found' }
        }

        // Clear old media associations if they changed
        const oldMediaIds = [
            currentPair[0]?.beforeMediaId,
            currentPair[0]?.afterMediaId,
        ].filter(Boolean) as string[]

        const newMediaIds = [data.beforeMediaId, data.afterMediaId]

        const mediaToUnmark = oldMediaIds.filter(
            (id) => !newMediaIds.includes(id)
        )

        if (mediaToUnmark.length > 0) {
            await db
                .update(galleryMedia)
                .set({
                    isBeforeAfter: false,
                    beforeAfterId: null,
                })
                .where(inArray(galleryMedia.id, mediaToUnmark))
        }

        // Update the pair
        await db
            .update(beforeAfterPair)
            .set({
                beforeMediaId: data.beforeMediaId,
                afterMediaId: data.afterMediaId,
                procedureType: data.procedureType ?? null,
                procedureSlug: data.procedureSlug ?? null,
                patientInfo: data.patientInfo ?? null,
                timeframe: data.timeframe ?? null,
                isFeatured: data.isFeatured ?? false,
                displayOrder: data.displayOrder,
            })
            .where(eq(beforeAfterPair.id, id))

        // Mark new media as before/after
        await db
            .update(galleryMedia)
            .set({
                isBeforeAfter: true,
                beforeAfterId: id,
            })
            .where(inArray(galleryMedia.id, newMediaIds))

        revalidatePath('/gallery')
        revalidatePath('/gallery/before-after')

        return { success: true, id }
    } catch (error) {
        console.error('Error updating before/after pair:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update pair',
        }
    }
}

export async function deleteBeforeAfterPair(id: string): Promise<ActionResult> {
    try {
        // Get the pair to clear media associations
        const pair = await db
            .select({
                beforeMediaId: beforeAfterPair.beforeMediaId,
                afterMediaId: beforeAfterPair.afterMediaId,
            })
            .from(beforeAfterPair)
            .where(eq(beforeAfterPair.id, id))
            .limit(1)

        if (pair.length > 0) {
            // Clear media associations
            const mediaIds = [
                pair[0]?.beforeMediaId,
                pair[0]?.afterMediaId,
            ].filter(Boolean) as string[]

            if (mediaIds.length > 0) {
                await db
                    .update(galleryMedia)
                    .set({
                        isBeforeAfter: false,
                        beforeAfterId: null,
                    })
                    .where(inArray(galleryMedia.id, mediaIds))
            }
        }

        // Delete the pair
        await db.delete(beforeAfterPair).where(eq(beforeAfterPair.id, id))

        revalidatePath('/gallery')
        revalidatePath('/gallery/before-after')

        return { success: true }
    } catch (error) {
        console.error('Error deleting before/after pair:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete pair',
        }
    }
}

export async function togglePairFeatured(
    id: string,
    isFeatured: boolean
): Promise<ActionResult> {
    try {
        await db
            .update(beforeAfterPair)
            .set({ isFeatured })
            .where(eq(beforeAfterPair.id, id))

        revalidatePath('/gallery')
        revalidatePath('/gallery/before-after')

        return { success: true }
    } catch (error) {
        console.error('Error toggling pair featured status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update featured status',
        }
    }
}

export async function reorderPairs(
    pairOrders: { id: string; displayOrder: number }[]
): Promise<ActionResult> {
    try {
        await db.transaction(async (tx) => {
            for (const { id, displayOrder } of pairOrders) {
                await tx
                    .update(beforeAfterPair)
                    .set({ displayOrder })
                    .where(eq(beforeAfterPair.id, id))
            }
        })

        revalidatePath('/gallery')
        revalidatePath('/gallery/before-after')

        return { success: true }
    } catch (error) {
        console.error('Error reordering pairs:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to reorder pairs',
        }
    }
}
