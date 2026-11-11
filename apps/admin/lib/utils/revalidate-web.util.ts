import { env } from '@/env'
import {
    CACHE_TAGS,
    getAllPromotionTags,
    getAllGalleryTags,
    getAllBlogTags,
} from '@workspace/shared/cache'

/**
 * Response from the web app's revalidation API
 */
type RevalidationResponse = {
    revalidated?: string[]
    timestamp?: number
    error?: string
    invalidTags?: string[]
}

/**
 * Revalidate the web app's cache by calling its revalidation API.
 *
 * This function is called after content changes in the admin panel to ensure
 * the public website immediately reflects the updates without waiting for
 * the cache TTL to expire.
 *
 * Never throws: a failure is logged and reported as `false`, so a caller
 * that must surface it (the publish-scheduled cron) can, and the rest can
 * keep ignoring it.
 *
 * @param tags - Array of cache tags to revalidate
 * @returns true when the web app confirmed the revalidation (or there was
 *   nothing to revalidate), false when the call failed
 *
 * @example
 * // After creating/updating/deleting a promotion:
 * await revalidateWebAppCache(['promotions', 'promotion-featured', 'promotion-modal'])
 *
 * @example
 * // After updating a specific promotion:
 * await revalidateWebAppCache(['promotions', 'promotion-summer-sale'])
 */
export async function revalidateWebAppCache(tags: string[]): Promise<boolean> {
    // Skip if no tags provided
    if (tags.length === 0) {
        return true
    }

    const webUrl = env.NEXT_PUBLIC_WEB_URL
    const revalidationSecret = env.REVALIDATION_SECRET

    try {
        const response = await fetch(`${webUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: revalidationSecret,
                tags,
            }),
        })

        if (!response.ok) {
            const data = (await response.json()) as RevalidationResponse
            console.error(
                `[Revalidation] Failed to revalidate cache:`,
                data.error ?? response.statusText,
                data.invalidTags
                    ? `Invalid tags: ${data.invalidTags.join(', ')}`
                    : ''
            )
            return false
        }

        const data = (await response.json()) as RevalidationResponse

        if (data.revalidated) {
            console.log(
                `[Revalidation] Successfully revalidated tags: ${data.revalidated.join(', ')}`
            )
        }
        return true
    } catch (error) {
        // Log error but don't throw - revalidation failure shouldn't break admin operations
        console.error(
            `[Revalidation] Error calling revalidation API:`,
            error instanceof Error ? error.message : 'Unknown error'
        )
        return false
    }
}

/**
 * Re-exported from @workspace/shared/cache for convenience.
 * Use these when any promotion, gallery, or blog content is created, updated, or deleted.
 */
export { CACHE_TAGS, getAllPromotionTags, getAllGalleryTags, getAllBlogTags }

/**
 * Alias for getAllPromotionTags for backwards compatibility.
 * @deprecated Use getAllPromotionTags instead
 */
export { getAllPromotionTags as getAllPromotionCacheTags }
