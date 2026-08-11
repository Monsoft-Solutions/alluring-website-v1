/**
 * URL Registry Service for Page Classification
 *
 * Uses sitemap-based data sources to accurately classify pages from
 * Google Search Console into content types (blog, procedure, pages, etc).
 *
 * This solves the problem of blog posts living at root level (pre-2026,
 * e.g. /best-plastic-surgeon-miami) or under /blog/ (2026+), which makes
 * path-based classification unreliable.
 *
 * Uses `unstable_cache` for Vercel-compatible cross-request caching.
 *
 * IMPORTANT: We store arrays (not Sets) because unstable_cache uses JSON serialization,
 * and Sets are serialized as empty objects. We convert to Sets after retrieval for
 * O(1) lookups.
 *
 * @module @/lib/services/sitemap/url-registry
 */
import { unstable_cache } from 'next/cache'
import { and, eq, isNotNull } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { CACHE_TAGS } from '@workspace/shared/cache'
import { getBlogPostUrl } from '@workspace/shared'

import { STATIC_PAGES, SURGEON_SLUGS } from '@/lib/data/sitemap-pages.data'
import { PROCEDURE_SLUGS } from '@/lib/data/procedures.data'
import type { PageType } from '@/lib/types/search-console/search-console.type'

// ============================================================================
// Types
// ============================================================================

/**
 * Serializable URL registry structure.
 * Uses arrays for JSON serialization compatibility with unstable_cache.
 */
type SerializableUrlRegistry = {
    blogPosts: string[]
    blogListing: string[]
    procedures: string[]
    pages: string[]
    gallery: string[]
    promotions: string[]
}

/**
 * URL registry with Sets for O(1) lookups.
 * Created from SerializableUrlRegistry after cache retrieval.
 */
export type UrlRegistry = {
    blogPosts: Set<string>
    blogListing: Set<string>
    procedures: Set<string>
    pages: Set<string>
    gallery: Set<string>
    promotions: Set<string>
}

// ============================================================================
// Registry Building
// ============================================================================

/**
 * Build the URL registry from database and static data sources.
 * Returns arrays for JSON serialization compatibility.
 */
async function buildUrlRegistry(): Promise<SerializableUrlRegistry> {
    // Fetch published blog post slugs from database
    const posts = await db
        .select({ slug: blogPost.slug, publishedAt: blogPost.publishedAt })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt)
            )
        )

    // Blog post paths follow the publish-date rule: root /{slug} before the
    // 2026 cutoff, /blog/{slug} after
    const blogPostPaths = posts.map((p) =>
        getBlogPostUrl(p.slug ?? '', p.publishedAt)
    )

    // Build procedure paths
    const procedurePaths = [
        '/procedures',
        ...PROCEDURE_SLUGS.map((slug) => `/procedures/${slug}`),
    ]

    // Build static page paths (includes surgeon pages)
    const staticPaths = [...STATIC_PAGES, ...SURGEON_SLUGS]

    return {
        blogPosts: blogPostPaths,
        blogListing: ['/blog', '/blog/categories', '/blog/tags'],
        procedures: procedurePaths,
        pages: staticPaths,
        gallery: ['/gallery'],
        promotions: ['/miami-plastic-surgery-specials'],
    }
}

/**
 * Get the URL registry (as arrays) with caching.
 * Uses unstable_cache for Vercel-compatible cross-request persistence.
 *
 * The registry is:
 * - Cached for 1 hour (3600 seconds)
 * - Invalidated via revalidateTag('sitemap-urls') when blog posts change
 */
const getCachedUrlRegistry = unstable_cache(
    buildUrlRegistry,
    // v2: cached shape changed when blog paths became publish-date-aware
    ['sitemap-url-registry-v2'],
    {
        tags: [CACHE_TAGS.SITEMAP_URLS],
        revalidate: 3600, // 1 hour
    }
)

/**
 * Convert serializable registry (arrays) to UrlRegistry (Sets) for O(1) lookups.
 */
function toUrlRegistry(serializable: SerializableUrlRegistry): UrlRegistry {
    return {
        blogPosts: new Set(serializable.blogPosts),
        blogListing: new Set(serializable.blogListing),
        procedures: new Set(serializable.procedures),
        pages: new Set(serializable.pages),
        gallery: new Set(serializable.gallery),
        promotions: new Set(serializable.promotions),
    }
}

/**
 * Get the URL registry with Sets for O(1) lookups.
 * Fetches from cache and converts arrays to Sets.
 */
export async function getUrlRegistry(): Promise<UrlRegistry> {
    const serializable = await getCachedUrlRegistry()
    return toUrlRegistry(serializable)
}

// ============================================================================
// Classification Functions
// ============================================================================

/**
 * Extract the pathname from a full URL.
 * Handles trailing slashes and invalid URLs gracefully.
 */
function extractPath(url: string): string {
    try {
        const path = new URL(url).pathname
        // Remove trailing slash but keep root as '/'
        return path === '/' ? '/' : path.replace(/\/$/, '')
    } catch {
        // If URL parsing fails, treat input as a path
        return url.replace(/\/$/, '') || '/'
    }
}

/**
 * Classify a single path against a registry.
 *
 * Exported for testing; use classifyPageBySitemap / classifyPagesBySitemap,
 * which resolve the cached registry.
 */
export function classifyPath(registry: UrlRegistry, path: string): PageType {
    // Check exact matches first
    if (registry.blogPosts.has(path)) return 'blog'
    if (registry.blogListing.has(path)) return 'blog-listing'
    if (registry.procedures.has(path)) return 'procedure'
    if (registry.pages.has(path)) return 'pages'
    if (registry.gallery.has(path)) return 'gallery'
    if (registry.promotions.has(path)) return 'promotion'

    // Prefix patterns for paths not in the registry.
    // /blog/categories/* and /blog/tags/* are listings; any other single
    // segment under /blog/ is a post URL (e.g. one published after the
    // cached registry was built), not a listing.
    if (
        path.startsWith('/blog/categories') ||
        path.startsWith('/blog/tags') ||
        path.startsWith('/blog/authors')
    ) {
        return 'blog-listing'
    }
    if (/^\/blog\/[^/]+$/.test(path)) return 'blog'
    if (path.startsWith('/blog/')) return 'blog-listing'
    if (path.startsWith('/gallery/')) return 'gallery'
    if (path.startsWith('/procedures/')) return 'procedure'

    return 'other'
}

/**
 * Classify a page URL into a sitemap type category.
 *
 * Uses the cached URL registry to determine the page type based on
 * actual sitemap data rather than path patterns.
 *
 * @param url - Full URL or path to classify
 * @returns The sitemap type for the page
 *
 * @example
 * await classifyPageBySitemap('https://example.com/best-plastic-surgeon-miami')
 * // Returns: 'blog' (if that's a published blog post slug)
 *
 * await classifyPageBySitemap('https://example.com/procedures/facelift-miami')
 * // Returns: 'procedure'
 */
export async function classifyPageBySitemap(url: string): Promise<PageType> {
    const registry = await getUrlRegistry()
    return classifyPath(registry, extractPath(url))
}

/**
 * Classify multiple URLs in a single call.
 * More efficient than calling classifyPageBySitemap multiple times
 * as it only fetches the registry once.
 *
 * @param urls - Array of URLs or paths to classify
 * @returns Array of classifications in the same order as input
 */
export async function classifyPagesBySitemap(
    urls: string[]
): Promise<PageType[]> {
    const registry = await getUrlRegistry()
    return urls.map((url) => classifyPath(registry, extractPath(url)))
}
