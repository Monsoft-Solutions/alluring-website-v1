'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { BlogPostCard } from '@/lib/types/blog/post-card.type'

type PostCardProps = {
    post: BlogPostCard
}

export function PostCard({ post }: PostCardProps) {
    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : null

    const titleId = `post-title-${post.id}`

    return (
        <article className='group bg-card hover:bg-card/80 focus-within:ring-ring focus-within:ring-offset-background relative flex flex-col overflow-hidden rounded-lg border-0 transition-all duration-200 focus-within:ring-1 focus-within:ring-offset-1 hover:shadow-sm'>
            <Link
                href={`/blog/${post.slug}`}
                aria-labelledby={titleId}
                className='absolute inset-0 z-10 focus:outline-none'
            >
                <span className='sr-only'>Read article: {post.title}</span>
            </Link>

            {post.featuredImage && (
                <div className='bg-muted/30 relative aspect-[5/3] w-full overflow-hidden rounded-md'>
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        fill
                        className='object-cover transition-all duration-300 ease-out group-hover:scale-[1.02]'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        placeholder={
                            post.featuredImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={
                            post.featuredImage.blurDataUrl ?? undefined
                        }
                    />
                </div>
            )}

            <div className='flex flex-1 flex-col gap-5 p-8'>
                {/* Meta information */}
                <div className='text-muted-foreground flex flex-wrap items-center gap-3 text-sm font-normal'>
                    {post.author && (
                        <span className='inline-flex items-center font-medium'>
                            {post.author.name}
                        </span>
                    )}
                    {publishedDate && (
                        <>
                            <span
                                className='text-muted-foreground/30'
                                aria-hidden='true'
                            >
                                •
                            </span>
                            <time
                                dateTime={post.publishedAt ?? undefined}
                                className='inline-flex items-center'
                            >
                                {publishedDate}
                            </time>
                        </>
                    )}
                    {post.readingTime && (
                        <>
                            <span
                                className='text-muted-foreground/30'
                                aria-hidden='true'
                            >
                                •
                            </span>
                            <span className='inline-flex items-center'>
                                {post.readingTime} min read
                            </span>
                        </>
                    )}
                </div>

                {/* Title */}
                <h2
                    id={titleId}
                    className='text-foreground group-hover:text-foreground/90 text-xl leading-snug font-semibold tracking-tight transition-colors duration-200 lg:text-2xl lg:leading-tight'
                >
                    {post.title}
                </h2>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className='text-muted-foreground line-clamp-3 text-base leading-relaxed'>
                        {post.excerpt}
                    </p>
                )}

                {/* Read more link */}
                <div className='mt-auto flex items-center gap-2 pt-2'>
                    <span className='text-primary text-sm font-medium transition-colors duration-200 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2'>
                        Read more
                    </span>
                    <ArrowRight
                        className='text-primary h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5'
                        aria-hidden='true'
                    />
                </div>
            </div>
        </article>
    )
}
