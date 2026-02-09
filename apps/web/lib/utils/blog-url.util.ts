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
const BLOG_PREFIX_CUTOFF = new Date('2026-01-01T00:00:00Z')

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
