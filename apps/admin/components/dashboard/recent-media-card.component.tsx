'use client'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { ImageIcon, Video, AlertCircle, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { useRecentMedia } from '@/hooks/use-gallery.hook'

/**
 * Recent media card component that fetches its own data via TanStack Query.
 */
export function RecentMediaCard() {
    const { data: recentMedia, isLoading, error, refetch } = useRecentMedia(8)

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <CardTitle>Recent Uploads</CardTitle>
                    <CardDescription>
                        Latest media added to the gallery
                    </CardDescription>
                </div>
                <Button variant='outline' size='sm' asChild>
                    <Link href='/gallery/media'>View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className='aspect-square rounded-lg'
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className='flex flex-col items-center justify-center gap-4 py-8 text-center'>
                        <AlertCircle className='h-8 w-8 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load recent media
                        </p>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => refetch()}
                        >
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Retry
                        </Button>
                    </div>
                ) : !recentMedia || recentMedia.length === 0 ? (
                    <div className='text-muted-foreground py-8 text-center'>
                        <ImageIcon className='mx-auto mb-2 h-8 w-8 opacity-50' />
                        <p>No media uploaded yet</p>
                        <Button className='mt-4' asChild>
                            <Link href='/gallery/media/new'>
                                Upload your first media
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8'>
                        {recentMedia.map((media) => (
                            <Link
                                key={media.id}
                                href={`/gallery/media/${media.id}/edit`}
                                className='group relative aspect-square overflow-hidden rounded-lg bg-stone-100'
                            >
                                {media.type === 'image' ? (
                                    <Image
                                        src={media.url}
                                        alt={media.title}
                                        fill
                                        className='object-cover transition-transform group-hover:scale-105'
                                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw'
                                    />
                                ) : (
                                    <div className='flex h-full items-center justify-center'>
                                        <Video className='text-muted-foreground h-8 w-8' />
                                    </div>
                                )}
                                <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20' />
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
