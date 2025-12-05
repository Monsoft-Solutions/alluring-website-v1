/**
 * Centralized Cache Tag Definitions
 *
 * This module provides a single source of truth for all cache tags used
 * in the application's ISR (Incremental Static Regeneration) strategy.
 *
 * Tags are used with Next.js `unstable_cache` and `revalidateTag` to enable
 * on-demand cache invalidation when content changes in the admin panel.
 *
 * @example
 * // In query functions:
 * import { CACHE_TAGS } from '@workspace/shared/cache'
 * unstable_cache(fn, ['key'], { tags: [CACHE_TAGS.PROMOTIONS] })
 *
 * @example
 * // In revalidation API:
 * import { isValidCacheTag } from '@workspace/shared/cache'
 * if (!isValidCacheTag(tag)) return error
 */

/**
 * Static cache tag constants for different content types
 */
export const CACHE_TAGS = {
    // Promotion tags
    /** Tag for all promotion-related queries */
    PROMOTIONS: 'promotions',
    /** Tag for featured promotion (announcement bar, homepage section) */
    PROMOTION_FEATURED: 'promotion-featured',
    /** Tag for modal promotion */
    PROMOTION_MODAL: 'promotion-modal',

    // Blog tags
    /** Tag for all blog post queries */
    BLOG_POSTS: 'blog-posts',

    /**
     * Generate a tag for a specific promotion by slug
     * @param slug - The promotion slug
     * @returns A unique tag for the specific promotion
     */
    promotionBySlug: (slug: string) => `promotion-${slug}` as const,

    /**
     * Generate a tag for a specific blog post by slug
     * @param slug - The blog post slug
     * @returns A unique tag for the specific blog post
     */
    blogPostBySlug: (slug: string) => `blog-post-${slug}` as const,
} as const

/**
 * Array of static tags that can be revalidated via the API.
 * Dynamic tags (with slugs) are validated separately using prefix matching.
 */
export const ALLOWED_STATIC_TAGS = [
    CACHE_TAGS.PROMOTIONS,
    CACHE_TAGS.PROMOTION_FEATURED,
    CACHE_TAGS.PROMOTION_MODAL,
    CACHE_TAGS.BLOG_POSTS,
] as const

/**
 * Prefixes for dynamic tags that include identifiers (e.g., slugs)
 */
export const DYNAMIC_TAG_PREFIXES = ['promotion-', 'blog-post-'] as const

/**
 * Type representing all valid static cache tags
 */
export type StaticCacheTag = (typeof ALLOWED_STATIC_TAGS)[number]

/**
 * Type representing dynamic tag prefixes
 */
export type DynamicTagPrefix = (typeof DYNAMIC_TAG_PREFIXES)[number]

/**
 * Validates whether a given string is a valid cache tag.
 *
 * Valid tags are either:
 * 1. One of the allowed static tags (e.g., 'promotions', 'blog-posts')
 * 2. A dynamic tag with a valid prefix (e.g., 'promotion-summer-sale')
 *
 * @param tag - The tag string to validate
 * @returns True if the tag is valid for revalidation
 *
 * @example
 * isValidCacheTag('promotions') // true
 * isValidCacheTag('promotion-summer-sale') // true
 * isValidCacheTag('invalid-tag') // false
 */
export function isValidCacheTag(tag: string): boolean {
    // Check if it's a static tag
    if ((ALLOWED_STATIC_TAGS as readonly string[]).includes(tag)) {
        return true
    }

    // Check if it matches a dynamic tag pattern
    // Dynamic tags must have content after the prefix (not just the prefix alone)
    for (const prefix of DYNAMIC_TAG_PREFIXES) {
        if (tag.startsWith(prefix) && tag.length > prefix.length) {
            return true
        }
    }

    return false
}

/**
 * Get all promotion-related tags for bulk revalidation.
 * Use this when any promotion is created, updated, or deleted.
 *
 * @returns Array of all promotion cache tags
 */
export function getAllPromotionTags(): string[] {
    return [
        CACHE_TAGS.PROMOTIONS,
        CACHE_TAGS.PROMOTION_FEATURED,
        CACHE_TAGS.PROMOTION_MODAL,
    ]
}
