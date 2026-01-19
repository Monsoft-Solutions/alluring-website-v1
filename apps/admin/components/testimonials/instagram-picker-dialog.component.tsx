'use client'

import { useState } from 'react'
import {
    Check,
    Instagram,
    Search,
    Video,
    Image as ImageIcon,
} from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Badge } from '@workspace/ui/components/badge'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { cn } from '@workspace/ui/lib/utils'

import type { InstagramPostSelectItem } from '@/lib/types/testimonials/testimonial.type'

interface InstagramPickerDialogProps {
    posts: InstagramPostSelectItem[]
    selectedPost: InstagramPostSelectItem | null
    onSelect: (post: InstagramPostSelectItem) => void
}

export function InstagramPickerDialog({
    posts,
    selectedPost,
    onSelect,
}: InstagramPickerDialogProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredPosts = posts.filter((post) => {
        if (!search) return true
        return post.caption?.toLowerCase().includes(search.toLowerCase())
    })

    const handleSelect = (post: InstagramPostSelectItem) => {
        onSelect(post)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' className='w-full'>
                    <Instagram className='mr-2 h-4 w-4' />
                    {selectedPost
                        ? 'Change Instagram Post'
                        : 'Select Instagram Post'}
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-3xl'>
                <DialogHeader>
                    <DialogTitle>Select Instagram Post</DialogTitle>
                    <DialogDescription>
                        Choose a video or carousel post to use as a testimonial
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className='relative'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        placeholder='Search by caption...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='pl-9'
                    />
                </div>

                {/* Posts Grid */}
                <ScrollArea className='h-[400px]'>
                    {filteredPosts.length === 0 ? (
                        <div className='flex h-[300px] items-center justify-center'>
                            <div className='text-center'>
                                <Instagram className='text-muted-foreground mx-auto h-12 w-12' />
                                <p className='text-muted-foreground mt-4 text-sm'>
                                    {posts.length === 0
                                        ? 'No Instagram posts available. Sync posts from Social Media settings.'
                                        : 'No posts match your search.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='grid grid-cols-2 gap-4 p-1 sm:grid-cols-3'>
                            {filteredPosts.map((post) => (
                                <button
                                    key={post.id}
                                    onClick={() => handleSelect(post)}
                                    className={cn(
                                        'group relative overflow-hidden rounded-lg border-2 text-left transition-all hover:border-stone-400',
                                        selectedPost?.id === post.id
                                            ? 'border-stone-900 ring-2 ring-stone-900 ring-offset-2'
                                            : 'border-transparent',
                                        post.hasTestimonial &&
                                            post.id !== selectedPost?.id
                                            ? 'opacity-50'
                                            : ''
                                    )}
                                >
                                    {/* Thumbnail */}
                                    <div className='relative aspect-square bg-stone-100'>
                                        {post.thumbnailUrl ? (
                                            <Image
                                                src={post.thumbnailUrl}
                                                alt={
                                                    post.caption?.slice(
                                                        0,
                                                        50
                                                    ) ?? 'Instagram post'
                                                }
                                                fill
                                                className='object-cover'
                                            />
                                        ) : (
                                            <div className='flex h-full items-center justify-center'>
                                                <Instagram className='text-muted-foreground h-8 w-8' />
                                            </div>
                                        )}

                                        {/* Media type badge */}
                                        <div className='absolute top-2 left-2'>
                                            <Badge
                                                variant='secondary'
                                                className='bg-black/60 text-white'
                                            >
                                                {post.mediaType === 'video' ? (
                                                    <Video className='mr-1 h-3 w-3' />
                                                ) : (
                                                    <ImageIcon className='mr-1 h-3 w-3' />
                                                )}
                                                {post.mediaType}
                                            </Badge>
                                        </div>

                                        {/* Already used badge */}
                                        {post.hasTestimonial &&
                                            post.id !== selectedPost?.id && (
                                                <div className='absolute top-2 right-2'>
                                                    <Badge variant='destructive'>
                                                        In use
                                                    </Badge>
                                                </div>
                                            )}

                                        {/* Selected check */}
                                        {selectedPost?.id === post.id && (
                                            <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                                                <div className='rounded-full bg-white p-2'>
                                                    <Check className='h-6 w-6 text-stone-900' />
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover overlay */}
                                        <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20' />
                                    </div>

                                    {/* Caption preview */}
                                    <div className='p-2'>
                                        <p className='line-clamp-2 text-xs text-stone-600'>
                                            {post.caption?.slice(0, 100) ??
                                                'No caption'}
                                        </p>
                                        <div className='mt-1 flex gap-3 text-xs text-stone-400'>
                                            <span>
                                                {post.likeCount ?? 0} likes
                                            </span>
                                            <span>
                                                {post.commentCount ?? 0}{' '}
                                                comments
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
