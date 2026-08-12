import {
    PROCEDURE_PAGES as SHARED_PROCEDURE_PAGES,
    WEBSITE_PAGES as SHARED_WEBSITE_PAGES,
    SURGEON_PAGES as SHARED_SURGEON_PAGES,
    type SitePage,
} from '@workspace/shared'

/**
 * Internal Pages Data
 *
 * Static data for all internal website pages available for linking.
 * Used for context injection in content generation to enable natural internal linking.
 *
 * @module @workspace/ai/data/internal-pages
 */

/**
 * Internal page definition
 */
export type InternalPage = SitePage

/**
 * Procedure pages
 */
export const PROCEDURE_PAGES: InternalPage[] = SHARED_PROCEDURE_PAGES

/**
 * Website pages (non-procedure)
 */
export const WEBSITE_PAGES: InternalPage[] = [
    ...SHARED_WEBSITE_PAGES,
    ...SHARED_SURGEON_PAGES,
]

/**
 * Get all internal pages
 */
export function getAllInternalPages(): InternalPage[] {
    return [...PROCEDURE_PAGES, ...WEBSITE_PAGES]
}

/**
 * A published blog post the writer may link to.
 *
 * Supplied by the caller rather than read here, because `@workspace/ai` has no
 * database dependency and should not gain one for this.
 */
export type LinkableBlogPost = {
    title: string
    /** Already resolved through `getBlogPostUrl` — the pre/post-2026 URL split matters */
    url: string
    primaryKeyword?: string | null
}

/**
 * Format internal pages for prompt context injection
 * This format is optimized for the AI to understand and use for linking
 *
 * @param linkableBlogPosts - Published posts this article may link to. Omitted,
 *   the writer sees only the static marketing pages and cannot build the
 *   blog-to-blog links that make a topic cluster read as one. Worse, asked for
 *   a related article it will invent a plausible URL: 4 of the 18 blog-to-blog
 *   links in the corpus as of Aug 2026 point at slugs that never existed.
 */
export function getInternalPagesContext(
    linkableBlogPosts: LinkableBlogPost[] = []
): string {
    const procedureSection = PROCEDURE_PAGES.map(
        (p) =>
            `- [${p.title}](${p.url}) - ${p.description} | Keywords: ${p.keywords.join(', ')}`
    ).join('\n')

    const resourceSection = WEBSITE_PAGES.map(
        (p) =>
            `- [${p.title}](${p.url}) - ${p.description} | Keywords: ${p.keywords.join(', ')}`
    ).join('\n')

    const articleSection =
        linkableBlogPosts.length > 0
            ? `\n### Related Articles\n${linkableBlogPosts
                  .map(
                      (post) =>
                          `- [${post.title}](${post.url})${post.primaryKeyword ? ` | ${post.primaryKeyword}` : ''}`
                  )
                  .join('\n')}\n`
            : ''

    return `## Available Internal Pages for Linking

### Procedures
${procedureSection}

### Resources
${resourceSection}
${articleSection}
**Internal Linking Instructions:**
- Naturally link 3-5 of these pages throughout your content
- Use descriptive anchor text that flows naturally in the sentence
- Only link to pages that are genuinely relevant to the content
- Prefer procedure pages when discussing specific treatments
- Link to financing when discussing costs or affordability
- Link to gallery when mentioning results or outcomes
- Link to a related article when it covers a sub-topic in more depth than you have room for here — that is what turns separate posts into a subject a reader can explore
- **Copy URLs from the lists above exactly. Never construct or guess one.** A plausible-looking URL you invented is a 404, and a reader who hits one leaves.`
}
