/**
 * Blog URL Utility
 *
 * Determines the correct URL for blog posts based on publish date.
 * Posts published on or after Jan 1, 2026 use /blog/{slug} prefix.
 * Posts published before that date stay at root /{slug} to preserve Google rankings.
 */

/**
 * Cutoff date: posts published on or after this date use /blog/ prefix.
 * Posts published before this date stay at root level to preserve Google rankings.
 */
export const BLOG_PREFIX_CUTOFF = new Date('2026-01-01T00:00:00Z')

/**
 * Returns the correct blog post URL based on publish date.
 * - Posts published >= Jan 1, 2026: /blog/{slug}
 * - Posts published < Jan 1, 2026 (or no date): /{slug}
 */
export function getBlogPostUrl(
    slug: string,
    publishedAt: string | Date | null
): string {
    if (!publishedAt) return `/${slug}`
    const pubDate =
        publishedAt instanceof Date ? publishedAt : new Date(publishedAt)
    return pubDate >= BLOG_PREFIX_CUTOFF ? `/blog/${slug}` : `/${slug}`
}

/**
 * Returns the full absolute blog post URL for schema markup.
 */
export function getBlogPostAbsoluteUrl(
    siteUrl: string,
    slug: string,
    publishedAt: string | Date | null
): string {
    return `${siteUrl}${getBlogPostUrl(slug, publishedAt)}`
}

/**
 * Returns true if the post should use the /blog/ prefix.
 */
export function usesBlogPrefix(publishedAt: string | Date | null): boolean {
    if (!publishedAt) return false
    const pubDate =
        publishedAt instanceof Date ? publishedAt : new Date(publishedAt)
    return pubDate >= BLOG_PREFIX_CUTOFF
}

/** Blog sub-paths that are listings, never posts. */
const BLOG_LISTING_PREFIXES = ['/blog/categories', '/blog/tags']

/**
 * Extracts the candidate post slug from a site path, inverting getBlogPostUrl.
 * Accepts both URL shapes: root `/{slug}` (pre-2026 posts) and `/blog/{slug}`.
 *
 * Purely mechanical: a root path always yields its single segment, so callers
 * must verify the result against actual post slugs before treating it as one.
 * Returns null for the blog index, category/tag listings, nested paths and root.
 */
export function resolveBlogPathToSlug(path: string): string | null {
    const normalized = path === '/' ? '/' : path.replace(/\/$/, '')

    if (normalized === '/' || normalized === '/blog') return null
    if (BLOG_LISTING_PREFIXES.some((p) => normalized.startsWith(p))) return null

    const blogMatch = normalized.match(/^\/blog\/([^/]+)$/)
    if (blogMatch) return blogMatch[1]!

    const rootMatch = normalized.match(/^\/([^/]+)$/)
    if (rootMatch) return rootMatch[1]!

    return null
}
