/**
 * Internal Link Validator
 *
 * Removes links to pages on our own site that do not exist, keeping the anchor
 * text as plain prose.
 *
 * Needed because a language model asked to link to a related article will
 * happily construct a URL that looks exactly like ours and has never existed.
 * Measured on the corpus in August 2026: 4 of the 18 blog-to-blog links were
 * invented — `/blog/facelift-cost-miami`, `/blog/prepare-mommy-makeover-miami`
 * and two others — all live 404s. Feeding the writer the real post list (see
 * `getInternalPagesContext`) is the fix; this is the guard behind it, because a
 * prompt instruction is a request and a 404 is a lost reader.
 *
 * Kept separate from `validateGeneratedMdx`: that one answers "will this
 * render at all" from the content alone, while this one needs to be told what
 * exists, and only the caller with database access knows that.
 *
 * @module @workspace/ai/functions/validate-internal-links
 */
import { BUSINESS_DOMAIN } from '@workspace/shared/content'

/** A link that pointed nowhere and what was done about it. */
export type BrokenInternalLink = {
    /** The href as written */
    url: string
    /** The anchor text, kept in the prose */
    anchorText: string
}

export type InternalLinkValidationResult = {
    /** Content with unresolvable internal links reduced to plain text */
    content: string
    /** Every link removed, for the pipeline record */
    removed: BrokenInternalLink[]
}

/**
 * A markdown link: `[anchor](href)`.
 *
 * The lookbehind excludes images — `![alt](src)` shares the shape, and treating
 * one as a link rewrites it to `!alt`, breaking the body rather than fixing it.
 * Image sources have their own guard in the renderer.
 */
const MARKDOWN_LINK = /(?<!!)\[([^\]]+)\]\(([^)\s]+)\)/g

/**
 * Reduces an href to the site-relative path it targets, or null if it is
 * off-site.
 */
function toInternalPath(href: string): string | null {
    if (href.startsWith('/')) return href

    if (href.includes(BUSINESS_DOMAIN)) {
        const afterDomain = href.slice(
            href.indexOf(BUSINESS_DOMAIN) + BUSINESS_DOMAIN.length
        )
        return afterDomain.startsWith('/') ? afterDomain : `/${afterDomain}`
    }

    return null
}

/** Drops the fragment and query so `/x#faq` matches a known `/x`. */
function normalizePath(path: string): string {
    const withoutHash = path.split('#')[0] ?? path
    const withoutQuery = withoutHash.split('?')[0] ?? withoutHash
    // Trailing slash is not meaningful here, but the empty path is the homepage.
    return withoutQuery.length > 1
        ? withoutQuery.replace(/\/+$/, '')
        : withoutQuery
}

/**
 * Strip internal links whose target is not in the known set.
 *
 * @param content - Markdown to check
 * @param knownUrls - Every site path that resolves — marketing pages plus
 *   published posts, at their real URLs
 * @returns Content with broken links flattened to their anchor text
 *
 * @example
 * ```typescript
 * const { content, removed } = validateInternalLinks(draft, knownUrls)
 * if (removed.length > 0) {
 *   console.warn(`Removed ${removed.length} link(s) to pages that don't exist`)
 * }
 * ```
 */
export function validateInternalLinks(
    content: string,
    knownUrls: Iterable<string>
): InternalLinkValidationResult {
    const known = new Set<string>()
    for (const url of knownUrls) {
        const path = toInternalPath(url)
        if (path) known.add(normalizePath(path))
    }

    // With nothing to check against, changing the content would be guesswork.
    if (known.size === 0) return { content, removed: [] }

    const removed: BrokenInternalLink[] = []

    const next = content.replace(
        MARKDOWN_LINK,
        (whole, anchorText: string, href: string) => {
            const path = toInternalPath(href)
            if (!path) return whole

            if (known.has(normalizePath(path))) return whole

            removed.push({ url: href, anchorText })
            return anchorText
        }
    )

    return { content: next, removed }
}
