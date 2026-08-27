/**
 * Blog Prerender Slugs Query
 *
 * The slug list `generateStaticParams` builds from. Deliberately narrower than
 * `sitemap.query.ts` — no image joins, no lastmod — because the only thing the
 * prerender pass needs is the slug and the date that decides which URL shape the
 * post lives at (root before 2026, /blog after).
 */
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { and, eq, isNotNull } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache/cache-tags.constant'

/** A published post reduced to what the prerender pass needs. */
export type BlogPrerenderSlug = {
    slug: string
    publishedAt: Date
}

async function fetchBlogPrerenderSlugs(): Promise<BlogPrerenderSlug[]> {
    const rows = await db
        .select({
            slug: blogPost.slug,
            publishedAt: blogPost.publishedAt,
        })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt),
                isNotNull(blogPost.slug)
            )
        )

    return rows
        .filter((r) => r.slug !== null && r.publishedAt !== null)
        .map((r) => ({ slug: r.slug!, publishedAt: r.publishedAt! }))
}

/**
 * Get every published post slug with its publish date.
 *
 * Tagged with `blog-posts` so publishing through the admin pipeline
 * (`app/api/blog/posts/create/route.ts`) invalidates it — a new post joins the
 * prerendered set on the next build, and resolves on first hit before that
 * because both blog routes keep `dynamicParams = true`.
 */
export const getBlogPrerenderSlugs = (): Promise<BlogPrerenderSlug[]> =>
    unstable_cache(fetchBlogPrerenderSlugs, ['blog-prerender-slugs'], {
        tags: [CACHE_TAGS.BLOG_POSTS],
        revalidate: 3600,
    })()
