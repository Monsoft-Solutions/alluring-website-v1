/**
 * Blog Post SEO Title
 *
 * A post's `meta_title` is written for the results page; `title` is the H1.
 * Both post routes (`/{slug}` for pre-2026 posts, `/blog/{slug}` after) read
 * the `<title>` from here so they can never disagree (#348). Open Graph and
 * Twitter titles follow, because Next derives them from `title` when the
 * page sets none of its own.
 *
 * Both fields may carry price tokens (#354), resolved as text before they
 * get here; {@link fitResolvedTitle} keeps a discount from pushing the title
 * past what Google renders.
 *
 * @module lib/seo/blog-post-title
 */
import { fitResolvedTitle } from './fit-title.util'

/**
 * The `<title>` for a blog post: its meta title when one is set, otherwise
 * its title. Blank and whitespace-only meta titles count as unset — dozens
 * of posts store `''` rather than NULL. A meta title that a discount pushes
 * over the limit drops the "(N% off $X)" suffix, then falls back to the
 * post title (compacted the same way).
 */
export function getBlogPostSeoTitle(post: {
    title: string
    metaTitle?: string | null
}): string {
    const title = fitResolvedTitle(post.title)
    const metaTitle = post.metaTitle?.trim()
    return metaTitle ? fitResolvedTitle(metaTitle, title) : title
}
