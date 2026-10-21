/**
 * Blog Post SEO Title
 *
 * A post's `meta_title` is written for the results page; `title` is the H1.
 * Both post routes (`/{slug}` for pre-2026 posts, `/blog/{slug}` after) read
 * the `<title>` from here so they can never disagree (#348). Open Graph and
 * Twitter titles follow, because Next derives them from `title` when the
 * page sets none of its own.
 *
 * @module lib/seo/blog-post-title
 */

/**
 * The `<title>` for a blog post: its meta title when one is set, otherwise
 * its title. Blank and whitespace-only meta titles count as unset — dozens
 * of posts store `''` rather than NULL.
 */
export function getBlogPostSeoTitle(post: {
    title: string
    metaTitle?: string | null
}): string {
    return post.metaTitle?.trim() || post.title
}
