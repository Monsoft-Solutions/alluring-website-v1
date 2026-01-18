import { env } from '@/env'
import {
    CACHE_TAGS,
    getAllPromotionTags,
    getAllGalleryTags,
    getAllBlogTags,
    getAllTestimonialTags,
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
 * @param tags - Array of cache tags to revalidate
 * @returns Promise that resolves when revalidation is complete
 *
 * @example
 * // After creating/updating/deleting a promotion:
 * await revalidateWebAppCache(['promotions', 'promotion-featured', 'promotion-modal'])
 *
 * @example
 * // After updating a specific promotion:
 * await revalidateWebAppCache(['promotions', 'promotion-summer-sale'])
 */
export async function revalidateWebAppCache(tags: string[]): Promise<void> {
    // Skip if no tags provided
    if (tags.length === 0) {
        return
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
            return
        }

        const data = (await response.json()) as RevalidationResponse

        if (data.revalidated) {
            console.log(
                `[Revalidation] Successfully revalidated tags: ${data.revalidated.join(', ')}`
            )
        }
    } catch (error) {
        // Log error but don't throw - revalidation failure shouldn't break admin operations
        console.error(
            `[Revalidation] Error calling revalidation API:`,
            error instanceof Error ? error.message : 'Unknown error'
        )
    }
}

/**
 * Re-exported from @workspace/shared/cache for convenience.
 * Use these when any promotion, gallery, blog, or testimonial content is created, updated, or deleted.
 */
export {
    CACHE_TAGS,
    getAllPromotionTags,
    getAllGalleryTags,
    getAllBlogTags,
    getAllTestimonialTags,
}

/**
 * Alias for getAllPromotionTags for backwards compatibility.
 * @deprecated Use getAllPromotionTags instead
 */
export { getAllPromotionTags as getAllPromotionCacheTags }
