/**
 * FeaturedPost Component
 *
 * Large featured post card with different layouts for mobile and desktop.
 * Mobile: Cinematic full-bleed card with overlay content.
 * Desktop: Two-column layout with glassmorphism.
 *
 * SSR-compatible: Uses CSS animations for reveal effects.
 */
import { ArrowRight, Calendar, Clock, Sparkles, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'
import { getBlogPostUrl } from '@/lib/utils/blog-url.util'

type FeaturedPostProps = {
    post: BlogPostCard
    badge?: string
    className?: string
}

export function FeaturedPost({
    post,
    badge = 'Featured Article',
    className,
}: FeaturedPostProps) {
    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : null

    return (
        <SectionContainer variant='default' className={cn('py-0', className)}>
            {/* Mobile: Cinematic full-bleed featured card */}
            <div className='md:hidden'>
                {/* Section Header */}
                <div className='mb-6 flex items-center gap-3 px-5'>
                    <span className='bg-gold-400 h-px w-12' />
                    <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                        {badge}
                    </span>
                </div>

                {/* Full-bleed card */}
                <article className='group relative'>
                    <Link
                        href={getBlogPostUrl(post.slug, post.publishedAt)}
                        className='absolute inset-0 z-20'
                        aria-label={`Read full article: ${post.title}`}
                    >
                        <span className='sr-only'>Read article</span>
                    </Link>

                    {/* Full-edge image with aspect ratio */}
                    <div className='relative aspect-3/4 w-full overflow-hidden'>
                        {post.featuredImage ? (
                            <>
                                <Image
                                    src={post.featuredImage.url}
                                    alt={post.featuredImage.alt}
                                    fill
                                    priority
                                    className='object-cover transition-transform duration-700 ease-out group-active:scale-105'
                                    sizes='100vw'
                                    placeholder={
                                        post.featuredImage.blurDataUrl
                                            ? 'blur'
                                            : 'empty'
                                    }
                                    blurDataURL={
                                        post.featuredImage.blurDataUrl ??
                                        undefined
                                    }
                                />
                                {/* Gradient overlay */}
                                <div className='absolute inset-0 bg-linear-to-t from-stone-950 via-stone-900/50 to-transparent' />
                            </>
                        ) : (
                            <div className='absolute inset-0 bg-linear-to-br from-stone-800 to-stone-950' />
                        )}

                        {/* Featured Badge */}
                        <div className='absolute top-6 left-5'>
                            <span className='border-gold-500/50 bg-gold-500/20 text-gold-400 inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-bold tracking-[0.15em] uppercase backdrop-blur-sm'>
                                <Sparkles className='h-3 w-3' />
                                Featured
                            </span>
                        </div>

                        {/* Content Overlay - Bottom */}
                        <div className='absolute right-0 bottom-0 left-0 flex flex-col p-5'>
                            {/* Meta info */}
                            <div className='mb-3 flex flex-wrap items-center gap-3 text-xs text-stone-400'>
                                {publishedDate && (
                                    <span className='flex items-center gap-1.5'>
                                        <Calendar className='h-3.5 w-3.5' />
                                        {publishedDate}
                                    </span>
                                )}
                                {post.readingTime && (
                                    <span className='flex items-center gap-1.5'>
                                        <Clock className='h-3.5 w-3.5' />
                                        {post.readingTime} min
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h2 className='mb-3 font-serif text-2xl leading-tight text-white'>
                                {post.title}
                            </h2>

                            {/* Excerpt */}
                            {post.excerpt && (
                                <p className='mb-5 line-clamp-2 text-sm leading-relaxed font-light text-stone-300'>
                                    {post.excerpt}
                                </p>
                            )}

                            {/* CTA Button */}
                            <div className='border-gold-500 bg-gold-500/10 group-active:bg-gold-500/20 flex items-center justify-center gap-3 border px-5 py-3.5 backdrop-blur-sm transition-colors duration-300'>
                                <span className='text-gold-400 text-sm font-bold tracking-[0.15em] uppercase'>
                                    Read Article
                                </span>
                                <ArrowRight className='text-gold-400 h-4 w-4' />
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            {/* Desktop: Original two-column layout */}
            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='hidden md:block'
            >
                {/* Section Header */}
                <div className='mb-8 flex items-center gap-3'>
                    <span className='bg-gold-400 h-px w-12' />
                    <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                        {badge}
                    </span>
                </div>

                {/* Featured Card */}
                <article className='group relative overflow-hidden rounded-2xl bg-stone-900 shadow-2xl'>
                    <Link
                        href={getBlogPostUrl(post.slug, post.publishedAt)}
                        className='absolute inset-0 z-20'
                        aria-label={`Read full article: ${post.title}`}
                    >
                        <span className='sr-only'>Read article</span>
                    </Link>

                    <div className='grid lg:grid-cols-2'>
                        {/* Image Section */}
                        <div className='relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[500px]'>
                            {post.featuredImage ? (
                                <>
                                    <Image
                                        src={post.featuredImage.url}
                                        alt={post.featuredImage.alt}
                                        fill
                                        priority
                                        className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                                        sizes='(max-width: 1024px) 100vw, 50vw'
                                        placeholder={
                                            post.featuredImage.blurDataUrl
                                                ? 'blur'
                                                : 'empty'
                                        }
                                        blurDataURL={
                                            post.featuredImage.blurDataUrl ??
                                            undefined
                                        }
                                    />
                                    {/* Gradient overlay */}
                                    <div className='absolute inset-0 bg-linear-to-t from-stone-900/60 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-stone-900' />
                                </>
                            ) : (
                                <div className='absolute inset-0 bg-linear-to-br from-stone-800 to-stone-900' />
                            )}
                        </div>

                        {/* Content Section */}
                        <div className='relative flex flex-col justify-center p-8 lg:p-12 xl:p-16'>
                            {/* Decorative gold blur */}
                            <div className='bg-gold-500/10 pointer-events-none absolute top-0 right-0 h-[200px] w-[200px] translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]' />

                            {/* Featured Badge */}
                            <div className='relative z-10 mb-6'>
                                <span className='border-gold-500/50 bg-gold-500/20 text-gold-400 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold tracking-wide uppercase'>
                                    <Sparkles className='h-4 w-4' />
                                    Featured Article
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className='relative z-10 mb-4 font-serif text-2xl leading-tight text-white transition-colors duration-300 group-hover:text-stone-100 md:text-3xl lg:text-4xl'>
                                {post.title}
                            </h2>

                            {/* Gold accent line */}
                            <div className='bg-gold-500 relative z-10 mb-6 h-1 w-16 shadow-[0_0_15px_rgba(234,179,8,0.3)]' />

                            {/* Excerpt */}
                            {post.excerpt && (
                                <p className='relative z-10 mb-6 line-clamp-3 text-base leading-relaxed font-light text-stone-300 md:text-lg'>
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Meta Info */}
                            <div className='relative z-10 mb-8 flex flex-wrap items-center gap-4 text-sm text-stone-400'>
                                {post.author && (
                                    <span className='flex items-center gap-2'>
                                        <User className='h-4 w-4' />
                                        {post.author.name}
                                    </span>
                                )}
                                {publishedDate && (
                                    <span className='flex items-center gap-2'>
                                        <Calendar className='h-4 w-4' />
                                        {publishedDate}
                                    </span>
                                )}
                                {post.readingTime && (
                                    <span className='flex items-center gap-2'>
                                        <Clock className='h-4 w-4' />
                                        {post.readingTime} min read
                                    </span>
                                )}
                            </div>

                            {/* Read More */}
                            <div className='relative z-10'>
                                <span className='text-gold-400 group-hover:text-gold-300 inline-flex items-center gap-2 text-sm font-bold tracking-wide uppercase transition-colors duration-300'>
                                    Read Full Article
                                    <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                                </span>
                            </div>
                        </div>
                    </div>
                </article>
            </ContentWrapper>
        </SectionContainer>
    )
}
