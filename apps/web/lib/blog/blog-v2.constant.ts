/**
 * Blog post template v2 (epic #293): which posts render with it.
 *
 * The new template ships dark. A post uses it only when its slug is listed in
 * `BLOG_V2_SLUGS`, or on a non-production build started with
 * `BLOG_V2_PREVIEW=all`, so a preview deployment or a local build can show
 * every post in the new template while production readers keep the old one.
 *
 * The release is staged on purpose. All nine procedure pages lost rankings the
 * week after the 29 Jan 2026 template change, and the blog now brings nearly
 * half of the site's visits, so the list is filled in its own PR (the top 15
 * posts first) and compared against each post's own Search Console history
 * before every post moves.
 *
 * Both variables are declared in turbo.json as well as env.ts: Turbo's strict
 * env mode strips undeclared ones, and a stripped `VERCEL_ENV` would let the
 * preview flag through on a production build.
 *
 * @module lib/blog/blog-v2
 */

/**
 * Slugs that render with the v2 template in every environment.
 *
 * Keep it empty until phase 2 (#295) has shipped. The phase 1 shell has no
 * consultation thread yet and hides the floating call button, so a post listed
 * before then would have no way to book.
 */
export const BLOG_V2_SLUGS: ReadonlySet<string> = new Set<string>([])

/** The two variables the switch reads; the routes pass `env`. */
export type BlogV2Env = {
    BLOG_V2_PREVIEW?: string
    VERCEL_ENV?: string
}

/**
 * Whether a post renders with the v2 template.
 *
 * @param slug - The post's slug, from either `/blog/[slug]` or `/[slug]`
 * @param environment - `env` from `@/env`
 * @returns True for listed slugs, or for every post on a non-production
 * build with `BLOG_V2_PREVIEW=all`
 */
export function isBlogV2(slug: string, environment: BlogV2Env): boolean {
    if (BLOG_V2_SLUGS.has(slug)) return true

    return (
        environment.BLOG_V2_PREVIEW === 'all' &&
        environment.VERCEL_ENV !== 'production'
    )
}
