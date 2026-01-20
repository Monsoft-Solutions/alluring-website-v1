/**
 * PostNavigation Component
 *
 * Displays previous/next post navigation at the bottom of blog posts.
 * Features:
 * - Two-column layout on desktop, stacked on mobile
 * - Featured image thumbnails
 * - Gold arrow icons with stone background hover
 *
 * SSR-compatible with CSS animations.
 */
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { AdjacentPost } from '@/lib/queries/blog/adjacent-posts.query'

type PostNavigationProps = {
    previousPost: AdjacentPost | null
    nextPost: AdjacentPost | null
}

function NavigationLink({
    post,
    direction,
}: {
    post: AdjacentPost
    direction: 'previous' | 'next'
}) {
    const isPrevious = direction === 'previous'

    return (
        <Link
            href={`/blog/${post.slug}`}
            className='group relative flex flex-1 items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-all duration-300 hover:border-stone-300 hover:bg-stone-50 hover:shadow-lg md:p-5'
        >
            {/* Arrow indicator - previous on left, next on right */}
            {isPrevious && (
                <div className='bg-gold-500/10 group-hover:bg-gold-500 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 md:h-12 md:w-12'>
                    <ArrowLeft className='text-gold-600 h-5 w-5 transition-colors duration-300 group-hover:text-white md:h-6 md:w-6' />
                </div>
            )}

            {/* Thumbnail */}
            {post.featuredImage && (
                <div className='relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-lg sm:block md:h-20 md:w-24'>
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                        sizes='96px'
                        placeholder={
                            post.featuredImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={
                            post.featuredImage.blurDataUrl ?? undefined
                        }
                    />
                </div>
            )}

            {/* Content */}
            <div
                className={`min-w-0 flex-1 ${isPrevious ? 'text-left' : 'text-right'}`}
            >
                <span className='text-gold-600 mb-1 block text-xs font-bold tracking-[0.15em] uppercase'>
                    {isPrevious ? 'Previous Post' : 'Next Post'}
                </span>
                <h4 className='line-clamp-2 font-serif text-base font-medium text-stone-900 transition-colors duration-300 group-hover:text-stone-700 md:text-lg'>
                    {post.title}
                </h4>
            </div>

            {/* Thumbnail for next (on right side) */}
            {!isPrevious && post.featuredImage && (
                <div className='relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-lg sm:block md:h-20 md:w-24'>
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                        sizes='96px'
                        placeholder={
                            post.featuredImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={
                            post.featuredImage.blurDataUrl ?? undefined
                        }
                    />
                </div>
            )}

            {/* Arrow indicator - next on right */}
            {!isPrevious && (
                <div className='bg-gold-500/10 group-hover:bg-gold-500 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 md:h-12 md:w-12'>
                    <ArrowRight className='text-gold-600 h-5 w-5 transition-colors duration-300 group-hover:text-white md:h-6 md:w-6' />
                </div>
            )}
        </Link>
    )
}

export function PostNavigation({
    previousPost,
    nextPost,
}: PostNavigationProps) {
    // Don't render if no adjacent posts
    if (!previousPost && !nextPost) {
        return null
    }

    return (
        <nav
            aria-label='Post navigation'
            className='mt-12 border-t border-stone-200 pt-12'
        >
            <h2 className='sr-only'>Navigate to other posts</h2>

            <div className='flex flex-col gap-4 md:flex-row'>
                {/* Previous post - left side */}
                {previousPost ? (
                    <NavigationLink post={previousPost} direction='previous' />
                ) : (
                    <div className='hidden flex-1 md:block' />
                )}

                {/* Next post - right side */}
                {nextPost ? (
                    <NavigationLink post={nextPost} direction='next' />
                ) : (
                    <div className='hidden flex-1 md:block' />
                )}
            </div>
        </nav>
    )
}
