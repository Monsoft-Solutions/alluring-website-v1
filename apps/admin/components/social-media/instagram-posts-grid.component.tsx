'use client'

/**
 * Instagram Posts Grid Component
 *
 * Grid display of Instagram posts with actions.
 *
 * @module components/social-media/instagram-posts-grid
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    Heart,
    MessageCircle,
    Play,
    ExternalLink,
    MoreVertical,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Layers,
    Video,
    Image as ImageIcon,
} from 'lucide-react'

import type { InstagramPostListItem } from '@/lib/queries/social-media.query'
import {
    toggleInstagramPostPublished,
    toggleInstagramPostFeatured,
} from '@/lib/actions/social-media.action'

type InstagramPostsGridProps = {
    posts: InstagramPostListItem[]
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

function PostCard({ post }: { post: InstagramPostListItem }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleTogglePublished = () => {
        startTransition(async () => {
            await toggleInstagramPostPublished(post.id, !post.isPublished)
            router.refresh()
        })
    }

    const handleToggleFeatured = () => {
        startTransition(async () => {
            await toggleInstagramPostFeatured(post.id, !post.isFeatured)
            router.refresh()
        })
    }

    const mediaTypeIcon = {
        image: <ImageIcon className='h-3 w-3' />,
        video: <Video className='h-3 w-3' />,
        carousel: <Layers className='h-3 w-3' />,
    }

    return (
        <Card className='group overflow-hidden'>
            {/* Image */}
            <div className='relative aspect-square'>
                <Image
                    src={post.media.thumbnailUrl ?? post.media.url}
                    alt={post.caption?.substring(0, 100) ?? 'Instagram post'}
                    fill
                    className='object-cover transition-transform group-hover:scale-105'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />

                {/* Overlay on hover */}
                <div className='absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                    <div className='flex items-center gap-1 text-white'>
                        <Heart className='h-5 w-5' />
                        <span className='font-semibold'>
                            {formatNumber(post.likeCount)}
                        </span>
                    </div>
                    <div className='flex items-center gap-1 text-white'>
                        <MessageCircle className='h-5 w-5' />
                        <span className='font-semibold'>
                            {formatNumber(post.commentCount)}
                        </span>
                    </div>
                    {post.playCount && (
                        <div className='flex items-center gap-1 text-white'>
                            <Play className='h-5 w-5' />
                            <span className='font-semibold'>
                                {formatNumber(post.playCount)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Media type badge */}
                <div className='absolute top-2 left-2'>
                    <Badge
                        variant='secondary'
                        className='gap-1 bg-black/50 text-white backdrop-blur-sm'
                    >
                        {mediaTypeIcon[post.mediaType]}
                        {post.mediaType === 'carousel' &&
                            post.carouselCount &&
                            ` ${post.carouselCount}`}
                    </Badge>
                </div>

                {/* Status badges */}
                <div className='absolute top-2 right-2 flex flex-col gap-1'>
                    {post.isPublished && (
                        <Badge className='bg-green-500'>Published</Badge>
                    )}
                    {post.isFeatured && (
                        <Badge className='bg-yellow-500'>Featured</Badge>
                    )}
                </div>

                {/* Actions dropdown */}
                <div className='absolute right-2 bottom-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='secondary'
                                size='icon'
                                className='h-8 w-8 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70'
                                disabled={isPending}
                            >
                                <MoreVertical className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={handleTogglePublished}>
                                {post.isPublished ? (
                                    <>
                                        <EyeOff className='mr-2 h-4 w-4' />
                                        Unpublish
                                    </>
                                ) : (
                                    <>
                                        <Eye className='mr-2 h-4 w-4' />
                                        Publish
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleToggleFeatured}>
                                {post.isFeatured ? (
                                    <>
                                        <StarOff className='mr-2 h-4 w-4' />
                                        Unfeature
                                    </>
                                ) : (
                                    <>
                                        <Star className='mr-2 h-4 w-4' />
                                        Feature
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a
                                    href={post.permalink}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <ExternalLink className='mr-2 h-4 w-4' />
                                    View on Instagram
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Caption preview */}
            <CardContent className='p-3'>
                <p className='text-muted-foreground line-clamp-2 text-sm'>
                    {post.caption ?? 'No caption'}
                </p>
                <p className='text-muted-foreground mt-2 text-xs'>
                    {new Date(post.takenAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </p>
            </CardContent>
        </Card>
    )
}

export function InstagramPostsGrid({ posts }: InstagramPostsGridProps) {
    if (posts.length === 0) {
        return (
            <div className='py-12 text-center'>
                <p className='text-muted-foreground'>
                    No posts found. Click &quot;Sync Now&quot; to fetch posts
                    from Instagram.
                </p>
            </div>
        )
    }

    return (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}
