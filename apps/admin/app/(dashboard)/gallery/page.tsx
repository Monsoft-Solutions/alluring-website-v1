import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    ImageIcon,
    Video,
    FolderOpen,
    GitCompareArrows,
    Plus,
    ArrowRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getGalleryStats, getRecentMedia } from '@/lib/queries/gallery.query'

export const dynamic = 'force-dynamic'

export default async function GalleryDashboardPage() {
    const [stats, recentMedia] = await Promise.all([
        getGalleryStats(),
        getRecentMedia(8),
    ])

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Gallery</h1>
                    <p className='text-muted-foreground'>
                        Manage your media library and before/after comparisons
                    </p>
                </div>
                <Button asChild>
                    <Link href='/gallery/media/new'>
                        <Plus className='mr-2 h-4 w-4' />
                        Upload Media
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
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

            {/* Recent Uploads */}
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
                    {recentMedia.length === 0 ? (
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
                                            sizes='150px'
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

            {/* Quick Actions */}
            <div className='grid gap-4 md:grid-cols-3'>
                <QuickActionCard
                    title='Upload Media'
                    description='Add new images or videos to your gallery'
                    href='/gallery/media/new'
                    icon={<Plus className='h-5 w-5' />}
                />
                <QuickActionCard
                    title='Create Group'
                    description='Organize media into collections'
                    href='/gallery/groups'
                    icon={<FolderOpen className='h-5 w-5' />}
                />
                <QuickActionCard
                    title='Add Before/After'
                    description='Create a new transformation comparison'
                    href='/gallery/before-after'
                    icon={<GitCompareArrows className='h-5 w-5' />}
                />
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

function QuickActionCard({
    title,
    description,
    href,
    icon,
}: {
    title: string
    description: string
    href: string
    icon: React.ReactNode
}) {
    return (
        <Link href={href}>
            <Card className='transition-colors hover:bg-stone-50'>
                <CardContent className='flex items-center gap-4 p-6'>
                    <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg'>
                        {icon}
                    </div>
                    <div>
                        <h3 className='font-medium'>{title}</h3>
                        <p className='text-muted-foreground text-sm'>
                            {description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
