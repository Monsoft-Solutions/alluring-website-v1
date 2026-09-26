import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'

import { BlogPostContent } from '@/components/blog/blog-post-content.component'
import { BlogPostPage as BlogPostPageV2 } from '@/components/blog/post-page/blog-post-page.component'
import { env } from '@/env'
import { isBlogV2 } from '@/lib/blog/blog-v2.constant'
import { getPostConversionData } from '@/lib/queries/blog/post-conversion.query'
import { getAdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import { getPublishedPostBySlug } from '@/lib/queries/blog/post-detail.query'
import { getRelatedPosts } from '@/lib/queries/blog/related-posts.query'
import { getInlineImagesByPostId } from '@/lib/queries/blog/post-images.query'
import { getBlogPrerenderSlugs } from '@/lib/queries/blog/prerender-slugs.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getContentModifiedDate } from '@/lib/utils/content-freshness.util'
import { getRelatedProcedures } from '@/lib/queries/blog/related-procedures.query'
import { extractTableOfContents } from '@/lib/utils/extract-toc.util'
import { findCTAInsertionPoint } from '@/lib/utils/inject-cta-marker.util'
import { usesBlogPrefix } from '@/lib/utils/blog-url.util'

type PageProps = {
    params: Promise<{ slug: string }>
}

const getCachedPostBySlug = cache(async (slug: string) =>
    getPublishedPostBySlug(slug)
)

// Posts published after the build still resolve on first hit, then stay cached.
export const dynamicParams = true

// Revalidate every hour (3600 seconds). Publishing fires revalidateTag, so this
// is the safety net, not the mechanism.
export const revalidate = 3600

/**
 * Prerender every post that lives at /blog/{slug} — the post-2025 set.
 * Pre-2026 posts are prerendered by app/[slug]/page.tsx instead.
 */
export async function generateStaticParams() {
    const posts = await getBlogPrerenderSlugs()

    return posts
        .filter((post) => usesBlogPrefix(post.publishedAt))
        .map((post) => ({ slug: post.slug }))
}

/**
 * Generate metadata for blog posts served at /blog/[slug].
 * Only post-2025 content should be here; pre-2026 posts redirect to root.
 */
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params

    const post = await getCachedPostBySlug(slug)
    if (!post) return { title: 'Not Found' }

    // Pre-2026 posts should not be at /blog/ — no metadata needed (redirect will happen)
    if (!usesBlogPrefix(post.publishedAt)) {
        return { title: 'Redirecting...' }
    }

    const primaryCategory = post.categories[0]

    return toNextMetadata(seoConfig, {
        title: post.title,
        // metaDescription is authored for the SERP; excerpt is page copy and
        // only stands in when the dedicated field is empty.
        description: post.metaDescription || post.excerpt || undefined,
        openGraph: {
            type: 'article',
            images: post.featuredImage
                ? [
                      {
                          url: post.featuredImage.url,
                          alt: post.featuredImage.alt,
                      },
                  ]
                : undefined,
            publishedTime: post.publishedAt ?? undefined,
            modifiedTime: post.publishedAt
                ? getContentModifiedDate(
                      post.publishedAt,
                      post.contentUpdatedAt
                  )
                : undefined,
            authors: post.author?.name ? [post.author.name] : undefined,
            section: primaryCategory?.name,
            tags:
                post.tags.length > 0 ? post.tags.map((t) => t.name) : undefined,
        },
        canonical: `/blog/${post.slug}`,
    })
}

/**
 * Blog post page at /blog/[slug].
 * Serves post-2025 content; redirects pre-2026 posts to root level.
 */
export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params

    const post = await getCachedPostBySlug(slug)
    if (!post) notFound()

    // Pre-2026 posts live at root level — redirect back
    if (!usesBlogPrefix(post.publishedAt)) {
        permanentRedirect(`/${slug}`)
    }

    const tableOfContents = extractTableOfContents(post.content)
    const [relatedPosts, adjacentPosts, inlineImages, conversion] =
        await Promise.all([
            getRelatedPosts(
                post.id,
                post.categories.map((c) => c.id),
                post.tags.map((t) => t.id),
                6
            ),
            post.publishedAt
                ? getAdjacentPosts(post.id, post.publishedAt)
                : Promise.resolve({ previousPost: null, nextPost: null }),
            getInlineImagesByPostId(post.id),
            // Template v2 (epic #293) needs more than the old one, fetched
            // alongside for allowlisted posts and preview builds only
            isBlogV2(slug, env) ? getPostConversionData(post.title) : null,
        ])
    const { beforeCTA, afterCTA, ctaId } = findCTAInsertionPoint(post.content)

    // Template v2 (epic #293), for allowlisted posts and preview builds
    if (conversion) {
        return (
            <BlogPostPageV2
                post={post}
                relatedPosts={relatedPosts}
                tableOfContents={tableOfContents}
                beforeCTA={beforeCTA}
                afterCTA={afterCTA}
                adjacentPosts={adjacentPosts}
                inlineImages={inlineImages}
                {...conversion}
            />
        )
    }

    const relatedProcedures = getRelatedProcedures(post, 3)

    return (
        <BlogPostContent
            post={post}
            relatedPosts={relatedPosts}
            relatedProcedures={relatedProcedures}
            tableOfContents={tableOfContents}
            beforeCTA={beforeCTA}
            afterCTA={afterCTA}
            ctaId={ctaId ?? null}
            adjacentPosts={adjacentPosts}
            inlineImages={inlineImages}
        />
    )
}
