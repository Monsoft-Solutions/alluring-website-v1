/**
 * PopularPosts Component
 *
 * Displays most viewed posts widget for sidebar or sections.
 * Features:
 * - Numbered list showing top posts by views
 * - View count display (formatted as K/M)
 * - Gold accent styling
 *
 * SSR-compatible server component.
 */
import { TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import {
    formatViewCount,
    type PopularPost,
} from '@/lib/queries/blog/popular-posts.query'
import { getBlogPostUrl } from '@/lib/utils/blog-url.util'

type PopularPostsProps = {
    posts: PopularPost[]
    /**
     * Variant for different display contexts
     * - 'sidebar': Compact list for sidebar
     * - 'section': Larger cards for blog page sections
     */
    variant?: 'sidebar' | 'section'
}

export function PopularPosts({
    posts,
    variant = 'sidebar',
}: PopularPostsProps) {
    if (posts.length === 0) {
        return null
    }

    if (variant === 'section') {
        return (
            <section className='bg-stone-50 py-12 md:py-16'>
                <div className='container mx-auto px-5 md:px-8 lg:px-12'>
                    {/* Section header */}
                    <div className='mb-8 flex items-center gap-3'>
                        <div className='bg-gold-500/10 flex h-10 w-10 items-center justify-center rounded-full'>
                            <TrendingUp className='text-gold-600 h-5 w-5' />
                        </div>
                        <h2 className='font-serif text-2xl font-medium text-stone-900'>
                            Most Read Articles
                        </h2>
                    </div>

                    {/* Posts grid */}
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
                        {posts.slice(0, 5).map((post, index) => (
                            <Link
                                key={post.slug}
                                href={getBlogPostUrl(
                                    post.slug,
                                    post.publishedAt
                                )}
                                className='group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-all duration-300 hover:border-stone-300 hover:shadow-lg'
                            >
                                {/* Thumbnail */}
                                {post.featuredImage && (
                                    <div className='relative aspect-[16/10] overflow-hidden'>
                                        <Image
                                            src={post.featuredImage.url}
                                            alt={post.featuredImage.alt}
                                            fill
                                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                                            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw'
                                            placeholder={
                                                post.featuredImage.blurDataUrl
                                                    ? 'blur'
                                                    : 'empty'
                                            }
                                            blurDataURL={
                                                post.featuredImage
                                                    .blurDataUrl ?? undefined
                                            }
                                        />
                                        {/* Rank badge */}
                                        <div className='bg-gold-500 absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg'>
                                            {index + 1}
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className='flex flex-1 flex-col p-4'>
                                    <h3 className='line-clamp-2 flex-1 font-serif text-base font-medium text-stone-900 transition-colors duration-300 group-hover:text-stone-700'>
                                        {post.title}
                                    </h3>
                                    <div className='mt-2 flex items-center gap-1.5 text-xs text-stone-500'>
                                        <TrendingUp className='h-3.5 w-3.5' />
                                        <span>
                                            {formatViewCount(post.views)} views
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Default sidebar variant
    return (
        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-5'>
            {/* Header */}
            <div className='mb-4 flex items-center gap-2'>
                <div className='bg-gold-500/10 flex h-8 w-8 items-center justify-center rounded-full'>
                    <TrendingUp className='text-gold-600 h-4 w-4' />
                </div>
                <h3 className='text-xs font-bold tracking-[0.15em] text-stone-500 uppercase'>
                    Most Read
                </h3>
            </div>

            {/* Posts list */}
            <ul className='space-y-3'>
                {posts.slice(0, 5).map((post, index) => (
                    <li key={post.slug}>
                        <Link
                            href={getBlogPostUrl(post.slug, post.publishedAt)}
                            className='group flex items-start gap-3'
                        >
                            {/* Rank number */}
                            <span className='text-gold-500 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-sm font-bold'>
                                {index + 1}
                            </span>

                            {/* Post info */}
                            <div className='min-w-0 flex-1'>
                                <p className='line-clamp-2 text-sm font-medium text-stone-700 transition-colors duration-200 group-hover:text-stone-900'>
                                    {post.title}
                                </p>
                                <span className='mt-0.5 block text-xs text-stone-400'>
                                    {formatViewCount(post.views)} views
                                </span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
