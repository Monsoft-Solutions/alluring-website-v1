/**
 * Blog Post URL Resolver
 *
 * Maps GSC page URLs to blog post ids for the snapshot sync (epic #144).
 * First production consumer of the shared `resolveBlogPathToSlug` inverse —
 * the mechanical slug candidate is verified against real post slugs here,
 * exactly as that util's contract requires.
 *
 * The resolver is built once per sync run (one query, one Map) rather than
 * hitting the DB per row: a daily pull can carry thousands of rows.
 *
 * @module @/lib/services/blog-post-resolver.service
 */
import { isNotNull } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'

import { resolvePageUrlToSlugCandidate } from '@/lib/utils/gsc-snapshot.util'

/** Resolves a GSC page URL to a blog post id, or null for non-post pages. */
export type BlogPostUrlResolver = (pageUrl: string) => string | null

/**
 * Build a resolver over all posts that have a slug.
 *
 * Deliberately not restricted to published posts: a post unpublished after
 * earning impressions should still resolve, so its history stays attached.
 */
export async function createBlogPostUrlResolver(): Promise<BlogPostUrlResolver> {
    const rows = await db
        .select({ id: blogPost.id, slug: blogPost.slug })
        .from(blogPost)
        .where(isNotNull(blogPost.slug))

    const idBySlug = new Map<string, string>()
    for (const row of rows) {
        if (row.slug) idBySlug.set(row.slug, row.id)
    }

    return (pageUrl: string) => {
        const slug = resolvePageUrlToSlugCandidate(pageUrl)
        if (!slug) return null
        return idBySlug.get(slug) ?? null
    }
}
