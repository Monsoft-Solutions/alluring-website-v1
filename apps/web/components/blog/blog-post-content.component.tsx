/**
 * BlogPostContent Component
 *
 * World-class cinematic blog post layout with:
 * - Full-viewport hero with featured image
 * - Glassmorphism content card on desktop
 * - Engaging visual hierarchy
 * - Sticky sidebar with TOC and CTAs
 * - Reading progress bar
 * - Social sharing buttons
 * - Breadcrumbs navigation
 * - "More from This Category" section
 *
 * SSR-compatible with CSS animations.
 */
import { ArticleSchema, FAQSchema } from '@workspace/seo/react'

import { BlogPostImagesSchema } from '@/components/blog/blog-post-images-schema.component'
import { Calendar, Clock, User, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'

import { BlogCTA } from '@/components/blog/blog-cta.component'
import { BlogViewTracker } from '@/components/blog/blog-view-tracker.component'
import { PostMarkdown } from '@/components/blog/post-markdown.component'
import { PostNavigation } from '@/components/blog/post-navigation.component'
import { ReadingProgress } from '@/components/blog/reading-progress.component'
import { RelatedPosts } from '@/components/blog/related-posts.component'
import { RelatedProcedures } from '@/components/blog/related-procedures.component'
import { SocialShare } from '@/components/blog/social-share.component'
import { TableOfContents } from '@/components/blog/table-of-contents.component'
import { BlogPostsSection } from '@/components/shared/blog-posts-section.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import type { AdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import type { InlineImage } from '@/lib/queries/blog/post-images.query'
import { seoConfig } from '@/lib/seo-config'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'
import type { BlogPostDetail } from '@/lib/types/blog/post-detail.type'
import type { TOCHeading } from '@/lib/types/blog/toc.type'
import type { Procedure } from '@/lib/types/procedure.type'

type BlogPostContentProps = {
    post: BlogPostDetail
    relatedPosts: BlogPostCard[]
    relatedProcedures?: Procedure[]
    tableOfContents: TOCHeading[]
    beforeCTA: string
    afterCTA: string | null
    ctaId: string | null
    adjacentPosts: AdjacentPosts
    /** Inline images for schema generation */
    inlineImages?: InlineImage[]
}

/**
 * Blog post content component
 * Renders the full blog post content with cinematic hero,
 * related posts and CTAs
 */
export function BlogPostContent({
    post,
    relatedPosts,
    relatedProcedures,
    tableOfContents,
    beforeCTA,
    afterCTA,
    ctaId,
    adjacentPosts,
    inlineImages,
}: BlogPostContentProps) {
    // Guard: publishedAt is required for published posts
    if (!post.publishedAt) {
        throw new Error(
            `BlogPostContent: publishedAt is required for published post "${post.slug}"`
        )
    }

    const publishedDate = new Date(post.publishedAt).toLocaleDateString(
        'en-US',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }
    )

    const primaryCategory = post.categories[0]

    return (
        <article className='relative'>
            {/* Reading progress bar */}
            <ReadingProgress />

            {/* Social sharing buttons */}
            <SocialShare
                title={post.title}
                url={`/${post.slug}`}
                description={post.excerpt ?? undefined}
                imageUrl={post.featuredImage?.url}
            />

            {/* Track blog post view */}
            <BlogViewTracker postId={post.id} />

            {/* ============================================
                HERO SECTION - Full Viewport Cinematic
            ============================================ */}
            <section className='relative h-[100svh] min-h-[600px] w-full overflow-hidden'>
                {/* Background Image */}
                {post.featuredImage ? (
                    <>
                        <Image
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt}
                            fill
                            className='object-cover'
                            sizes='100vw'
                            priority
                            placeholder={
                                post.featuredImage.blurDataUrl
                                    ? 'blur'
                                    : 'empty'
                            }
                            blurDataURL={
                                post.featuredImage.blurDataUrl ?? undefined
                            }
                        />
                        {/* Cinematic gradient overlay */}
                        <div className='absolute inset-0 bg-linear-to-t from-stone-950 via-stone-900/60 to-stone-900/30' />
                        <div className='absolute inset-0 bg-stone-900/20' />
                    </>
                ) : (
                    <div className='absolute inset-0 bg-linear-to-br from-stone-800 to-stone-950' />
                )}

                {/* Hero Content */}
                <div className='absolute inset-0 flex flex-col justify-end'>
                    <div className='container mx-auto px-5 pb-16 md:px-8 md:pb-20 lg:px-12 lg:pb-24'>
                        {/* Mobile Layout */}
                        <div className='md:hidden'>
                            {/* Category badge */}
                            {primaryCategory && (
                                <Link
                                    href={`/blog/categories/${primaryCategory.slug}`}
                                    className='border-gold-500/60 bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 animate-fade-in-up mb-5 inline-flex items-center border px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm transition-colors'
                                >
                                    {primaryCategory.name}
                                </Link>
                            )}

                            {/* Title */}
                            <h1 className='animate-fade-in-up animate-delay-100 mb-5 font-serif text-3xl leading-[1.15] font-medium text-white drop-shadow-lg sm:text-4xl'>
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            {post.excerpt && (
                                <p className='animate-fade-in-up animate-delay-200 mb-6 line-clamp-3 text-base leading-relaxed text-stone-200/90'>
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Meta */}
                            <div className='animate-fade-in-up animate-delay-300 flex flex-wrap items-center gap-4 text-sm text-stone-300'>
                                {post.author && (
                                    <span className='flex items-center gap-2'>
                                        <User className='h-4 w-4 text-stone-400' />
                                        {post.author.name}
                                    </span>
                                )}
                                <span className='flex items-center gap-2'>
                                    <Calendar className='h-4 w-4 text-stone-400' />
                                    {publishedDate}
                                </span>
                                {post.readingTime && (
                                    <span className='flex items-center gap-2'>
                                        <Clock className='h-4 w-4 text-stone-400' />
                                        {post.readingTime} min
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Desktop Layout - Glassmorphism Card */}
                        <div className='hidden md:block'>
                            <div className='max-w-4xl'>
                                <div className='animate-fade-in-up relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl lg:p-14'>
                                    {/* Decorative blurs */}
                                    <div className='bg-gold-400/15 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl' />
                                    <div className='absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-stone-500/15 blur-3xl' />

                                    <div className='relative z-10'>
                                        {/* Top row: Category + Reading time */}
                                        <div className='mb-8 flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                {primaryCategory && (
                                                    <Link
                                                        href={`/blog/categories/${primaryCategory.slug}`}
                                                        className='border-gold-500/60 bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 inline-flex items-center border px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm transition-all hover:scale-105'
                                                    >
                                                        {primaryCategory.name}
                                                    </Link>
                                                )}
                                                {post.readingTime && (
                                                    <span className='flex items-center gap-2 text-sm text-stone-400'>
                                                        <Clock className='h-4 w-4' />
                                                        {post.readingTime} min
                                                        read
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h1 className='mb-6 font-serif text-4xl leading-[1.1] font-medium text-white drop-shadow-lg lg:text-5xl xl:text-6xl'>
                                            {post.title}
                                        </h1>

                                        {/* Gold accent line */}
                                        <div className='bg-gold-500 mb-8 h-1 w-24 shadow-[0_0_20px_rgba(234,179,8,0.4)]' />

                                        {/* Excerpt */}
                                        {post.excerpt && (
                                            <p className='mb-10 max-w-3xl text-lg leading-relaxed text-stone-200/90 lg:text-xl'>
                                                {post.excerpt}
                                            </p>
                                        )}

                                        {/* Bottom row: Author + CTA */}
                                        <div className='flex flex-wrap items-center justify-between gap-6'>
                                            <div className='flex items-center gap-6 text-sm text-stone-400'>
                                                {post.author && (
                                                    <span className='flex items-center gap-2'>
                                                        <User className='h-4 w-4' />
                                                        <span className='font-medium text-stone-300'>
                                                            {post.author.name}
                                                        </span>
                                                    </span>
                                                )}
                                                <span className='flex items-center gap-2'>
                                                    <Calendar className='h-4 w-4' />
                                                    {publishedDate}
                                                </span>
                                            </div>

                                            <Button
                                                asChild
                                                variant='gold'
                                                size='lg'
                                                withArrow
                                            >
                                                <Link href='/contact-us'>
                                                    Free Consultation
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className='absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce'>
                    <div className='flex flex-col items-center gap-2 text-white/50'>
                        <span className='text-xs font-medium tracking-widest uppercase'>
                            Scroll
                        </span>
                        <ChevronDown className='h-5 w-5' />
                    </div>
                </div>
            </section>

            {/* ============================================
                CONTENT SECTION
            ============================================ */}
            <section className='relative bg-white'>
                {/* Decorative top wave/curve */}
                <div className='absolute -top-1 right-0 left-0 h-2 bg-white' />

                <ContentWrapper
                    size='lg'
                    paddingX='px-5 md:px-8 lg:px-12'
                    className='py-12 md:py-16 lg:py-20'
                >
                    {/* Two column layout */}
                    <div className='grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px] xl:gap-16'>
                        {/* Main content column */}
                        <div className='min-w-0'>
                            {/* Article content */}
                            <div className='prose prose-lg prose-stone prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-stone-900 prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-stone-200 prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-6 prose-li:text-stone-700 prose-li:mb-2 prose-strong:text-stone-900 prose-strong:font-semibold prose-a:text-gold-600 prose-a:no-underline prose-a:font-medium hover:prose-a:text-gold-700 hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-gold-500 prose-blockquote:bg-stone-50 prose-blockquote:pl-6 prose-blockquote:pr-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-stone-700 prose-code:bg-stone-100 prose-code:text-stone-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-stone-900 prose-pre:border-0 prose-pre:rounded-xl prose-img:rounded-xl prose-img:shadow-lg max-w-none'>
                                <PostMarkdown content={beforeCTA} />
                            </div>

                            {/* Inline CTA */}
                            {beforeCTA && (
                                <div className='my-16'>
                                    <BlogCTA
                                        variant='inline'
                                        ctaId={ctaId || 'default'}
                                    />
                                </div>
                            )}

                            {/* Content after CTA */}
                            {afterCTA && (
                                <div className='prose prose-lg prose-stone prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-stone-900 prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-stone-200 prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-6 prose-li:text-stone-700 prose-li:mb-2 prose-strong:text-stone-900 prose-strong:font-semibold prose-a:text-gold-600 prose-a:no-underline prose-a:font-medium hover:prose-a:text-gold-700 hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-gold-500 prose-blockquote:bg-stone-50 prose-blockquote:pl-6 prose-blockquote:pr-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-stone-700 prose-code:bg-stone-100 prose-code:text-stone-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-stone-900 prose-pre:border-0 prose-pre:rounded-xl prose-img:rounded-xl prose-img:shadow-lg max-w-none'>
                                    <PostMarkdown content={afterCTA} />
                                </div>
                            )}

                            {/* Schema markup */}
                            <ArticleSchema
                                type='BlogPosting'
                                headline={post.title}
                                description={post.excerpt ?? undefined}
                                author={
                                    post.author?.name ??
                                    seoConfig.organization?.name ??
                                    seoConfig.siteName
                                }
                                datePublished={post.publishedAt}
                                dateModified={
                                    post.updatedAt ?? post.publishedAt
                                }
                                image={post.featuredImage?.url}
                                mainEntityOfPage={`${seoConfig.siteUrl}/${post.slug}`}
                                publisher={{
                                    name:
                                        seoConfig.organization?.name ??
                                        seoConfig.siteName,
                                    logo: seoConfig.organization?.logo,
                                    url:
                                        seoConfig.organization?.url ??
                                        seoConfig.siteUrl,
                                }}
                                wordCount={
                                    post.readingTime
                                        ? Math.round(post.readingTime * 200)
                                        : undefined
                                }
                                articleSection={primaryCategory?.name}
                                keywords={
                                    post.tags.length > 0
                                        ? post.tags.map((t) => t.name)
                                        : undefined
                                }
                            />

                            {/* FAQ Schema for blog posts with FAQs */}
                            {post.faqs && post.faqs.length > 0 && (
                                <FAQSchema
                                    items={post.faqs.map((faq) => ({
                                        question: faq.question,
                                        answer: faq.answer,
                                    }))}
                                    mainEntityOfPage={`${seoConfig.siteUrl}/${post.slug}`}
                                />
                            )}

                            {/* ImageObject schemas for inline images */}
                            {inlineImages && inlineImages.length > 0 && (
                                <BlogPostImagesSchema
                                    images={inlineImages}
                                    postUrl={`${seoConfig.siteUrl}/${post.slug}`}
                                    postTitle={post.title}
                                    authorName={post.author?.name}
                                    datePublished={
                                        post.publishedAt ?? undefined
                                    }
                                />
                            )}

                            {/* Topics/Tags section */}
                            {(post.categories.length > 0 ||
                                post.tags.length > 0) && (
                                <footer className='mt-16 border-t border-stone-200 pt-10'>
                                    <h2 className='mb-6 text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                        Topics
                                    </h2>
                                    <div className='flex flex-wrap gap-3'>
                                        {post.categories.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={`/blog/categories/${c.slug}`}
                                                className='hover:bg-gold-500/10 hover:text-gold-700 hover:border-gold-500/30 inline-flex items-center rounded-full border border-transparent bg-stone-100 px-5 py-2.5 text-sm font-medium text-stone-700 transition-all duration-200'
                                            >
                                                {c.name}
                                            </Link>
                                        ))}
                                        {post.tags.map((t) => (
                                            <Link
                                                key={t.id}
                                                href={`/blog/tags/${t.slug}`}
                                                className='hover:border-gold-500/50 hover:text-gold-600 inline-flex items-center rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 transition-all duration-200'
                                            >
                                                #{t.name}
                                            </Link>
                                        ))}
                                    </div>
                                </footer>
                            )}

                            {/* Footer CTA */}
                            <div className='mt-16'>
                                <BlogCTA
                                    variant='footer'
                                    ctaId='consultation'
                                />
                            </div>

                            {/* Previous/Next Post Navigation */}
                            <PostNavigation
                                previousPost={adjacentPosts.previousPost}
                                nextPost={adjacentPosts.nextPost}
                            />

                            {/* Related Posts */}
                            <div className='mt-16'>
                                <RelatedPosts posts={relatedPosts} />
                            </div>

                            {/* Related Procedures - Cross-linking for SEO */}
                            {relatedProcedures &&
                                relatedProcedures.length > 0 && (
                                    <div className='mt-8'>
                                        <RelatedProcedures
                                            procedures={relatedProcedures}
                                            title='Related Procedures'
                                            description='Explore the procedures discussed in this article'
                                        />
                                    </div>
                                )}
                        </div>

                        {/* Sidebar */}
                        <aside className='hidden lg:block'>
                            <div className='sticky top-24 space-y-6'>
                                {/* Table of Contents */}
                                <div className='rounded-2xl border border-stone-200 bg-stone-50/50 p-6'>
                                    <h3 className='mb-5 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                        <span className='bg-gold-500 h-4 w-1 rounded-full' />
                                        In This Article
                                    </h3>
                                    <TableOfContents
                                        headings={tableOfContents}
                                    />
                                </div>

                                {/* Consultation CTA */}
                                <div className='border-gold-500/30 from-gold-500/5 overflow-hidden rounded-2xl border bg-linear-to-br to-stone-50'>
                                    <div className='p-6'>
                                        <div className='bg-gold-500 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl'>
                                            <svg
                                                className='h-6 w-6 text-white'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                                />
                                            </svg>
                                        </div>
                                        <h3 className='mb-2 font-serif text-xl font-medium text-stone-900'>
                                            Ready to Transform?
                                        </h3>
                                        <p className='mb-5 text-sm leading-relaxed text-stone-600'>
                                            Schedule your complimentary
                                            consultation with our
                                            board-certified surgeons.
                                        </p>
                                        <Link
                                            href='/contact-us'
                                            className='bg-gold-500 hover:bg-gold-600 hover:shadow-gold-500/20 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg'
                                        >
                                            Book Free Consultation
                                            <svg
                                                className='h-4 w-4'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                    <div className='border-gold-500/20 bg-gold-500/5 border-t px-6 py-4'>
                                        <p className='flex items-center gap-2 text-xs text-stone-600'>
                                            <svg
                                                className='text-gold-500 h-4 w-4'
                                                fill='currentColor'
                                                viewBox='0 0 20 20'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                                    clipRule='evenodd'
                                                />
                                            </svg>
                                            5,000+ Happy Patients
                                        </p>
                                    </div>
                                </div>

                                {/* Phone CTA */}
                                <div className='rounded-2xl border border-stone-200 bg-white p-6'>
                                    <p className='mb-3 text-xs font-medium text-stone-500'>
                                        Prefer to talk?
                                    </p>
                                    <Link
                                        href='tel:+17863058649'
                                        className='hover:text-gold-600 flex items-center gap-3 text-lg font-bold text-stone-900 transition-colors'
                                    >
                                        <span className='flex h-10 w-10 items-center justify-center rounded-full bg-stone-100'>
                                            <svg
                                                className='h-5 w-5 text-stone-700'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                                                />
                                            </svg>
                                        </span>
                                        (786) 305-8649
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </ContentWrapper>
            </section>

            {/* More from This Category Section */}
            {primaryCategory && (
                <BlogPostsSection
                    categorySlug={primaryCategory.slug}
                    excludeSlug={post.slug}
                    title={`More ${primaryCategory.name} Articles`}
                    description={`Continue exploring our ${primaryCategory.name.toLowerCase()} resources`}
                    badge='Keep Reading'
                    limit={3}
                    variant='muted'
                    viewAllText={`View all ${primaryCategory.name.toLowerCase()} articles`}
                    viewAllHref={`/blog/categories/${primaryCategory.slug}`}
                />
            )}
        </article>
    )
}
