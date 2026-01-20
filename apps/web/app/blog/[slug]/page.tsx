import {
    ArticleSchema,
    BreadcrumbSchema,
    FAQSchema,
} from '@workspace/seo/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { BlogCTA } from '@/components/blog/blog-cta.component'
import { BlogPostHero } from '@/components/blog/blog-post-hero.component'
import { BlogViewTracker } from '@/components/blog/blog-view-tracker.component'
import { MobileTOC } from '@/components/blog/mobile-toc.component'
import { PostMarkdown } from '@/components/blog/post-markdown.component'
import { PopularPosts } from '@/components/blog/popular-posts.component'
import { PostNavigation } from '@/components/blog/post-navigation.component'
import { RelatedPosts } from '@/components/blog/related-posts.component'
import { SidebarCategories } from '@/components/blog/sidebar-categories.component'
import { TableOfContents } from '@/components/blog/table-of-contents.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { getAdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import { getPopularPosts } from '@/lib/queries/blog/popular-posts.query'
import { getPublishedPostBySlug } from '@/lib/queries/blog/post-detail.query'
import { getRelatedPosts } from '@/lib/queries/blog/related-posts.query'
import { listActiveCategoriesWithCounts } from '@/lib/queries/blog/taxonomy.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { extractTableOfContents } from '@/lib/utils/extract-toc.util'
import { findCTAInsertionPoint } from '@/lib/utils/inject-cta-marker.util'

type PageProps = {
    params: Promise<{ slug: string }>
}

const getCachedPostBySlug = cache(async (slug: string) =>
    getPublishedPostBySlug(slug)
)

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getCachedPostBySlug(slug)
    if (!post) return { title: 'Post not found' }

    return toNextMetadata(seoConfig, {
        title: post.title,
        description: post.excerpt ?? undefined,
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
        },
        canonical: `/blog/${post.slug}`,
    })
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    const post = await getCachedPostBySlug(slug)
    if (!post) notFound()

    const tableOfContents = extractTableOfContents(post.content)

    // Fetch related posts based on categories and tags
    const relatedPosts = await getRelatedPosts(
        post.id,
        post.categories.map((c) => c.id),
        post.tags.map((t) => t.id),
        3
    )

    // Fetch adjacent posts, popular posts, and categories in parallel
    const [adjacentPosts, popularPosts, allCategories] = await Promise.all([
        post.publishedAt
            ? getAdjacentPosts(post.id, post.publishedAt)
            : Promise.resolve({ previousPost: null, nextPost: null }),
        getPopularPosts(5),
        listActiveCategoriesWithCounts(),
    ])

    // Split content at CTA insertion point (explicit marker or automatic 40% split)
    const { beforeCTA, afterCTA, ctaId } = findCTAInsertionPoint(post.content)

    return (
        <article>
            {/* Track blog post view */}
            <BlogViewTracker postId={post.id} />

            {/* Full-width cinematic hero */}
            <BlogPostHero
                title={post.title}
                excerpt={post.excerpt}
                featuredImage={post.featuredImage}
                author={post.author}
                publishedAt={post.publishedAt}
                readingTime={post.readingTime}
                categories={post.categories}
            />

            {/* Mobile Table of Contents - Sticky bar for mobile */}
            <MobileTOC headings={tableOfContents} />

            {/* Content section */}
            <div className='bg-white'>
                <ContentWrapper
                    size='lg'
                    paddingX='px-5 md:px-8 lg:px-12'
                    className='py-12 md:py-16 lg:py-20'
                >
                    {/* Two column layout: content + TOC */}
                    <div className='grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]'>
                        {/* Main content column */}
                        <div className='min-w-0'>
                            {/* Main content before CTA */}
                            <div className='prose prose-neutral prose-lg prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-h1:text-3xl prose-h1:leading-tight prose-h2:text-2xl prose-h2:leading-snug prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:leading-snug prose-h3:mt-10 prose-h3:mb-4 prose-p:leading-relaxed prose-p:mb-6 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-gold-500/40 prose-blockquote:bg-stone-50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:bg-stone-100 prose-code:text-stone-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-stone-900 prose-pre:p-4 prose-pre:my-6 prose-pre:border-0 prose-pre:rounded-lg prose-a:text-gold-600 prose-a:no-underline hover:prose-a:text-gold-500 prose-strong:text-stone-900 max-w-none'>
                                <PostMarkdown content={beforeCTA} />
                            </div>

                            {/* Inline CTA - appears at marker position or auto-inserted at ~40% of content */}
                            {beforeCTA && (
                                <BlogCTA
                                    variant='inline'
                                    ctaId={ctaId || 'default'}
                                />
                            )}

                            {/* Content after CTA (if any) */}
                            {afterCTA ? (
                                <div className='prose prose-neutral prose-lg prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-h1:text-3xl prose-h1:leading-tight prose-h2:text-2xl prose-h2:leading-snug prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:leading-snug prose-h3:mt-10 prose-h3:mb-4 prose-p:leading-relaxed prose-p:mb-6 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-gold-500/40 prose-blockquote:bg-stone-50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:bg-stone-100 prose-code:text-stone-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-stone-900 prose-pre:p-4 prose-pre:my-6 prose-pre:border-0 prose-pre:rounded-lg prose-a:text-gold-600 prose-a:no-underline hover:prose-a:text-gold-500 prose-strong:text-stone-900 max-w-none'>
                                    <PostMarkdown content={afterCTA} />
                                </div>
                            ) : null}

                            <ArticleSchema
                                type='BlogPosting'
                                headline={post.title}
                                description={post.excerpt ?? undefined}
                                author={post.author?.name ?? 'Unknown'}
                                datePublished={
                                    post.publishedAt ?? new Date().toISOString()
                                }
                                dateModified={post.publishedAt ?? undefined}
                                image={post.featuredImage?.url}
                                mainEntityOfPage={`${seoConfig.siteUrl}/blog/${post.slug}`}
                                publisher={{
                                    name:
                                        seoConfig.organization?.name ??
                                        seoConfig.siteName,
                                    logo: seoConfig.organization?.logo,
                                    url:
                                        seoConfig.organization?.url ??
                                        seoConfig.siteUrl,
                                }}
                            />

                            <BreadcrumbSchema
                                items={[
                                    { name: 'Home', item: '/' },
                                    { name: 'Blog', item: '/blog' },
                                    {
                                        name: post.title,
                                        item: `/blog/${post.slug}`,
                                    },
                                ]}
                            />

                            {/* FAQ Schema for rich results - only render if FAQs exist */}
                            {post.faqs && post.faqs.length > 0 && (
                                <FAQSchema
                                    items={post.faqs.map((faq) => ({
                                        question: faq.question,
                                        answer: faq.answer,
                                    }))}
                                />
                            )}

                            {/* Topics section */}
                            {(post.categories.length > 0 ||
                                post.tags.length > 0) && (
                                <footer className='mt-16 border-t border-stone-200 pt-10'>
                                    <h2 className='mb-6 text-sm font-bold tracking-[0.15em] text-stone-500 uppercase'>
                                        Topics
                                    </h2>
                                    <div className='flex flex-wrap gap-3'>
                                        {post.categories.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={`/blog/categories/${c.slug}`}
                                                className='hover:bg-gold-500/10 hover:text-gold-700 inline-flex items-center rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200'
                                            >
                                                {c.name}
                                            </Link>
                                        ))}
                                        {post.tags.map((t) => (
                                            <Link
                                                key={t.id}
                                                href={`/blog/tags/${t.slug}`}
                                                className='hover:border-gold-500/50 hover:text-gold-600 inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-colors duration-200'
                                            >
                                                #{t.name}
                                            </Link>
                                        ))}
                                    </div>
                                </footer>
                            )}

                            {/* Footer CTA - prominent section */}
                            <BlogCTA variant='footer' ctaId='consultation' />

                            {/* Previous/Next Post Navigation */}
                            <PostNavigation
                                previousPost={adjacentPosts.previousPost}
                                nextPost={adjacentPosts.nextPost}
                            />

                            {/* Related Posts Section */}
                            <RelatedPosts posts={relatedPosts} />
                        </div>

                        {/* Sidebar: Sticky TOC - Desktop only */}
                        <aside className='hidden lg:block'>
                            <div className='sticky top-24'>
                                <div className='rounded-xl border border-stone-200 bg-stone-50 p-6'>
                                    <h3 className='mb-4 text-sm font-bold tracking-[0.15em] text-stone-500 uppercase'>
                                        In This Article
                                    </h3>
                                    <TableOfContents
                                        headings={tableOfContents}
                                    />
                                </div>

                                {/* Popular Posts Widget */}
                                {popularPosts.length > 0 && (
                                    <div className='mt-6'>
                                        <PopularPosts
                                            posts={popularPosts}
                                            variant='sidebar'
                                        />
                                    </div>
                                )}

                                {/* Sidebar Categories */}
                                {allCategories.length > 0 && (
                                    <div className='mt-6'>
                                        <SidebarCategories
                                            categories={allCategories}
                                            maxDisplay={6}
                                        />
                                    </div>
                                )}

                                {/* Quick CTA in sidebar */}
                                <div className='border-gold-500/30 bg-gold-500/5 mt-6 rounded-xl border p-6'>
                                    <h3 className='mb-2 font-serif text-lg font-medium text-stone-900'>
                                        Ready to Transform?
                                    </h3>
                                    <p className='mb-4 text-sm text-stone-600'>
                                        Schedule your free consultation today.
                                    </p>
                                    <Link
                                        href='/contact-us'
                                        className='bg-gold-500 hover:bg-gold-600 block w-full rounded-lg px-4 py-3 text-center text-sm font-bold text-white transition-colors'
                                    >
                                        Book Consultation
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </ContentWrapper>
            </div>
        </article>
    )
}
