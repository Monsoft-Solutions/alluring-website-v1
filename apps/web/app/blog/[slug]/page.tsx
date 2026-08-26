import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'

import { BlogPostContent } from '@/components/blog/blog-post-content.component'
import { getAdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import { getPublishedPostBySlug } from '@/lib/queries/blog/post-detail.query'
import { getRelatedPosts } from '@/lib/queries/blog/related-posts.query'
import { getInlineImagesByPostId } from '@/lib/queries/blog/post-images.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
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
            modifiedTime: post.updatedAt ?? post.publishedAt ?? undefined,
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
    const [relatedPosts, adjacentPosts, inlineImages] = await Promise.all([
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
    ])
    const { beforeCTA, afterCTA, ctaId } = findCTAInsertionPoint(post.content)

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
