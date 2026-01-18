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

    // Gallery tags
    /** Tag for all gallery group queries */
    GALLERY_GROUPS: 'gallery-groups',
    /** Tag for all gallery media queries */
    GALLERY_MEDIA: 'gallery-media',
    /** Tag for all before/after pair queries */
    BEFORE_AFTER_PAIRS: 'before-after-pairs',

    // Instagram tags
    /** Tag for all Instagram post queries */
    INSTAGRAM_POSTS: 'instagram-posts',

    // Testimonial tags
    /** Tag for all testimonial queries */
    TESTIMONIALS: 'testimonials',
    /** Tag for featured testimonials section */
    TESTIMONIALS_FEATURED: 'testimonials-featured',

    // Sitemap URL registry tags
    /** Tag for URL registry used in page classification */
    SITEMAP_URLS: 'sitemap-urls',

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

    /**
     * Generate a tag for a specific gallery group by slug
     * @param slug - The gallery group slug
     * @returns A unique tag for the specific gallery group
     */
    galleryGroupBySlug: (slug: string) => `gallery-group-${slug}` as const,

    /**
     * Generate a tag for a specific gallery media by slug
     * @param slug - The gallery media slug
     * @returns A unique tag for the specific gallery media
     */
    galleryMediaBySlug: (slug: string) => `gallery-media-${slug}` as const,

    /**
     * Generate a tag for a specific Instagram post by code
     * @param code - The Instagram post shortcode
     * @returns A unique tag for the specific Instagram post
     */
    instagramPostByCode: (code: string) => `instagram-post-${code}` as const,

    /**
     * Generate a tag for a specific testimonial by slug
     * @param slug - The testimonial slug
     * @returns A unique tag for the specific testimonial
     */
    testimonialBySlug: (slug: string) => `testimonial-${slug}` as const,
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
    CACHE_TAGS.GALLERY_GROUPS,
    CACHE_TAGS.GALLERY_MEDIA,
    CACHE_TAGS.BEFORE_AFTER_PAIRS,
    CACHE_TAGS.INSTAGRAM_POSTS,
    CACHE_TAGS.TESTIMONIALS,
    CACHE_TAGS.TESTIMONIALS_FEATURED,
    CACHE_TAGS.SITEMAP_URLS,
] as const

/**
 * Prefixes for dynamic tags that include identifiers (e.g., slugs)
 */
export const DYNAMIC_TAG_PREFIXES = [
    'promotion-',
    'blog-post-',
    'gallery-group-',
    'gallery-media-',
    'instagram-post-',
    'testimonial-',
] as const

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

/**
 * Get all gallery-related tags for bulk revalidation.
 * Use this when any gallery content is created, updated, or deleted.
 *
 * @returns Array of all gallery cache tags
 */
export function getAllGalleryTags(): string[] {
    return [
        CACHE_TAGS.GALLERY_GROUPS,
        CACHE_TAGS.GALLERY_MEDIA,
        CACHE_TAGS.BEFORE_AFTER_PAIRS,
    ]
}

/**
 * Get all blog-related tags for bulk revalidation.
 * Use this when any blog post is created, updated, or deleted.
 *
 * @returns Array of all blog cache tags
 */
export function getAllBlogTags(): string[] {
    return [CACHE_TAGS.BLOG_POSTS]
}

/**
 * Get all Instagram-related tags for bulk revalidation.
 * Use this when any Instagram content is synced or updated.
 *
 * @returns Array of all Instagram cache tags
 */
export function getAllInstagramTags(): string[] {
    return [CACHE_TAGS.INSTAGRAM_POSTS]
}

/**
 * Get all testimonial-related tags for bulk revalidation.
 * Use this when any testimonial is created, updated, or deleted.
 *
 * @returns Array of all testimonial cache tags
 */
export function getAllTestimonialTags(): string[] {
    return [CACHE_TAGS.TESTIMONIALS, CACHE_TAGS.TESTIMONIALS_FEATURED]
}

/**
 * Get all sitemap URL registry tags for bulk revalidation.
 * Use this when blog posts are published, unpublished, or deleted
 * to update the URL classification registry.
 *
 * @returns Array of sitemap URL cache tags
 */
export function getSitemapUrlTags(): string[] {
    return [CACHE_TAGS.SITEMAP_URLS]
}
