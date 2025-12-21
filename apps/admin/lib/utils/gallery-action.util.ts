import { revalidatePath } from 'next/cache'

import { UnauthorizedError } from './auth.util'
import {
    getAllGalleryTags,
    CACHE_TAGS,
    revalidateWebAppCache,
} from './revalidate-web.util'

// ============================================================================
// Types
// ============================================================================

type ActionResult = {
    success: boolean
    error?: string
}

// ============================================================================
// Revalidation Helpers
// ============================================================================

/**
 * Revalidate all gallery-related paths in admin app
 */
export function revalidateGalleryPaths(): void {
    revalidatePath('/gallery')
    revalidatePath('/gallery/media')
    revalidatePath('/gallery/groups')
}

/**
 * Revalidate gallery cache in web app with optional slug-specific tags
 */
export async function revalidateGalleryCacheWithSlugs(
    slugs: (string | null | undefined)[]
): Promise<void> {
    const cacheTags = getAllGalleryTags()
    slugs.forEach((slug) => {
        if (slug) {
            cacheTags.push(CACHE_TAGS.galleryMediaBySlug(slug))
        }
    })
    await revalidateWebAppCache(cacheTags)
}

/**
 * Revalidate all gallery paths and web app cache (no slug-specific)
 */
export async function revalidateGalleryCache(): Promise<void> {
    revalidateGalleryPaths()
    await revalidateWebAppCache(getAllGalleryTags())
}

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Check if error is an unauthorized error
 */
export function isUnauthorizedError(error: unknown): boolean {
    return error instanceof UnauthorizedError
}

/**
 * Handle action errors with consistent formatting
 *
 * @param error - The error to handle
 * @param fallbackMessage - Message to show if error is not an Error instance
 * @param logPrefix - Optional prefix for console.error
 * @returns ActionResult with error details
 */
export function handleActionError<T extends ActionResult>(
    error: unknown,
    fallbackMessage: string,
    logPrefix?: string
): T {
    if (isUnauthorizedError(error)) {
        return { success: false, error: 'Unauthorized' } as T
    }

    const errorMessage = logPrefix || fallbackMessage
    console.error(errorMessage, error)

    return {
        success: false,
        error: error instanceof Error ? error.message : fallbackMessage,
    } as T
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate media IDs array
 *
 * @param mediaIds - Array of media IDs to validate
 * @param maxCount - Maximum allowed count
 * @returns ActionResult with error if validation fails, null if validation passes
 */
export function validateMediaIds(
    mediaIds: string[] | undefined,
    maxCount: number
): ActionResult | null {
    if (!mediaIds || mediaIds.length === 0) {
        return { success: false, error: 'No media IDs provided' }
    }

    if (mediaIds.length > maxCount) {
        return {
            success: false,
            error: `Maximum ${maxCount} items can be processed at once`,
        }
    }

    return null
}

/**
 * Validate group ID
 *
 * @param groupId - Group ID to validate
 * @returns ActionResult with error if validation fails, null if validation passes
 */
export function validateGroupId(
    groupId: string | undefined
): ActionResult | null {
    if (!groupId?.trim()) {
        return { success: false, error: 'Group ID is required' }
    }

    return null
}
