/**
 * Linkable Pages Service
 *
 * Supplies the set of pages that actually exist, for two jobs the AI package
 * cannot do on its own: telling the writer which posts it may link to, and
 * checking afterwards that every internal link it wrote resolves.
 *
 * `@workspace/ai` has no database dependency by design, so the corpus is read
 * here and injected.
 *
 * @module @/lib/services/linkable-pages
 */
import { and, desc, eq, isNotNull, ne } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { getBlogPostUrl } from '@workspace/shared'
import {
    getAllInternalPages,
    type LinkableBlogPost,
} from '@workspace/ai/data/internal-pages.data'

/**
 * How many published posts to offer the writer.
 *
 * The corpus is ~154 posts; at roughly 70 characters each the full list is a
 * few thousand tokens, which is affordable but not free, and a model given 154
 * options links no better than one given 60. Most recent first, because those
 * are the posts most likely to still reflect current practice.
 */
const MAX_LINKABLE_POSTS = 60

/**
 * Published posts the writer may link to, newest first.
 *
 * @param excludePostId - The post being written, so it cannot link to itself
 */
export async function getLinkableBlogPosts(
    excludePostId?: string
): Promise<LinkableBlogPost[]> {
    const filters = [
        eq(blogPost.status, 'published'),
        isNotNull(blogPost.slug),
        isNotNull(blogPost.publishedAt),
    ]
    if (excludePostId) filters.push(ne(blogPost.id, excludePostId))

    const rows = await db
        .select({
            title: blogPost.title,
            slug: blogPost.slug,
            publishedAt: blogPost.publishedAt,
            primaryKeyword: blogPost.primaryKeyword,
        })
        .from(blogPost)
        .where(and(...filters))
        .orderBy(desc(blogPost.publishedAt))
        .limit(MAX_LINKABLE_POSTS)

    return rows.map((row) => ({
        title: row.title,
        // Resolved rather than templated: posts published before 2026 live at
        // `/{slug}` and later ones at `/blog/{slug}`.
        url: getBlogPostUrl(row.slug!, row.publishedAt),
        primaryKeyword: row.primaryKeyword,
    }))
}

/**
 * Every site path that resolves — static marketing pages plus every published
 * post, at its real URL.
 *
 * Unlike {@link getLinkableBlogPosts} this is not capped: it is the set an
 * internal link is checked against, so leaving posts out would flag working
 * links as broken.
 */
export async function getKnownInternalUrls(): Promise<Set<string>> {
    const rows = await db
        .select({
            slug: blogPost.slug,
            publishedAt: blogPost.publishedAt,
        })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.slug),
                isNotNull(blogPost.publishedAt)
            )
        )

    const urls = new Set<string>(getAllInternalPages().map((page) => page.url))
    for (const row of rows) {
        urls.add(getBlogPostUrl(row.slug!, row.publishedAt))
    }

    return urls
}
