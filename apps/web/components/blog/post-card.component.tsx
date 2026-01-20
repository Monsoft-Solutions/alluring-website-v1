/**
 * PostCard Component
 *
 * Luxury blog post card with glassmorphism effect and gold accents.
 * Features image zoom on hover, lift effect, and gold border glow.
 * Enhanced with better aspect ratio for various image formats.
 *
 * SSR-compatible: Uses CSS transitions and transforms.
 */
'use client'

import { ImageObjectSchema } from '@workspace/seo/react'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { siteConfig } from '@/lib/data/site-config'

import { cn } from '@workspace/ui/lib/utils'

import type { BlogPostCard } from '@/lib/types/blog/post-card.type'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

type PostCardProps = {
    post: BlogPostCard
    className?: string
    includeSchema?: boolean
}

export function PostCard({
    post,
    className,
    includeSchema = true,
}: PostCardProps) {
    const { track } = useAnalyticsEvent()

    const defaultAuthor = {
        '@type': 'Organization' as const,
        name: siteConfig.business.name,
    }

    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : null

    const titleId = `post-title-${post.id}`

    const handleClick = () => {
        track('content_click', {
            content_type: 'blog_post',
            post_title: post.title,
            post_slug: post.slug,
            post_author: post.author?.name,
        })
    }

    return (
        <article
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-2xl',
                'border border-stone-200/80 bg-white',
                'shadow-sm shadow-stone-900/5',
                'transition-all duration-500 ease-out',
                'hover:border-gold-500/40 hover:shadow-gold-500/10 hover:-translate-y-2 hover:shadow-xl',
                className
            )}
        >
            {/* Clickable overlay */}
            <Link
                href={`/${post.slug}`}
                onClick={handleClick}
                aria-labelledby={titleId}
                className='focus:ring-gold-500/50 absolute inset-0 z-10 focus:ring-2 focus:ring-offset-2 focus:outline-none'
            >
                <span className='sr-only'>Read article: {post.title}</span>
            </Link>

            {/* Image Container - Better aspect ratio for 1:1 images */}
            {post.featuredImage && (
                <div className='relative aspect-[4/3] w-full overflow-hidden bg-stone-100'>
                    {includeSchema && (
                        <ImageObjectSchema
                            url={post.featuredImage.url}
                            alt={post.featuredImage.alt}
                            author={defaultAuthor}
                            copyrightHolder={siteConfig.business.name}
                            name={
                                post.featuredImage.alt ||
                                siteConfig.business.name
                            }
                        />
                    )}
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        fill
                        className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        placeholder={
                            post.featuredImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={
                            post.featuredImage.blurDataUrl ?? undefined
                        }
                    />
                    {/* Gradient overlay on hover */}
                    <div className='absolute inset-0 bg-linear-to-t from-stone-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

                    {/* Reading time badge */}
                    {post.readingTime && (
                        <div className='absolute top-4 right-4 z-[1]'>
                            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700 backdrop-blur-sm'>
                                <Clock className='h-3 w-3' />
                                {post.readingTime} min
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className='flex flex-1 flex-col p-6'>
                {/* Meta information */}
                <div className='mb-4 flex flex-wrap items-center gap-3 text-xs text-stone-500'>
                    {post.author && (
                        <span className='font-medium text-stone-700'>
                            {post.author.name}
                        </span>
                    )}
                    {publishedDate && post.author && (
                        <span className='text-stone-300' aria-hidden='true'>
                            &bull;
                        </span>
                    )}
                    {publishedDate && (
                        <time
                            dateTime={post.publishedAt ?? undefined}
                            className='flex items-center gap-1.5'
                        >
                            <Calendar className='h-3.5 w-3.5' />
                            {publishedDate}
                        </time>
                    )}
                </div>

                {/* Title */}
                <h3
                    id={titleId}
                    className='group-hover:text-gold-700 mb-3 font-serif text-xl leading-snug text-stone-900 transition-colors duration-300 lg:text-2xl'
                >
                    {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className='mb-6 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-600'>
                        {post.excerpt}
                    </p>
                )}

                {/* Read more link */}
                <div className='mt-auto flex items-center gap-2 pt-4'>
                    <span className='text-gold-600 group-hover:text-gold-500 text-sm font-bold tracking-wide uppercase transition-colors duration-300'>
                        Read Article
                    </span>
                    <ArrowRight
                        className='text-gold-600 group-hover:text-gold-500 h-4 w-4 transition-all duration-300 group-hover:translate-x-1'
                        aria-hidden='true'
                    />
                </div>
            </div>

            {/* Gold accent line at bottom on hover */}
            <div className='bg-gold-500 absolute right-0 bottom-0 left-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100' />
        </article>
    )
}
