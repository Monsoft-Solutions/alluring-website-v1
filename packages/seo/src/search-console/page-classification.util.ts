/**
 * Page Classification
 *
 * Classifies Search Console page URLs into content types.
 *
 * The authoritative classifier lives in the admin app
 * (`lib/services/sitemap/url-registry.service`): it reads the published blog
 * posts out of Postgres, so it knows that a root-level path like
 * `/best-plastic-surgeon-miami` is a pre-2026 blog post rather than a static
 * page. That classifier needs Next.js caching and a database connection, so it
 * cannot live in this package.
 *
 * What lives here is the dependency-free fallback: a path-shape heuristic used
 * by callers with no database (the MCP server, scripts). Callers that *do* have
 * one inject the accurate classifier via `PageClassifier`.
 *
 * @module @workspace/seo/search-console — page classification
 */
import type { PageType } from './search-console.type.js'

/**
 * Classifies a batch of page URLs into content types.
 *
 * Implementations must return one entry per input URL, in the same order.
 */
export type PageClassifier = (urls: string[]) => Promise<PageType[]>

/** Path prefixes that map directly to a page type. */
const PREFIX_RULES: ReadonlyArray<readonly [string, PageType]> = [
    ['/blog/category/', 'blog-listing'],
    ['/blog/tag/', 'blog-listing'],
    ['/blog', 'blog'],
    ['/procedures', 'procedure'],
    ['/gallery', 'gallery'],
    ['/promotions', 'promotion'],
    ['/specials', 'promotion'],
]

/** Paths that are listing pages despite sitting under a content prefix. */
const LISTING_PATHS = new Set(['/blog', '/blog/'])

/**
 * Extract the pathname from a full URL, falling back to the raw input.
 */
function toPath(url: string): string {
    try {
        return new URL(url).pathname || '/'
    } catch {
        return url
    }
}

/**
 * Classify a single page URL by path shape.
 *
 * Less accurate than the sitemap-backed classifier — notably, it labels
 * root-level blog posts `other` because nothing in the path distinguishes them
 * from a static page.
 */
export function classifyPathHeuristic(url: string): PageType {
    const path = toPath(url)

    if (path === '/') return 'pages'
    if (LISTING_PATHS.has(path)) return 'blog-listing'

    for (const [prefix, pageType] of PREFIX_RULES) {
        if (path === prefix || path.startsWith(`${prefix}/`)) {
            // A bare prefix (e.g. /procedures) is the index, not an item
            return path === prefix && pageType === 'blog'
                ? 'blog-listing'
                : pageType
        }
    }

    return 'other'
}

/**
 * Batch form of {@link classifyPathHeuristic}, matching the `PageClassifier`
 * shape so it can serve as the default injection.
 *
 * Synchronous work behind an async signature — the interface exists for
 * classifiers that hit a database.
 */
export const classifyPathsHeuristic: PageClassifier = (urls) =>
    Promise.resolve(urls.map(classifyPathHeuristic))
