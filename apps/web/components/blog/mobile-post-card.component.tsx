/**
 * MobilePostCard Component
 *
 * Cinematic full-bleed blog post card for mobile view.
 * Features:
 * - Full-width edge-to-edge imagery as background
 * - Gradient overlay for text contrast
 * - Content overlaid at bottom
 * - Prominent inline CTA
 *
 * SSR-compatible: Uses CSS transitions and transforms.
 */
'use client'

import { ImageObjectSchema } from '@workspace/seo/react'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { siteConfig } from '@/lib/data/site-config'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'

type MobilePostCardProps = {
    post: BlogPostCard
    includeSchema?: boolean
}

export function MobilePostCard({
    post,
    includeSchema = true,
}: MobilePostCardProps) {
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

    const handleClick = () => {
        track('content_click', {
            content_type: 'blog_post',
            post_title: post.title,
            post_slug: post.slug,
            post_author: post.author?.name,
        })
    }

    return (
        <Link
            href={`/${post.slug}`}
            onClick={handleClick}
            className='group relative block aspect-4/5 w-full overflow-hidden'
            aria-label={`Read article: ${post.title}`}
        >
            {includeSchema && post.featuredImage && (
                <ImageObjectSchema
                    url={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    author={defaultAuthor}
                    copyrightHolder={siteConfig.business.name}
                    name={post.featuredImage.alt || siteConfig.business.name}
                />
            )}

            {/* Background Image */}
            <div className='absolute inset-0'>
                {post.featuredImage ? (
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        fill
                        className='object-cover transition-transform duration-700 ease-out group-active:scale-105'
                        sizes='100vw'
                        placeholder={
                            post.featuredImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={
                            post.featuredImage.blurDataUrl ?? undefined
                        }
                    />
                ) : (
                    <div className='h-full w-full bg-linear-to-br from-stone-800 to-stone-950' />
                )}
            </div>

            {/* Gradient Overlay */}
            <div className='absolute inset-0 bg-linear-to-t from-stone-950 via-stone-900/50 to-transparent' />

            {/* Category Badge - Top Left */}
            <div className='absolute top-6 left-5'>
                <span className='border-gold-500/50 inline-block border bg-stone-950/60 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-white uppercase backdrop-blur-sm'>
                    Article
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
                <h3 className='mb-3 font-serif text-2xl leading-tight text-white'>
                    {post.title}
                </h3>

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
        </Link>
    )
}
