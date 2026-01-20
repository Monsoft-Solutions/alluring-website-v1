/**
 * BlogPostHero Component
 *
 * Cinematic full-width hero for blog post detail pages.
 * Mobile: Full-edge featured image with title overlay at bottom.
 * Desktop: Large cinematic hero with glassmorphism content card.
 *
 * SSR-compatible: Uses CSS-only animations.
 */
import { Calendar, Clock, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'

type BlogPostHeroProps = {
    title: string
    excerpt?: string | null
    featuredImage?: {
        url: string
        alt: string
        blurDataUrl?: string | null
    } | null
    author?: {
        name: string
    } | null
    publishedAt?: string | null
    readingTime?: number | null
    categories?: Array<{ id: string; name: string; slug: string }>
}

export function BlogPostHero({
    title,
    excerpt,
    featuredImage,
    author,
    publishedAt,
    readingTime,
    categories = [],
}: BlogPostHeroProps) {
    const publishedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : null

    const primaryCategory = categories[0]

    return (
        <div className='relative w-full'>
            {/* Background Image - Full width for both mobile and desktop */}
            <div className='relative h-[85vh] w-full overflow-hidden md:h-[70vh] lg:h-[80vh]'>
                {featuredImage ? (
                    <>
                        <Image
                            src={featuredImage.url}
                            alt={featuredImage.alt}
                            fill
                            className='object-cover'
                            sizes='100vw'
                            priority
                            placeholder={
                                featuredImage.blurDataUrl ? 'blur' : 'empty'
                            }
                            blurDataURL={featuredImage.blurDataUrl ?? undefined}
                        />
                        {/* Gradient overlay */}
                        <div className='absolute inset-0 bg-linear-to-t from-stone-950 via-stone-900/50 to-stone-900/20' />
                        {/* Additional darkening for text contrast */}
                        <div className='absolute inset-0 bg-stone-900/30' />
                    </>
                ) : (
                    <div className='absolute inset-0 bg-linear-to-br from-stone-800 to-stone-950' />
                )}
            </div>

            {/* Content Overlay */}
            <div className='absolute inset-0 flex flex-col justify-end'>
                <div className='container mx-auto px-5 pb-10 md:px-8 md:pb-16 lg:px-12 lg:pb-20'>
                    {/* Mobile: Simple overlay content */}
                    <div className='md:hidden'>
                        {/* Category badge */}
                        {primaryCategory && (
                            <div className='animate-fade-in-up mb-4'>
                                <Link
                                    href={`/blog/categories/${primaryCategory.slug}`}
                                    className='border-gold-500/50 bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 inline-flex items-center border px-3 py-1.5 text-xs font-bold tracking-[0.15em] uppercase backdrop-blur-sm transition-colors'
                                >
                                    {primaryCategory.name}
                                </Link>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className='animate-fade-in-up animate-delay-100 mb-4 font-serif text-3xl leading-[1.15] font-medium text-white drop-shadow-lg'>
                            {title}
                        </h1>

                        {/* Meta info */}
                        <div className='animate-fade-in-up animate-delay-200 flex flex-wrap items-center gap-4 text-sm text-stone-300'>
                            {author && (
                                <span className='flex items-center gap-2'>
                                    <User className='h-4 w-4 text-stone-400' />
                                    {author.name}
                                </span>
                            )}
                            {publishedDate && (
                                <span className='flex items-center gap-2'>
                                    <Calendar className='h-4 w-4 text-stone-400' />
                                    {publishedDate}
                                </span>
                            )}
                            {readingTime && (
                                <span className='flex items-center gap-2'>
                                    <Clock className='h-4 w-4 text-stone-400' />
                                    {readingTime} min read
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Desktop: Glassmorphism content card */}
                    <div className='hidden md:block'>
                        <div className='max-w-3xl'>
                            {/* Glassmorphism card */}
                            <div className='animate-fade-in-up relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md lg:p-12'>
                                {/* Decorative elements */}
                                <div className='bg-gold-400/20 absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full blur-3xl' />
                                <div className='absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-stone-500/20 blur-3xl' />

                                <div className='relative z-10'>
                                    {/* Category badge and reading time */}
                                    <div className='mb-6 flex items-center gap-4'>
                                        {primaryCategory && (
                                            <Link
                                                href={`/blog/categories/${primaryCategory.slug}`}
                                                className='border-gold-500/50 bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 inline-flex items-center border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm transition-colors'
                                            >
                                                {primaryCategory.name}
                                            </Link>
                                        )}
                                        {readingTime && (
                                            <span className='flex items-center gap-2 text-sm text-stone-400'>
                                                <Clock className='h-4 w-4' />
                                                {readingTime} min read
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h1 className='mb-6 font-serif text-4xl leading-[1.1] font-medium text-white drop-shadow-lg lg:text-5xl xl:text-6xl'>
                                        {title}
                                    </h1>

                                    {/* Excerpt */}
                                    {excerpt && (
                                        <p className='mb-8 max-w-2xl text-lg leading-relaxed font-light text-stone-200 lg:text-xl'>
                                            {excerpt}
                                        </p>
                                    )}

                                    {/* Meta info and CTA */}
                                    <div className='flex flex-wrap items-center justify-between gap-6'>
                                        <div className='flex flex-wrap items-center gap-6 text-sm text-stone-400'>
                                            {author && (
                                                <span className='flex items-center gap-2'>
                                                    <User className='h-4 w-4' />
                                                    <span className='font-medium text-stone-300'>
                                                        {author.name}
                                                    </span>
                                                </span>
                                            )}
                                            {publishedDate && (
                                                <span className='flex items-center gap-2'>
                                                    <Calendar className='h-4 w-4' />
                                                    {publishedDate}
                                                </span>
                                            )}
                                        </div>

                                        <Button
                                            asChild
                                            variant='gold'
                                            size='lg'
                                            withArrow
                                        >
                                            <Link href='/contact-us'>
                                                Book Consultation
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator - Desktop only */}
            <div className='absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/60 md:flex'>
                <span className='text-xs font-medium tracking-[0.2em] uppercase'>
                    Scroll to read
                </span>
                <div className='flex h-8 w-[1px] overflow-hidden bg-white/20'>
                    <div className='h-1/2 w-full animate-pulse bg-white' />
                </div>
            </div>
        </div>
    )
}
