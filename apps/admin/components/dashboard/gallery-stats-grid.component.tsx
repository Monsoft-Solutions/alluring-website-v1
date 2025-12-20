'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    ImageIcon,
    Video,
    FolderOpen,
    GitCompareArrows,
    ArrowRight,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

import { useGalleryStats } from '@/hooks/use-gallery.hook'

/**
 * Gallery stats grid component that fetches its own data via TanStack Query.
 * Shows media counts, groups, and before/after pairs.
 */
export function GalleryStatsGrid() {
    const { data: stats, isLoading, error, refetch } = useGalleryStats()

    if (isLoading) {
        return <GalleryStatsSkeleton />
    }

    if (error) {
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card className='col-span-full'>
                    <CardContent className='flex items-center justify-center gap-4 py-8'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load gallery stats
                        </p>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => refetch()}
                        >
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!stats) {
        return null
    }

    return (
        <div className='space-y-4'>
            {/* Primary Stats */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                    title='Total Media'
                    value={stats.totalMedia}
                    description={`${stats.publishedMedia} published, ${stats.draftMedia} draft`}
                    icon={<ImageIcon className='h-4 w-4' />}
                    href='/gallery/media'
                />
                <StatCard
                    title='Images'
                    value={stats.totalImages}
                    description='Image files uploaded'
                    icon={<ImageIcon className='h-4 w-4' />}
                    href='/gallery/media?type=image'
                />
                <StatCard
                    title='Videos'
                    value={stats.totalVideos}
                    description='Video files uploaded'
                    icon={<Video className='h-4 w-4' />}
                    href='/gallery/media?type=video'
                />
                <StatCard
                    title='Groups'
                    value={stats.totalGroups}
                    description='Gallery groups'
                    icon={<FolderOpen className='h-4 w-4' />}
                    href='/gallery/groups'
                />
            </div>

            {/* Secondary Stats */}
            <div className='grid gap-4 md:grid-cols-2'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <div>
                            <CardTitle className='text-base'>
                                Before & After
                            </CardTitle>
                            <CardDescription>
                                Transformation comparisons
                            </CardDescription>
                        </div>
                        <GitCompareArrows className='text-muted-foreground h-5 w-5' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-3xl font-bold'>
                            {stats.totalBeforeAfterPairs}
                        </div>
                        <p className='text-muted-foreground text-sm'>
                            comparison pairs
                        </p>
                        <Button
                            variant='link'
                            className='mt-2 h-auto p-0'
                            asChild
                        >
                            <Link href='/gallery/before-after'>
                                Manage pairs
                                <ArrowRight className='ml-1 h-4 w-4' />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <div>
                            <CardTitle className='text-base'>
                                Featured
                            </CardTitle>
                            <CardDescription>
                                Highlighted content
                            </CardDescription>
                        </div>
                        <Badge variant='secondary'>
                            {stats.featuredMedia} items
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className='text-3xl font-bold'>
                            {stats.featuredMedia}
                        </div>
                        <p className='text-muted-foreground text-sm'>
                            featured media items
                        </p>
                        <Button
                            variant='link'
                            className='mt-2 h-auto p-0'
                            asChild
                        >
                            <Link href='/gallery/media?featured=true'>
                                View featured
                                <ArrowRight className='ml-1 h-4 w-4' />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    description,
    icon,
    href,
}: {
    title: string
    value: number
    description: string
    icon: React.ReactNode
    href: string
}) {
    return (
        <Link href={href}>
            <Card className='transition-colors hover:bg-stone-50'>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <CardTitle className='text-sm font-medium'>
                        {title}
                    </CardTitle>
                    <span className='text-muted-foreground'>{icon}</span>
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{value}</div>
                    <p className='text-muted-foreground text-xs'>
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

function GalleryStatsSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-8 w-16' />
                            <Skeleton className='mt-1 h-3 w-32' />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <div className='space-y-2'>
                                <Skeleton className='h-5 w-32' />
                                <Skeleton className='h-4 w-48' />
                            </div>
                            <Skeleton className='h-5 w-5' />
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <Skeleton className='h-8 w-16' />
                            <Skeleton className='h-4 w-32' />
                            <Skeleton className='h-4 w-24' />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
